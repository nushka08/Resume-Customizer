from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_resume_text
from llm_service import generate_customized_resume

app = FastAPI(title="AI Resume Customizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Resume Customizer API"}

@app.post("/api/customize")
async def customize_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not job_description or len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description must be provided and contain at least 50 characters."
        )

    file_bytes = await resume.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        resume_text = extract_resume_text(resume.filename, file_bytes)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing error: {str(e)}")

    if len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient text from the uploaded resume. Ensure the file contains readable text."
        )

    try:
        result = generate_customized_resume(resume_text, job_description)
        return {
            "success": True,
            "filename": resume.filename,
            "file_size": len(file_bytes),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
