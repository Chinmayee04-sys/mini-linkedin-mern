import { useState } from "react";
import api from "../services/api";

function ImageUpload({ setImageUrl }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadHandler = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/upload", formData);
      setImageUrl(res.data.imageUrl);
      setFile(null);
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex-1">
        <span className="block text-sm font-medium text-gray-700 mb-1">Upload Image</span>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#e2f0ff] file:text-[#0a66c2] hover:file:bg-[#cce4ff] cursor-pointer"
        />
      </label>
      <button
        onClick={uploadHandler}
        disabled={!file || uploading}
        className="mt-5 px-4 py-1.5 text-sm font-medium rounded-full bg-[#0a66c2] text-white hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default ImageUpload;
