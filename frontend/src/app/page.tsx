'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ExperienceItem {
  role: string;
  bullet_points: string[];
}

interface CustomizerResult {
  match_score: number;
  summary: string;
  skills: string[];
  tailored_experience: ExperienceItem[];
  missing_keywords: string[];
  full_markdown_resume: string;
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomizerResult | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(selected.type) && !selected.name.match(/\.(pdf|docx)$/i)) {
        setError('Please upload a valid PDF or DOCX file.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      setError('Job description must be at least 40 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/customize`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to process resume');
      }

      setResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.full_markdown_resume) return;
    const blob = new Blob([result.full_markdown_resume], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tailored_resume.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            AI-Powered Tool
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Resume Customizer
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Upload your resume and paste any Job Description to generate a tailored, ATS-optimized version with aligned keywords.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                1. Upload Resume (PDF or DOCX)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-file" className="cursor-pointer space-y-2 block">
                  <div className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {file ? 'Change selected file' : 'Click to select file'}
                  </div>
                  <p className="text-xs text-slate-500">Supports .pdf and .docx</p>
                </label>
                {file && (
                  <div className="mt-3 text-xs bg-blue-50 text-blue-800 py-1.5 px-3 rounded-lg inline-block font-mono">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            {/* Job Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                2. Job Description
              </label>
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description requirements here..."
                className="w-full text-sm rounded-xl border border-slate-300 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
            >
              {loading ? 'Tailoring with Gemini...' : 'Customize Resume'}
            </button>
          </div>
        </form>

        {/* Results Display */}
        {result && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Customized Output</h2>
                <p className="text-xs text-slate-500">Review recommendations and download below</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  Match Score: {result.match_score}%
                </div>
                <button
                  onClick={handleDownload}
                  className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Download (.md)
                </button>
              </div>
            </div>

            {/* Missing Keywords Box */}
            {result.missing_keywords && result.missing_keywords.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Missing Keywords from JD
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.missing_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="cursor-pointer text-xs bg-white text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Targeted Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Tailored Professional Summary
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Matched Skills */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Key Matched Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="cursor-pointer text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Formatted Experience Bullets */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Rephrased Experience Bullets
              </h3>
              <div className="space-y-3">
                {result.tailored_experience.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-sm font-bold text-slate-800">{item.role}</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {item.bullet_points.map((pt, pIdx) => (
                        <li key={pIdx} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
