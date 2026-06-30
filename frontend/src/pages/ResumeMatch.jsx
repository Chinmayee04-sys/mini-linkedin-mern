import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ResumeMatch() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useState(() => {
    if (!token) navigate("/login");
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/upload/resume", formData);
      setResumeText(res.data.text);
      if (!jobDesc.trim()) {
        setResult({
          matchPercent: null,
          matchedSkills: [],
          missingSkills: [],
          suggestedProjects: [],
          resumeSuggestions: [],
          resumeOnly: true,
          extractedSkills: extractSkillsFromText(res.data.text)
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const extractSkillsFromText = (text) => {
    const keywords = [
      "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
      "Spring Boot", "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust",
      "C++", "C#", "Ruby", "PHP", "SQL", "PostgreSQL", "MongoDB", "MySQL",
      "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
      "GraphQL", "REST", "API", "HTML", "CSS", "Tailwind", "Bootstrap",
      "Git", "CI/CD", "Jest", "Cypress", "Machine Learning",
      "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Linux",
      "Nginx", "RabbitMQ", "Kafka", "WebSocket", "OAuth", "JWT"
    ];
    const lower = text.toLowerCase();
    return keywords.filter(kw => lower.includes(kw.toLowerCase()));
  };

  const analyze = async () => {
    if (!jobDesc.trim() && !resumeText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      if (!jobDesc.trim() && resumeText.trim()) {
        const skills = extractSkillsFromText(resumeText);
        setResult({
          matchPercent: null,
          matchedSkills: skills,
          missingSkills: [],
          suggestedProjects: [],
          resumeSuggestions: ["Add a job description to see how your resume matches against specific requirements."],
          resumeOnly: true,
          extractedSkills: skills
        });
        setLoading(false);
        return;
      }
      const res = await api.post("/match/analyze", { jobDescription: jobDesc, resumeText: resumeText.trim() || undefined }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const matchColor = (p) => {
    if (p >= 80) return "text-green-600";
    if (p >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const matchBg = (p) => {
    if (p >= 80) return "bg-green-100 border-green-300";
    if (p >= 60) return "bg-yellow-100 border-yellow-300";
    return "bg-red-100 border-red-300";
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Resume vs Job Match</h1>
          <p className="text-sm text-gray-500 mb-6">Paste a job description and add your resume to get a detailed match analysis.</p>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={8}
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none" />

          <div className="mt-4">
            <button onClick={() => setShowResume(!showResume)}
              className="flex items-center gap-2 text-sm text-[#0a66c2] font-medium hover:text-[#004182] transition-colors cursor-pointer">
              <span className="text-lg">{showResume ? "▾" : "▸"}</span>
              {showResume ? "Hide resume editor" : "📄 Add Resume"}
            </button>

            {showResume && (
              <div className="mt-3 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98]">
                    {uploading ? "⏳ Uploading..." : "📤 Upload Resume"}
                  </button>
                  {resumeFile && <span className="text-xs text-gray-500">{resumeFile.name}</span>}
                </div>
                <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6}
                  placeholder="Or paste your resume content directly here..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-green-50 hover:bg-white resize-none" />
                <p className="text-xs text-gray-400">{resumeText.length > 0 ? `${resumeText.length} characters extracted` : "Upload a PDF, DOCX, or TXT file, or paste your resume text directly."}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">{jobDesc.length} characters in job description</p>
            <button onClick={analyze} disabled={(!jobDesc.trim() && !resumeText.trim()) || loading}
              className="bg-[#0a66c2] text-white font-medium px-6 py-2.5 rounded-full hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md">
              {loading ? "Analyzing..." : jobDesc.trim() ? "Analyze Match" : "Analyze Resume"}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4 animate-fadeIn">
            {result.matchPercent !== null ? (
              <div className={`rounded-xl border-2 p-8 text-center ${matchBg(result.matchPercent)}`}>
                <p className="text-sm font-medium text-gray-600 mb-1">Resume Match</p>
                <p className={`text-5xl font-bold ${matchColor(result.matchPercent)}`}>{result.matchPercent}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 max-w-xs mx-auto">
                  <div className={`h-2.5 rounded-full transition-all duration-1000 ${result.matchPercent >= 80 ? "bg-green-500" : result.matchPercent >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${result.matchPercent}%` }} />
                </div>
                {result.source === "both" && <p className="text-xs text-gray-400 mt-2">Based on profile skills + resume text</p>}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
                <p className="text-lg mb-1">📄 Resume Analyzed</p>
                <p className="text-sm text-gray-600">Detected <strong>{result.extractedSkills?.length || 0}</strong> skills in your resume</p>
                <p className="text-xs text-gray-400 mt-2">Add a job description above and click "Analyze Match" for a full comparison.</p>
              </div>
            )}

            {result.matchedSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-green-500 rounded-full inline-block" /> Matched Skills ✅</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((s, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.resumeOnly && result.extractedSkills?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-blue-500 rounded-full inline-block" /> Skills Detected in Resume</h3>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-red-500 rounded-full inline-block" /> Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full border border-red-200 flex items-center gap-1">
                      <span>✕</span> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestedProjects.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-purple-500 rounded-full inline-block" /> Projects to Add</h3>
                <div className="space-y-2">
                  {result.suggestedProjects.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="w-7 h-7 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.skill}</p>
                        <p className="text-xs text-gray-500">{p.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> Suggested Resume Changes</h3>
              <ul className="space-y-2">
                {result.resumeSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0a66c2] mt-0.5 shrink-0">▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeMatch;
