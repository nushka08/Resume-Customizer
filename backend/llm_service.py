import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

PROMPT_TEMPLATE = """
You are an expert technical resume strategist and ATS consultant.
Analyze the following Job Description (JD) and Candidate Resume text.
Your task is to tailor the candidate's resume specifically for this job description while remaining truthful to their background.

### Instructions:
1. Rewrite the Professional Summary/Objective to strongly target the JD's requirements.
2. Group and highlight relevant skills found in the resume matching the JD.
3. Rephrase and reorder work experience bullets to incorporate relevant keywords and highlight impactful achievements.
4. Identify critical missing keywords or tools from the JD that are NOT present in the candidate's resume.
5. Provide a Match Score between 0 and 100 indicating the degree of alignment.

### Candidate Resume:
{resume_text}

### Job Description:
{job_description}

### Output Format:
Return ONLY valid JSON matching this exact structure:
{{
  "match_score": 85,
  "summary": "...",
  "skills": ["Skill 1", "Skill 2"],
  "tailored_experience": [
    {{
      "role": "Title at Company",
      "bullet_points": ["bullet 1", "bullet 2"]
    }}
  ],
  "missing_keywords": ["keyword 1", "keyword 2"],
  "full_markdown_resume": "# Tailored Resume\\n\\n## Professional Summary\\n...\\n\\n## Technical Skills\\n...\\n\\n## Experience\\n..."
}}
"""

def generate_customized_resume(resume_text: str, job_description: str) -> dict:
    if not client:
        raise ValueError("GEMINI_API_KEY is not set in backend .env file.")

    prompt = PROMPT_TEMPLATE.format(
        resume_text=resume_text,
        job_description=job_description
    )

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"Attempting inference with model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            print(f"Success with {model_name}!")
            return json.loads(response.text)
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            last_error = e
            continue

    raise ValueError(f"All model attempts failed. Last error: {str(last_error)}")