from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import subprocess
import os
from dotenv import load_dotenv
import asyncio
import logging

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the DeepAI API key from the environment variable
api_key = os.getenv('OPENAI_API_KEY')

# Validate the presence of the API key
if not api_key:
    raise EnvironmentError("OPENAI_API_KEY is missing from the environment variables.")

openai.api_key = api_key

app = FastAPI()

# Model to handle AI prompt input
class AIPrompt(BaseModel):
    prompt: str

# Model for handling code execution input
class CodeExecution(BaseModel):
    code: str

@app.post("/api/ai")
async def get_ai_response(prompt: AIPrompt):
    try:
        response = openai.Completion.create(
            engine="text-davinci-003", 
            prompt=prompt.prompt,
            max_tokens=100
        )
        return {"response": response.choices[0].text.strip()}
    except openai.error.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid DeepAI API Key")
    except openai.error.DeepAIError as e:
        logger.error(f"DeepAI Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI Error: {str(e)}")
    except Exception as e:
        logger.exception("Internal Error")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Use asyncio for non-blocking code execution
async def run_code_subprocess(code: str):
    try:
        process = await asyncio.create_subprocess_exec(
            "python", "-c", code,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        return {"output": stdout.decode().strip(), "error": stderr.decode().strip()}
    except Exception as e:
        logger.error(f"Error running code: {str(e)}")
        return {"error": str(e)}

@app.post("/api/run-code")
async def run_code(code: CodeExecution):
    if not code.code:
        raise HTTPException(status_code=400, detail="Code input cannot be empty.")
    
    dangerous_keywords = ["import os", "import sys", "exec", "eval", "open"]
    if any(keyword in code.code for keyword in dangerous_keywords):
        raise HTTPException(status_code=400, detail="Dangerous code detected.")
    
    logger.info("Running code...")
    result = await run_code_subprocess(code.code)
    
    return result