import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { timeAgo } from "../utils/timeAgo";

function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showLikers, setShowLikers] = useState(null);

  const token = localStorage.getItem("token");

  const fetchFeed = async () => {
    try {
      if (!token) return navigate("/login");
      const [feedRes, userRes, sugRes] = await Promise.all([
        api.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/users/profile", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/users/suggested", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPosts(feedRes.data);
      setCurrentUserId(userRes.data._id);
      setSuggested(sugRes.data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  const handleLike = async (id) => {
    try {
      await api.put(`/posts/like/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const feedRes = await api.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } });
      setPosts(feedRes.data);
    } catch (err) { console.log(err); }
  };

  const handleComment = async (id) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;
    try {
      await api.put(`/posts/comment/${id}`, { text }, { headers: { Authorization: `Bearer ${token}` } });
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      const feedRes = await api.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } });
      setPosts(feedRes.data);
    } catch (err) { console.log(err); }
  };

  const handleEditPost = (post) => { setEditingPostId(post._id); setEditText(post.text); };

  const handleSavePost = async (postId) => {
    try {
      await api.put(`/posts/${postId}`, { text: editText }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingPostId(null); setEditText("");
      const feedRes = await api.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } });
      setPosts(feedRes.data);
    } catch (err) { console.log(err); }
  };

  const handleCancelEditPost = () => { setEditingPostId(null); setEditText(""); };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      const feedRes = await api.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } });
      setPosts(feedRes.data);
    } catch (err) { console.log(err); }
  };

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/follow/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const sugRes = await api.get("/users/suggested", { headers: { Authorization: `Bearer ${token}` } });
      setSuggested(sugRes.data);
    } catch (err) { console.log(err); }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-5xl mx-auto flex gap-6">
        <div className="flex-1 max-w-xl">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Feed</h1>

          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/create-post")} className="flex-1 text-left text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 transition-colors cursor-pointer">
                What do you want to share?
              </button>
              <button onClick={() => navigate("/create-post")} className="bg-[#0a66c2] text-white text-sm px-4 py-2 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-95 shadow-sm hover:shadow-md">
                Post
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
              <p className="text-gray-500">No posts yet. Follow people to see their posts here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isOwnPost = currentUserId && post.user?._id === currentUserId;
                return (
                  <div key={post._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 hover:border-[#0a66c2]/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.user?._id}`)}>
                        {post.user?.profilePic ? (
                          <img src={post.user.profilePic} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-200" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {post.user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-gray-800 hover:text-[#0a66c2] transition-colors">{post.user?.name}</p>
                          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                        </div>
                      </div>
                      {isOwnPost && (
                        <div className="flex items-center gap-2">
                          {editingPostId === post._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleSavePost(post._id)} className="text-xs text-green-600 font-medium hover:underline cursor-pointer transition-colors">Save</button>
                              <button onClick={handleCancelEditPost} className="text-xs text-gray-500 hover:underline cursor-pointer transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleEditPost(post)} className="text-sm text-gray-400 hover:text-[#0a66c2] transition-colors cursor-pointer hover:bg-gray-100 p-1 rounded" title="Edit caption">✏️</button>
                              <button onClick={() => handleDeletePost(post._id)} className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer hover:bg-red-50 p-1 rounded" title="Delete post">🗑️</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {post.image && <img src={post.image} alt="" className="w-full rounded-lg mb-3 max-h-96 object-cover border border-gray-100 shadow-sm" />}

                    {editingPostId === post._id ? (
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none mb-3" rows={3} />
                    ) : (
                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{post.text}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                      <button onClick={() => setShowLikers(showLikers === post._id ? null : post._id)} className="hover:text-gray-700 transition-colors cursor-pointer group">
                        <span className="group-hover:scale-110 inline-block transition-transform">👍</span> {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                      </button>
                      <span className="flex items-center gap-1"><span>💬</span> {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                    </div>

                    {showLikers === post._id && post.likes.length > 0 && (
                      <div className="text-xs text-gray-500 mb-2 bg-gray-50 rounded-lg p-2 border border-gray-100">Liked by {post.likes.length} people</div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <button onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer active:scale-95">👍 Like</button>
                      <button onClick={() => document.getElementById(`feed-comment-${post._id}`)?.focus()}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer active:scale-95">💬 Comment</button>
                    </div>

                    <div className="flex gap-2">
                      <input id={`feed-comment-${post._id}`} type="text" placeholder="Write a comment..."
                        value={commentInputs[post._id] || ""}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                      <button onClick={() => handleComment(post._id)}
                        className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-95 shadow-sm hover:shadow-md">Send</button>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {post.comments.map((comment, index) => (
                          <div key={index} className="flex gap-2">
                            {comment.user?.profilePic ? <img src={comment.user.profilePic} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 border border-gray-200 shadow-sm" />
                              : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs mt-0.5 shadow-sm">{comment.user?.name?.charAt(0).toUpperCase()}</div>}
                            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
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

        <div className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-xl shadow-md p-5 sticky top-20 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> People you may know</h2>
            {suggested.length === 0 ? (
              <p className="text-xs text-gray-400">No suggestions right now</p>
            ) : (
              <div className="space-y-3">
                {suggested.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                      {user.skills?.length > 0 && <p className="text-xs text-gray-400 truncate">{user.skills[0]}</p>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFollow(user._id); }}
                      className="text-xs font-medium px-3 py-1 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e2f0ff] transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
                    >
                      + Follow
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => navigate("/profile")} className="text-xs text-[#0a66c2] font-medium hover:underline transition-colors cursor-pointer hover:text-[#004182]">Visit your profile →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
