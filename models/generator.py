import torch
import torch.nn as nn
import torch.nn.functional as F

def gumbel_softmax(logits, temperature=1.0, hard=False):
    gumbel_noise = -torch.log(-torch.log(torch.rand_like(logits).clamp(1e-20)))
    y      = (logits + gumbel_noise) / temperature
    y_soft = F.softmax(y, dim=-1)
    if hard:
        index  = y_soft.argmax(dim=-1, keepdim=True)
        y_hard = torch.zeros_like(y_soft).scatter_(-1, index, 1.0)
        return y_hard - y_soft.detach() + y_soft
    return y_soft

class Generator(nn.Module):
    def __init__(self, latent_dim, condition_dim, num_nodes, node_dim, edge_dim):
        super().__init__()
        self.num_nodes  = num_nodes
        self.node_dim   = node_dim
        self.edge_dim   = edge_dim

        # NEW: input is now latent_dim + condition_dim
        input_dim = latent_dim + condition_dim

        self.fc = nn.Sequential(
            nn.Linear(input_dim, 128), nn.Tanh(),
            nn.Linear(128, 256),       nn.Tanh(),
            nn.Linear(256, 512),       nn.Tanh(),
        )
        self.adj_out  = nn.Linear(512, num_nodes * num_nodes * edge_dim)
        self.node_out = nn.Linear(512, num_nodes * node_dim)
        self.dropout  = nn.Dropout(p=0.1)

    def forward(self, z, condition, temperature=1.0, hard=False):
        # NEW: concatenate noise + condition before passing to MLP
        x     = torch.cat([z, condition], dim=-1)
        h     = self.dropout(self.fc(x))
        adj   = self.adj_out(h).view(-1, self.num_nodes, self.num_nodes, self.edge_dim)
        adj   = (adj + adj.permute(0, 2, 1, 3)) / 2
        adj   = gumbel_softmax(adj, temperature=temperature, hard=hard)
        nodes = self.node_out(h).view(-1, self.num_nodes, self.node_dim)
        nodes = gumbel_softmax(nodes, temperature=temperature, hard=hard)
        return adj, nodes
