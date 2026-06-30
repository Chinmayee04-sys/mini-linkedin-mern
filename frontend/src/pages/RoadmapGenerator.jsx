import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RoadmapGenerator() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    if (!token) return navigate("/login");
    api.get("/roadmap/roles").then(r => setRoles(r.data)).catch(() => {});
    api.get("/users/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUserSkills(r.data.skills || []))
      .catch(() => {});
  }, []);

  const generate = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setRoadmap(null);
    try {
      const res = await api.post("/roadmap/generate", { role: selectedRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmap(res.data);
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
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Skill Roadmap Generator</h1>
          <p className="text-sm text-gray-500 mb-6">Select a career path and get a personalized roadmap based on your current skills.</p>

          {userSkills.length > 0 && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-2">Your Current Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {userSkills.map((s, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors">
              <option value="">Choose a role...</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={generate} disabled={!selectedRole || loading}
              className="bg-[#0a66c2] text-white font-medium px-6 py-2.5 rounded-full hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md">
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>
        </div>

        {roadmap && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#0a66c2] to-[#004182] rounded-xl p-6 text-white">
              <h2 className="text-xl font-semibold mb-1">{selectedRole}</h2>
              <p className="text-sm opacity-90">{roadmap.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-blue-500 rounded-full inline-block" /> Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {roadmap.prerequisites.map((s, i) => (
                  <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">{s}</span>
                ))}
              </div>
            </div>

            {roadmap.alreadyHave.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-green-500 rounded-full inline-block" /> Already In Your Skills ✅</h3>
                <div className="flex flex-wrap gap-2">
                  {roadmap.alreadyHave.map((s, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200 flex items-center gap-1"><span>✓</span> {s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-orange-500 rounded-full inline-block" /> Skills to Learn</h3>
              {roadmap.needToLearn.length === 0 ? (
                <p className="text-sm text-green-600 font-medium">You already have all the skills for this role! 🎉</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {roadmap.needToLearn.map((s, i) => (
                    <div key={i} className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-2 rounded-lg border border-orange-200 flex items-center gap-1.5">
                      <span>▸</span> {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {roadmap.courses.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-purple-500 rounded-full inline-block" /> Recommended Courses</h3>
                <div className="space-y-2">
                  {roadmap.courses.map((c, i) => (
                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors group">
                      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <span className="text-sm text-gray-700 group-hover:text-purple-700 transition-colors flex-1">{c.name}</span>
                      <span className="text-xs text-gray-400 group-hover:text-purple-500">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><span className="w-1 h-4 bg-green-500 rounded-full inline-block" /> Projects to Build</h3>
              <div className="space-y-3">
                {roadmap.projects.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors">
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Expected Salary</p>
                <p className="text-lg font-semibold text-green-700">{roadmap.salary}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-1">Estimated Time</p>
                <p className={`text-lg font-semibold ${roadmap.timeReduced ? "text-green-600" : "text-[#0a66c2]"}`}>
                  {roadmap.timeRequired}
                  {roadmap.timeReduced && <span className="text-xs text-green-500 ml-1">(reduced based on your skills)</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoadmapGenerator;
