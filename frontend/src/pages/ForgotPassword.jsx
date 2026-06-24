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
      <div className="bg-white rounded-lg shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to get a reset link</p>

        {error && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">Use the link below to reset your password:</p>
            <a
              href={resetUrl}
              className="inline-block bg-[#0a66c2] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#004182] transition-colors"
            >
              Reset Password
            </a>
            <p className="text-xs text-gray-400 break-all bg-gray-50 rounded-md p-2">{resetUrl}</p>
            <p className="text-xs text-gray-400">This link expires in 1 hour.</p>
            <Link to="/login" className="block text-[#0a66c2] font-medium text-sm hover:underline">Back to Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
            />
            <button type="submit" className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer">
              Generate Reset Link
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 text-center mt-6">
          <Link to="/login" className="text-[#0a66c2] font-medium hover:underline">Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
