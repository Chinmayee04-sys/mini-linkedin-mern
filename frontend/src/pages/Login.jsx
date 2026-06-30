import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/users/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#f3f2ef] px-4">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500">Stay updated on your professional world</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs text-[#0a66c2] hover:underline hover:text-[#004182] transition-colors">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Sign in
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or</span></div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          New to Mini LinkedIn?{" "}
          <Link to="/register" className="text-[#0a66c2] font-medium hover:underline hover:text-[#004182] transition-colors">
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
