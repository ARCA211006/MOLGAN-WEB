import torch
import numpy as np
from rdkit import Chem
from rdkit.Chem import QED
from config import Config
from data.graph_utils import graph_to_mol

def random_condition(batch_size, device):
    """
    Creates random conditions during training so model
    learns ALL types of molecules.
    """
    cond = torch.rand(batch_size, Config.CONDITION_DIM).to(device)
    return cond

def compute_gradient_penalty(discriminator, real_adj, real_nodes, fake_adj, fake_nodes, condition, device):
    alpha = torch.rand(real_adj.size(0), 1, 1, 1).to(device)
    
    interp_adj   = (alpha * real_adj + 
                   (1 - alpha) * fake_adj).requires_grad_(True)
    interp_nodes = (alpha.squeeze(-1) * real_nodes + 
                   (1 - alpha.squeeze(-1)) * fake_nodes).requires_grad_(True)

    d_interp = discriminator(interp_adj, interp_nodes, condition)

    gradients = torch.autograd.grad(
        outputs=d_interp,
        inputs=[interp_adj, interp_nodes],
        grad_outputs=torch.ones_like(d_interp),
        create_graph=True,
        retain_graph=True
    )

    grad_adj   = gradients[0].reshape(real_adj.size(0), -1)
    grad_nodes = gradients[1].reshape(real_adj.size(0), -1)
    grad_norm  = torch.cat([grad_adj, grad_nodes], dim=1).norm(2, dim=1)
    penalty    = ((grad_norm - 1) ** 2).mean()
    return penalty

def evaluate(generator, n_samples=100, temperature=0.5, device='cpu'):
    """
    Tests how good the model is
    """
    generator.eval()
    valid_mols = []
    smiles_set = set()

    with torch.no_grad():
        z    = torch.randn(n_samples, Config.LATENT_DIM).to(device)
        cond = torch.ones(n_samples, Config.CONDITION_DIM).to(device) / Config.CONDITION_DIM
        ea, en = generator(z, cond, temperature=temperature, hard=True)

    ea_np = ea.cpu().numpy()
    en_np = en.cpu().numpy()

    for i in range(n_samples):
        mol = graph_to_mol(ea_np[i], en_np[i])
        if mol is not None:
            smi = Chem.MolToSmiles(mol)
            valid_mols.append(mol)
            smiles_set.add(smi)

    validity   = len(valid_mols) / n_samples * 100
    uniqueness = len(smiles_set) / max(len(valid_mols), 1) * 100
    avg_qed    = float(np.mean([QED.qed(m) for m in valid_mols])) if valid_mols else 0.0

    generator.train()
    return validity, uniqueness, avg_qed, len(smiles_set)
