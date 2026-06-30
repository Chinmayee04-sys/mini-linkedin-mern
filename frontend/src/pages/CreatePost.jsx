import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ImageUpload from "../components/ImageUpload";

function CreatePost() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/posts",
        { text, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data);
      setMessage("Post created successfully");
      setText("");
      setImage("");
    } catch (err) {
      setMessage("Failed to create post");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Create a Post</h1>
        <p className="text-sm text-gray-500 mb-6">Share something with your network</p>

        {message && (
          <p className={`text-sm mb-4 rounded-lg px-3 py-2 border flex items-center gap-2 ${
            message === "Post created successfully"
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-600 bg-red-50 border-red-200"
          }`}>
            {message === "Post created successfully" ? "✅" : "⚠️"} {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to share?</label>
            <textarea
              placeholder="Write something..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-200 resize-none bg-gray-50 hover:bg-white"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{text.length} characters</p>
          </div>

          {image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
              <img src={image} alt="" className="max-h-48 rounded-lg border border-gray-200 object-cover shadow-sm" />
            </div>
          )}

          <ImageUpload setImageUrl={setImage} />

          <button
            type="submit"
            className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
