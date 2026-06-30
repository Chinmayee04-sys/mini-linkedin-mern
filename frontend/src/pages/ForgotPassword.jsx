import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetUrl("");
    try {
      const res = await api.post("/users/forgot-password", { email });
      setResetUrl(res.data.resetUrl);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#f3f2ef] px-4">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-sm p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Forgot Password</h1>
          <p className="text-sm text-gray-500">Enter your email to get a reset link</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2"><span>⚠️</span> {error}</p>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-3">Use the link below to reset your password:</p>
              <a
                href={resetUrl}
                className="inline-block bg-[#0a66c2] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Reset Password
              </a>
            </div>
            <p className="text-xs text-gray-400 break-all bg-gray-50 rounded-lg p-3 border border-gray-100 font-mono">{resetUrl}</p>
            <p className="text-xs text-gray-400">Link expires in 1 hour</p>
            <Link to="/login" className="block text-[#0a66c2] font-medium text-sm hover:text-[#004182] transition-colors hover:underline">Back to Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
            <button type="submit" className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md">
              Generate Reset Link
            </button>
          </form>
        )}

        {!sent && (
          <p className="text-sm text-gray-500 text-center mt-6">
            <Link to="/login" className="text-[#0a66c2] font-medium hover:text-[#004182] transition-colors hover:underline">Back to Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
