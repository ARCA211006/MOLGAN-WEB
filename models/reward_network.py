import torch
import torch.nn as nn
from models.discriminator import RelationalGCN

class RewardNetwork(nn.Module):
    def __init__(self, num_nodes, node_dim, edge_dim):
        super().__init__()
        self.gcn1  = RelationalGCN(node_dim, 64, edge_dim)
        self.gcn2  = RelationalGCN(64, 32, edge_dim)
        self.agg_i = nn.Linear(32, 128)
        self.agg_j = nn.Linear(32, 128)
        self.mlp   = nn.Sequential(
            nn.Linear(128, 128), nn.Tanh(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        
    def forward(self, adj, nodes):
        h    = self.gcn1(nodes, adj)
        h    = self.gcn2(h, adj)
        gate = torch.sigmoid(self.agg_i(h))
        feat = torch.tanh(self.agg_j(h))
        h_g  = torch.tanh((gate * feat).sum(dim=1))
        return self.mlp(h_g)
