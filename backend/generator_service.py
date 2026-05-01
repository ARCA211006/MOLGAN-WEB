import torch
import numpy as np
import base64
import os
import sys
from io import BytesIO
from rdkit import Chem
from rdkit.Chem import QED, Descriptors, Draw, RDConfig
from rdkit import RDLogger

# Add parent directory to path to import config and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from models.generator import Generator
from data.graph_utils import graph_to_mol

# Silence RDKit warnings
RDLogger.DisableLog('rdApp.*')

# Setup SA Scorer
try:
    sys.path.append(os.path.join(RDConfig.RDContribDir, 'SA_Score'))
    import sascorer
except ImportError:
    sascorer = None

class GeneratorService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.generator = self._load_model()
        
    def _load_model(self):
        gen = Generator(
            Config.LATENT_DIM,
            Config.CONDITION_DIM,
            Config.NUM_NODES,
            Config.NODE_DIM,
            Config.EDGE_DIM
        ).to(self.device)
        
        if not os.path.exists(Config.BEST_MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {Config.BEST_MODEL_PATH}")
            
        checkpoint = torch.load(Config.BEST_MODEL_PATH, map_location=self.device, weights_only=False)
        gen.load_state_dict(checkpoint["generator"])
        gen.eval()
        return gen

    def calculate_sa(self, mol):
        if sascorer:
            try:
                return sascorer.calculateScore(mol)
            except:
                return 5.0  # Default middle value
        return 5.0

    def mol_to_base64(self, mol):
        try:
            img = Draw.MolToImage(mol, size=(300, 300))
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
        except:
            return ""

    def generate(self, target_qed=0.3, target_logp=None, target_sa=None, count=10):
        # We generate a larger batch and filter/sort to find the best matches
        batch_size = 100
        z = torch.randn(batch_size, Config.LATENT_DIM).to(self.device)
        
        # Prepare condition vector [qed, logp, sa]
        # Since the model was trained with normalized weights, we map them here
        cond_val = [target_qed, 
                    1.0 if target_logp is not None else 0.0, 
                    1.0 if target_sa is not None else 0.0]
        
        condition = torch.tensor([cond_val] * batch_size, dtype=torch.float32).to(self.device)
        
        with torch.no_grad():
            edge_adj, node_feat = self.generator(z, condition, temperature=0.5, hard=True)
            
        ea_np = edge_adj.cpu().numpy()
        en_np = node_feat.cpu().numpy()
        
        results = []
        for i in range(batch_size):
            mol = graph_to_mol(ea_np[i], en_np[i])
            if mol:
                try:
                    smi = Chem.MolToSmiles(mol)
                    curr_qed = QED.qed(mol)
                    curr_logp = Descriptors.MolLogP(mol)
                    curr_sa = self.calculate_sa(mol)
                    
                    # Compute score for sorting (lower is better match)
                    score = abs(curr_qed - target_qed)
                    if target_logp is not None:
                        score += abs(curr_logp - target_logp) * 0.1
                    if target_sa is not None:
                        score += abs(curr_sa - target_sa) * 0.1
                        
                    results.append({
                        "smiles": smi,
                        "qed": round(float(curr_qed), 3),
                        "logp": round(float(curr_logp), 3),
                        "sa": round(float(curr_sa), 3),
                        "image": self.mol_to_base64(mol),
                        "score": score
                    })
                except:
                    continue
        
        # Sort by score and take requested count
        results.sort(key=lambda x: x["score"])
        return results[:count]

generator_service = GeneratorService()
