import torch
import torch.nn as nn

class RelationalGCN(nn.Module):
    def __init__(self, in_dim, out_dim, edge_dim):
        super().__init__()
        self.self_fc  = nn.Linear(in_dim, out_dim)
        self.edge_fcs = nn.ModuleList(
            [nn.Linear(in_dim, out_dim) for _ in range(edge_dim)]
        )

    def forward(self, h, adj):
        out = self.self_fc(h)
        for y in range(len(self.edge_fcs)):
            out = out + torch.einsum('bij,bjk->bik',
                        adj[:,:,:,y], self.edge_fcs[y](h))
        return torch.tanh(out)

class Discriminator(nn.Module):
    def __init__(self, node_dim, edge_dim, condition_dim):
        super().__init__()
        self.gcn1 = RelationalGCN(node_dim, 64, edge_dim)
        self.gcn2 = RelationalGCN(64, 32, edge_dim)

        # NEW: graph embedding(128) + condition(3)
        self.mlp  = nn.Sequential(
            nn.Linear(128 + condition_dim, 128), nn.Tanh(),
            nn.Linear(128, 1)
        )
        self.i_mlp = nn.Linear(32, 128)
        self.j_mlp = nn.Linear(32, 128)

    def forward(self, adj, nodes, condition):
        h = self.gcn1(nodes, adj)
        h = self.gcn2(h, adj)

        # graph-level representation
        graph_emb = torch.sigmoid(self.i_mlp(h)) * torch.tanh(self.j_mlp(h))
        graph_emb = torch.tanh(graph_emb.sum(dim=1))

        # NEW: concatenate graph embedding + condition
        combined = torch.cat([graph_emb, condition], dim=-1)
        return self.mlp(combined)
