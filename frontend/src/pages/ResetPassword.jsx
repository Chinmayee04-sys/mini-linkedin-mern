import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.put(`/users/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#f3f2ef] px-4">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your new password</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2"><span>⚠️</span> {error}</p>
        )}
        {message && (
          <p className="text-green-700 text-sm mb-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2"><span>✅</span> {message}</p>
        )}

        {done ? (
          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-sm text-green-700 mb-4">Your password has been reset successfully.</p>
            <Link to="/login" className="inline-block bg-[#0a66c2] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 shadow-sm hover:shadow-md">Sign in with new password</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            <button type="submit" className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
