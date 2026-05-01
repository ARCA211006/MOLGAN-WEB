import torch
import numpy as np
from rdkit import Chem
from rdkit.Chem import QED, Draw
import os

from config import Config
from models.generator import Generator
from data.graph_utils import graph_to_mol


# ===============================
# IMAGE SAVING FUNCTIONS
# ===============================

def save_images(mols, folder_name):
    os.makedirs(folder_name, exist_ok=True)

    for i, mol in enumerate(mols):
        try:
            img = Draw.MolToImage(mol, size=(300, 300))
            img.save(os.path.join(folder_name, f"mol_{i}.png"))
        except:
            continue


def save_grid(mols, path):
    try:
        img = Draw.MolsToGridImage(
            mols,
            molsPerRow=4,
            subImgSize=(200, 200)
        )
        img.save(path)
    except:
        pass


# ===============================
# MAIN GENERATION FUNCTION
# ===============================

def generate_molecules():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("=" * 60)
    print(" LOADING BEST MODEL")
    print("=" * 60)

    # Initialize generator
    generator = Generator(
        Config.LATENT_DIM,
        Config.CONDITION_DIM,
        Config.NUM_NODES,
        Config.NODE_DIM,
        Config.EDGE_DIM
    ).to(device)

    # Load model
    if not os.path.exists(Config.BEST_MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {Config.BEST_MODEL_PATH}")

    checkpoint = torch.load(
        Config.BEST_MODEL_PATH,
        map_location=device,
        weights_only=False
    )

    generator.load_state_dict(checkpoint["generator"])
    generator.eval()

    print(f"[OK] Best model loaded (from epoch {checkpoint.get('epoch', 'N/A')})")

    # ===============================
    # TEST CONDITIONS
    # ===============================
    test_conditions = {
        "Druglikeness_only_[1,0,0]": [1.0, 0.0, 0.0],
        "Solubility_only_[0,1,0]": [0.0, 1.0, 0.0],
        "Synthesizability_[0,0,1]": [0.0, 0.0, 1.0],
        "Drug_+_Soluble_[1,1,0]": [1.0, 1.0, 0.0],
        "All_properties_[1,1,1]": [1.0, 1.0, 1.0],
    }

    results = {}

    # ===============================
    # GENERATION LOOP
    # ===============================
    for cond_name, cond_values in test_conditions.items():

        valid_mols = []
        smiles_set = set()
        qed_scores = []

        with torch.no_grad():
            z = torch.randn(50, Config.LATENT_DIM).to(device)
            cond = torch.tensor([cond_values] * 50, dtype=torch.float32).to(device)

            edge_adj, node_feat = generator(z, cond, temperature=0.5, hard=True)

        ea_np = edge_adj.cpu().numpy()
        en_np = node_feat.cpu().numpy()

        for i in range(50):
            mol = graph_to_mol(ea_np[i], en_np[i])

            if mol is not None:
                smi = Chem.MolToSmiles(mol)

                valid_mols.append(mol)
                smiles_set.add(smi)
                qed_scores.append(QED.qed(mol))

        validity = len(valid_mols) / 50 * 100
        uniqueness = len(smiles_set) / max(len(valid_mols), 1) * 100
        avg_qed = float(np.mean(qed_scores)) if qed_scores else 0

        results[cond_name] = {
            "validity": validity,
            "uniqueness": uniqueness,
            "qed": avg_qed,
            "mols": [Chem.MolToSmiles(m) for m in valid_mols[:4]]
        }

        # ===============================
        # PRINT RESULTS
        # ===============================
        print(f"\nCondition : {cond_name}")
        print(f"  Validity   : {validity:.1f}%")
        print(f"  Uniqueness : {uniqueness:.1f}%")
        print(f"  Avg QED    : {avg_qed:.3f}")

        if results[cond_name]["mols"]:
            print(f"  Samples    : {results[cond_name]['mols']}")

        # ===============================
        # SAVE IMAGES
        # ===============================
        if valid_mols:
            folder_path = os.path.join("outputs", cond_name)
            save_images(valid_mols[:8], folder_path)
            save_grid(valid_mols[:8], os.path.join(folder_path, "grid.png"))

    print("\n" + "=" * 60)
    print(" GENERATION COMPLETE [OK]")
    print("=" * 60)


# ===============================
# ENTRY POINT
# ===============================

if __name__ == "__main__":
    generate_molecules()