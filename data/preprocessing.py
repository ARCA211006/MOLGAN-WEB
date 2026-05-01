import torch
from torch.utils.data import TensorDataset, DataLoader
from torch_geometric.data import Data
import random
from config import Config

def load_and_preprocess_data(dataset_path):
    torch.serialization.add_safe_globals([Data])
    
    # Load dataset
    dense_dataset = torch.load(dataset_path, weights_only=False)
    
    random.seed(42)
    subset = random.sample(dense_dataset, min(5000, len(dense_dataset)))
    
    adj_list   = [s[0] for s in subset]
    x_list     = [s[1] for s in subset]
    adj_tensor = torch.stack(adj_list)
    x_tensor   = torch.stack(x_list)
    
    torch_dataset = TensorDataset(adj_tensor, x_tensor)
    dataloader    = DataLoader(torch_dataset, batch_size=Config.BATCH_SIZE,
                               shuffle=True, drop_last=True)
                               
    return dataloader, len(subset)
