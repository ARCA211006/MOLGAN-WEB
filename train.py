import torch
import torch.nn.functional as F
import os
import time
import numpy as np

from config import Config
from models.generator import Generator
from models.discriminator import Discriminator
from models.reward_network import RewardNetwork
from data.preprocessing import load_and_preprocess_data
from data.graph_utils import compute_rewards
from utils import random_condition, compute_gradient_penalty, evaluate

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Ensure directories exist
    os.makedirs(Config.MODELS_DIR, exist_ok=True)

    # Load dataloader
    dataloader, dataset_size = load_and_preprocess_data(Config.DATASET_PATH)
    
    # Init Models
    generator = Generator(Config.LATENT_DIM, Config.CONDITION_DIM,
                          Config.NUM_NODES, Config.NODE_DIM, Config.EDGE_DIM).to(device)
    discriminator = Discriminator(Config.NODE_DIM, Config.EDGE_DIM, Config.CONDITION_DIM).to(device)
    reward_net = RewardNetwork(Config.NUM_NODES, Config.NODE_DIM, Config.EDGE_DIM).to(device)

    # Optimizers
    g_optimizer = torch.optim.Adam(generator.parameters(), lr=5e-4, betas=(0.5, 0.9))
    d_optimizer = torch.optim.Adam(discriminator.parameters(), lr=1e-4, betas=(0.5, 0.9))
    r_optimizer = torch.optim.Adam(reward_net.parameters(), lr=1e-3)

    g_scheduler = torch.optim.lr_scheduler.StepLR(g_optimizer, step_size=50, gamma=0.5)
    d_scheduler = torch.optim.lr_scheduler.StepLR(d_optimizer, step_size=50, gamma=0.5)

    best_validity = 0.0
    best_ckpt = None
    history = {"d_loss": [], "g_loss": [], "r_loss": [], "validity": [], "uniqueness": [], "qed": []}

    temperature = 1.0
    temp_min = 0.5
    temp_decay = 0.005

    print("=" * 60)
    print(" CONDITIONAL MOLGAN TRAINING")
    print("=" * 60)

    for epoch in range(1, Config.EPOCHS + 1):
        epoch_start = time.time()
        is_pretrain = epoch <= Config.PRETRAIN_EPOCHS
        phase = "pretrain" if is_pretrain else "GAN+RL"

        d_losses = []
        g_losses = []
        r_losses = []

        temperature = max(temp_min, 1.0 - temp_decay * epoch)

        for real_adj, real_nodes in dataloader:
            real_adj = real_adj.float().to(device)
            real_nodes = real_nodes.float().to(device)
            batch_size = real_adj.size(0)

            condition = random_condition(batch_size, device)

            # 1. Train Discriminator
            for _ in range(Config.CRITIC_STEPS):
                z = torch.randn(batch_size, Config.LATENT_DIM).to(device)
                fake_adj, fake_nodes = generator(z, condition, temperature=temperature, hard=False)

                real_score = discriminator(real_adj, real_nodes, condition)
                fake_score = discriminator(fake_adj.detach(), fake_nodes.detach(), condition)

                gp = compute_gradient_penalty(discriminator, real_adj, real_nodes,
                                              fake_adj.detach(), fake_nodes.detach(), condition, device)
                d_loss = fake_score.mean() - real_score.mean() + Config.LAMBDA_GP * gp

                d_optimizer.zero_grad()
                d_loss.backward()
                d_optimizer.step()
                d_losses.append(d_loss.item())

            # 2. Train Reward Network
            z = torch.randn(batch_size, Config.LATENT_DIM).to(device)
            fake_adj, fake_nodes = generator(z, condition, temperature=temperature, hard=False)

            cond_np = condition.cpu().detach().numpy()
            ea_np = fake_adj.cpu().detach().numpy()
            en_np = fake_nodes.cpu().detach().numpy()

            real_rewards = [compute_rewards(ea_np[i], en_np[i], cond_np[i]) for i in range(batch_size)]
            real_rewards = torch.tensor(real_rewards, dtype=torch.float32).to(device).unsqueeze(1)

            pred_rewards = reward_net(fake_adj, fake_nodes)
            r_loss = F.mse_loss(pred_rewards, real_rewards)

            r_optimizer.zero_grad()
            r_loss.backward()
            r_optimizer.step()
            r_losses.append(r_loss.item())

            # 3. Train Generator
            z = torch.randn(batch_size, Config.LATENT_DIM).to(device)
            fake_adj, fake_nodes = generator(z, condition, temperature=temperature, hard=False)

            fake_score = discriminator(fake_adj, fake_nodes, condition)
            wgan_loss = -fake_score.mean()

            if is_pretrain:
                g_loss = wgan_loss
            else:
                pred_r = reward_net(fake_adj, fake_nodes)
                rl_loss = -pred_r.mean()
                g_loss = Config.LAMBDA * wgan_loss + (1 - Config.LAMBDA) * rl_loss

            g_optimizer.zero_grad()
            g_loss.backward()
            g_optimizer.step()
            g_losses.append(g_loss.item())

        g_scheduler.step()
        d_scheduler.step()

        avg_d = np.mean(d_losses)
        avg_g = np.mean(g_losses)
        avg_r = np.mean(r_losses)
        elapsed = time.time() - epoch_start

        history["d_loss"].append(avg_d)
        history["g_loss"].append(avg_g)
        history["r_loss"].append(avg_r)

        print(f"Epoch [{epoch:3d}/{Config.EPOCHS}] [{phase}] temp={temperature:.2f} "
              f"D:{avg_d:+.3f} G:{avg_g:+.3f} R:{avg_r:.4f} ({elapsed:.0f}s)")

        if epoch % Config.EVAL_EVERY == 0:
            validity, uniqueness, avg_qed, n_unique = evaluate(generator, device=device)
            history["validity"].append(validity)
            history["uniqueness"].append(uniqueness)
            history["qed"].append(avg_qed)

            marker = ""
            if validity > best_validity:
                best_validity = validity
                marker = "<-- best"
                best_ckpt = {
                    "epoch": epoch,
                    "generator": generator.state_dict(),
                    "discriminator": discriminator.state_dict(),
                    "reward_net": reward_net.state_dict(),
                    "validity": validity,
                    "qed": avg_qed
                }

            print(f"  Validity={validity:.1f}% Uniqueness={uniqueness:.1f}% "
                  f"QED={avg_qed:.3f} ({n_unique} unique) {marker}")

        if epoch % 25 == 0:
            ckpt_path = os.path.join(Config.MODELS_DIR, f"checkpoint_epoch_{epoch}.pt")
            torch.save({
                "epoch": epoch,
                "generator": generator.state_dict(),
                "discriminator": discriminator.state_dict(),
                "reward_net": reward_net.state_dict(),
                "condition_dim": Config.CONDITION_DIM,
                "history": history
            }, ckpt_path)
            print(f"  Checkpoint saved -> {ckpt_path}")

    if best_ckpt:
        torch.save(best_ckpt, Config.BEST_MODEL_PATH)
        print(f"\n Best model saved -> {Config.BEST_MODEL_PATH}")

if __name__ == "__main__":
    train()
