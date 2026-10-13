import os
import json
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

PROMPT_TEMPLATE = """
You are an expert ATS resume reviewer and career coach.
Analyze the following candidate resume text against the provided job description.

Candidate Resume:
\"\"\"
{resume_text}
\"\"\"

Target Job Description:
\"\"\"
{job_description}
\"\"\"

Provide your analysis strictly in valid JSON matching the following structure:
{{
  "match_score": <integer from 0 to 100 representing how well the candidate fits the requirements>,
  "missing_keywords": [<list of crucial skills, technologies, or keywords present in the job description but omitted or weak in the resume>],
  "summary": "<a concise, ATS-tailored professional summary emphasizing relevance to this target role>",
  "skills": [<list of core matching technical and professional skills aligned with the role>],
  "tailored_experience": [
    {{
      "role": "<company or title as stated on resume>",
      "bullet_points": [
        "<action-driven, achievement-focused bullet point emphasizing target JD keywords>",
        "<another tailored bullet point>"
      ]
    }}
  ],
  "full_markdown_resume": "<a complete, professionally formatted markdown version of the customized resume>"
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
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]

    last_error = None
    for model_name in models_to_try:
        for attempt in range(2):
            try:
                print(f"Attempting inference with model: {model_name} (attempt {attempt + 1})...")
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
                err_str = str(e)
                print(f"Model {model_name} attempt {attempt + 1} failed: {err_str}")
                last_error = e
                if "503" in err_str or "UNAVAILABLE" in err_str:
                    time.sleep(2)
                    continue
                break

    raise ValueError(f"All model attempts failed. Last error: {str(last_error)}")