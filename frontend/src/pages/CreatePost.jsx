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
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create a Post</h1>

        {message && (
          <p className={`text-sm mb-4 rounded-md px-3 py-2 border ${
            message === "Post created successfully"
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-600 bg-red-50 border-red-200"
          }`}>
            {message}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none"
            />
          </div>

          {image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Preview</label>
              <img src={image} alt="" className="max-h-48 rounded-md border border-gray-200 object-cover" />
            </div>
          )}

          <ImageUpload setImageUrl={setImage} />

          <button
            type="submit"
            className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
