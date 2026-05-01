import re

def parse_prompt(prompt: str):
    """
    SIMPLE REGEX-based parsing (NO AI, NO LLM)
    Extracts: QED, logP, SA, and Count
    """
    prompt = prompt.lower()
    
    # Default values
    qed = 0.3
    logp = None
    sa = None
    count = 10
    
    # 1. QED (qed 0.5, qed=0.5, qed:0.5)
    qed_match = re.search(r"qed[:=\s]+(\d*\.?\d+)", prompt)
    if qed_match:
        qed = float(qed_match.group(1))
        
    # 2. logP (logp 2.0)
    logp_match = re.search(r"logp[:=\s]+([-+]?\d*\.?\d+)", prompt)
    if logp_match:
        logp = float(logp_match.group(1))
        
    # 3. SA (easy/hard synthesis)
    if "easy synthesis" in prompt:
        sa = 3.0
    elif "hard synthesis" in prompt:
        sa = 6.0
        
    # 4. Count (generate 10 molecules, 10 molecules)
    count_match = re.search(r"(\d+)\s+molecule", prompt)
    if count_match:
        count = int(count_match.group(1))
    elif "generate" in prompt:
        gen_count_match = re.search(r"generate\s+(\d+)", prompt)
        if gen_count_match:
            count = int(gen_count_match.group(1))
            
    return {
        "qed": qed,
        "logp": logp,
        "sa": sa,
        "count": count
    }
