import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await api.get("/posts/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUserId(res.data._id);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      await api.put(`/posts/like/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (id) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;
    try {
      await api.put(`/posts/comment/${id}`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditText(post.text);
  };

  const handleSavePost = async (postId) => {
    try {
      await api.put(`/posts/${postId}`, { text: editText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingPostId(null);
      setEditText("");
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelEditPost = () => {
    setEditingPostId(null);
    setEditText("");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Feed</h1>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <p className="text-gray-500">No posts yet. Follow people to see their posts here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isOwnPost = currentUserId && post.user?._id === currentUserId;
              return (
                <div key={post._id} className="bg-white rounded-lg shadow-md p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {post.user?.profilePic ? (
                        <img src={post.user.profilePic} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-semibold text-sm">
                          {post.user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{post.user?.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {isOwnPost && (
                      editingPostId === post._id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSavePost(post._id)} className="text-xs text-green-600 font-medium hover:underline cursor-pointer">Save</button>
                          <button onClick={handleCancelEditPost} className="text-xs text-gray-500 hover:underline cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditPost(post)} className="text-sm text-gray-400 hover:text-[#0a66c2] cursor-pointer" title="Edit caption">✏️</button>
                      )
                    )}
                  </div>

                  {post.image && (
                    <img src={post.image} alt="" className="w-full rounded-md mb-3 max-h-96 object-cover border border-gray-100" />
                  )}

                  {editingPostId === post._id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none mb-3"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{post.text}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                    <span>👍 {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                    <span>💬 {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => handleLike(post._id)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                      👍 Like
                    </button>
                    <button onClick={() => document.getElementById(`feed-comment-input-${post._id}`)?.focus()} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                      💬 Comment
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id={`feed-comment-input-${post._id}`}
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                    />
                    <button onClick={() => handleComment(post._id)} className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer">
                      Send
                    </button>
                  </div>

                  {post.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-2">
                          {comment.user?.profilePic ? (
                            <img src={comment.user.profilePic} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 border border-gray-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs mt-0.5">
                              {comment.user?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="bg-gray-100 rounded-lg px-3 py-1.5">
                            <p className="text-xs font-semibold text-gray-800">{comment.user?.name}</p>
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
