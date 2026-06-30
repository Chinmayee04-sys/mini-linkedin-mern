import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProjectVerification() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [myProjects, setMyProjects] = useState([]);

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await api.get("/projects/my", { headers: { Authorization: `Bearer ${token}` } });
      setMyProjects(res.data);
    } catch { /* ignore */ }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/projects/verify", { title, description, githubUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      setTitle("");
      setDescription("");
      setGithubUrl("");
      fetchMyProjects();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Project Verification</h1>
          <p className="text-sm text-gray-500 mb-6">Submit a GitHub repository URL to get it verified. Our system checks for README, commits, technologies, and deployment.</p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
              <input type="url" placeholder="GitHub URL (e.g. https://github.com/user/repo)" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
            </div>
            <textarea placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors resize-none" />
            <button type="submit" disabled={!githubUrl.trim() || loading}
              className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md">
              {loading ? "Verifying..." : "Verify Project"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{result.project.title}</h2>
              {result.project.verified ? (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full border border-green-300">
                  ✅ Verified Project
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium px-4 py-1.5 rounded-full border border-yellow-300">
                  ⏳ Pending Review
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className={`text-center p-3 rounded-lg border ${result.verificationDetails.readmeExists ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <p className="text-lg">{result.verificationDetails.readmeExists ? "📄" : "📄"}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">README</p>
                <p className={`text-xs ${result.verificationDetails.readmeExists ? "text-green-600" : "text-gray-400"}`}>{result.verificationDetails.readmeExists ? "Found" : "Missing"}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-gray-50 border-gray-200">
                <p className="text-lg">📝</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Commits</p>
                <p className="text-xs text-gray-600">{result.verificationDetails.commitCount}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-gray-50 border-gray-200">
                <p className="text-lg">🔧</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Technologies</p>
                <p className="text-xs text-gray-600">{result.verificationDetails.technologies.length}</p>
              </div>
              <div className={`text-center p-3 rounded-lg border ${result.verificationDetails.hasDeployment ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <p className="text-lg">{result.verificationDetails.hasDeployment ? "🚀" : "📦"}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">Deployment</p>
                <p className={`text-xs ${result.verificationDetails.hasDeployment ? "text-green-600" : "text-gray-400"}`}>{result.verificationDetails.hasDeployment ? "Detected" : "Not found"}</p>
              </div>
            </div>

            {result.badges.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {result.badges.map((b, i) => (
                    <span key={i} className={`text-xs font-medium px-3 py-1 rounded-full border ${b.includes("Verified") ? "bg-green-100 text-green-700 border-green-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {myProjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> Your Verified Projects</h2>
            <div className="space-y-3">
              {myProjects.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#0a66c2]/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                      {p.verified && <span className="text-xs text-green-600 shrink-0">✅ Verified</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{p.githubUrl}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    {p.badges?.filter(b => !b.includes("Verified")).map((b, i) => (
                      <span key={i} className="text-xs">{b.split(" ")[0]}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectVerification;
