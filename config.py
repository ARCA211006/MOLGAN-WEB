import os

class Config:
    # Model parameters
    LATENT_DIM = 32
    CONDITION_DIM = 3
    NUM_NODES = 9
    NODE_DIM = 5
    EDGE_DIM = 4

    # Training hyperparameters
    EPOCHS = 300
    CRITIC_STEPS = 5
    LAMBDA_GP = 10
    BATCH_SIZE = 64
    EVAL_EVERY = 10

    
    PRETRAIN_EPOCHS = 150
    LAMBDA = 0.7

    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    DATA_DIR = os.path.join(BASE_DIR, "data")
    BEST_MODEL_PATH = os.path.join(MODELS_DIR, "best_model.pt")
    
    # Dataset
    DATASET_PATH = "/kaggle/input/datasets/harinigongalla/molgan-dataset/molgan_dataset.pt"
