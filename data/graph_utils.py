import numpy as np
from rdkit import Chem
from rdkit.Chem import QED, Descriptors
from rdkit.Chem import RDConfig
from rdkit import RDLogger
import os, sys

# Silence RDKit warnings
RDLogger.DisableLog('rdApp.*')

# Import sascorer
sys.path.append(os.path.join(RDConfig.RDContribDir, 'SA_Score'))
import sascorer

# Atom mapping
# index 0=C, 1=N, 2=O, 3=F, 4=padding
ATOM_MAP = {0: 6, 1: 7, 2: 8, 3: 9, 4: 0}

# Bond mapping
# index 0=no bond, 1=single, 2=double, 3=triple
BOND_MAP = {
    1: Chem.rdchem.BondType.SINGLE,
    2: Chem.rdchem.BondType.DOUBLE,
    3: Chem.rdchem.BondType.TRIPLE,
}

# Maximum bonds each atom can make
MAX_VALENCE = {6: 4, 7: 3, 8: 2, 9: 1}

def graph_to_mol(adj_np, node_np):
    """
    Convert graph → RDKit molecule
    
    adj_np  : shape (9, 9, 4)
              4 channels = [no_bond, single, double, triple]
    node_np : shape (9, 5)
              5 channels = [C, N, O, F, padding]
    """
    try:
        mol          = Chem.RWMol()
        atomic_nums  = []
        valence_used = [0] * 9

        # Step 1: Add atoms
        for node in node_np:
            atom_type = int(np.argmax(node))
            an        = ATOM_MAP[atom_type]
            mol.AddAtom(Chem.Atom(an))
            atomic_nums.append(an)

        # Step 2: Collect bond candidates
        candidates = []
        for ii in range(9):
            for jj in range(ii + 1, 9):
                bond_probs = adj_np[ii, jj]
                bc         = int(np.argmax(bond_probs))
                prob       = bond_probs[bc]
                if bc > 0 and prob > 0.5:
                    candidates.append((prob, bc, ii, jj))

        # Sort by probability - strongest bonds first
        candidates.sort(reverse=True)

        # Step 3: Add bonds
        for prob, bc, ii, jj in candidates:
            if atomic_nums[ii] == 0 or atomic_nums[jj] == 0:
                continue
            max_v_ii = MAX_VALENCE.get(atomic_nums[ii], 4)
            max_v_jj = MAX_VALENCE.get(atomic_nums[jj], 4)
            if valence_used[ii] + bc <= max_v_ii and \
               valence_used[jj] + bc <= max_v_jj:
                mol.AddBond(ii, jj, BOND_MAP[bc])
                valence_used[ii] += bc
                valence_used[jj] += bc

        # Step 4: Sanitize molecule
        Chem.SanitizeMol(mol)

        # Step 5: Get largest connected fragment
        frags   = Chem.GetMolFrags(mol, asMols=True)
        if not frags:
            return None
        largest = max(frags, key=lambda m: m.GetNumAtoms())

        if largest.GetNumAtoms() < 2:
            return None

        return largest

    except Exception:
        return None

def compute_rewards(adj_np, node_np, condition):
    """
    Compute reward based on user condition.
    
    condition = [druglikeness_weight,
                 solubility_weight,
                 synthesizability_weight]
    """
    mol = graph_to_mol(adj_np, node_np)
    if mol is None:
        return 0.0

    try:
        qed_score = QED.qed(mol)          # 0 to 1
        logp      = Descriptors.MolLogP(mol)
        sol_score = float(np.clip(1 - abs(logp - 0.5) / 4, 0, 1))
        sa        = sascorer.calculateScore(mol)
        sa_score  = float(np.clip((10 - sa) / 9, 0, 1))

        w_drug       = float(condition[0])
        w_sol        = float(condition[1])
        w_sa         = float(condition[2])
        total_weight = w_drug + w_sol + w_sa

        if total_weight == 0:
            total_weight = 1.0

        reward = (w_drug * qed_score +
                  w_sol  * sol_score  +
                  w_sa   * sa_score) / total_weight

        return float(np.clip(reward, 0, 1))

    except Exception:
        return 0.0
