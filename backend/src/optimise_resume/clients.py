import os

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from dotenv import load_dotenv

def get_model(model_name):
    load_dotenv()

    if 'gpt' in model_name:
        model = ChatOpenAI(model=model_name, temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
    elif 'claude' in model_name:
        model = ChatAnthropic(model=model_name, temperature=0, api_key=os.getenv("ANTHROPIC_API_KEY"))
    else:
        raise ValueError(f"Unknown model: {model_name}")
    return model