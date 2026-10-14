# AI powered Resume Customizer
This is a full stack web application that takes a candidate's resume (PDF or DOCX) and a job description (JD) using LLM to align the resume, highlights missing keywords, rewrites the summary and experience bullets, calculates a match score and allows export of an ATS optimized tailored resume in PDF.


## Live link & Repository:
1. Live Link: https://resume-customizer-ai-app.vercel.app/
2. GitHub Repository: https://github.com/nushka08/Resume-Customizer


## Tech Stack:

| Layer | Technology | 
|---|---|
| Frontend | Next.js + React |
| Backend | Python 3.11 + Fast API |
| Document Parsing | PyPDF & python-docx |
| LLM Provider | Google Gemini API |
| Hosting | Vercel & Render |


## Features
### Core Capabilities


## Project Structure

Resume_Customizer/
|----README.md
|----.gitignore
|-----backend/
|      |-----main.py
|      |-----parser.py
|      |-----llm_service.py
|      |-----requirements.txt
|      |-----.env
|      |-----.env.example
|
|
|-----frontend/
      |-----src
      |     |---app
      |        |-----layout.tsx
      |        |-----page.tsx
      |        |-----globals.css
      |       
      |-----package.json
      |-----tsconfig.json
      |-----.env.example
      |-----.env.local


## Setup & Installation

### Prerequisites
1. Python 3.10+ installed  
2. Node.js 18+ and npm installed  
3. A Google AI Studio API Key from aistudio.google.com  

### 1. Backend
cd backend
#### create virtual env
python -m venv venv
#### activate venv
venv\Scripts\activate
#### install dependencies
pip install -r requirements.txt
#### in .env replace with your api key
#### start FastAPI local server
uvicorn main:app --reload --port 8000

### 2. Frontend
#### open separate terminal for frontend
cd frontend  
npm install  
npm run dev  
Open your browser at https://localhost:3000  

## Deployment Guide
### Backend on Render
set root dir to backend  
runtime: Python 3  
build command: pip install -r requirements.txt  
start command: uvicorn main:app --host 0.0.0.0 --port $PORT  
env variable--- GEMINI_API_KEY= your_key  

### Frontend on Vercel
root dir: frontend  
framework preset: Next.js  
env variable--- NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com  
Deploy.

## Author
### Anushka Mishra
Linkedin: https://linkedin.com/in/anushka-mishra-  
GitHub: https://github.com/nushka08

