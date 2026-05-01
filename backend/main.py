from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .nlp_parser import parse_prompt
from .generator_service import generator_service

app = FastAPI(title="MolGAN API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

class MoleculeResponse(BaseModel):
    smiles: str
    qed: float
    logp: float
    sa: float
    image: str

class GenerationResponse(BaseModel):
    molecules: List[MoleculeResponse]

@app.get("/")
async def root():
    return {"status": "MolGAN API is running"}

@app.post("/generate/prompt", response_model=GenerationResponse)
async def generate_from_prompt(request: PromptRequest):
    try:
        # 1. Parse NLP
        params = parse_prompt(request.prompt)
        
        # 2. Generate Molecules
        molecules = generator_service.generate(
            target_qed=params["qed"],
            target_logp=params["logp"],
            target_sa=params["sa"],
            count=params["count"]
        )
        
        # 3. Format Response
        formatted_mols = []
        for m in molecules:
            formatted_mols.append(MoleculeResponse(
                smiles=m["smiles"],
                qed=m["qed"],
                logp=m["logp"],
                sa=m["sa"],
                image=m["image"]
            ))
            
        return GenerationResponse(molecules=formatted_mols)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
