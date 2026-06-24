import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import ImageUpload from "../components/ImageUpload";

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return navigate("/login");
  }, []);

  const fetchData = async () => {
    try {
      if (!token) return;

      if (id) {
        const [userRes, currentRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get("/users/profile", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProfile(userRes.data);
        setIsOwnProfile(userRes.data._id === currentRes.data._id);
        setIsFollowing(
          currentRes.data.following.some((f) => f._id === userRes.data._id)
        );
      } else {
        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setIsOwnProfile(true);
        setBio(res.data.bio || "");
        setSkills(res.data.skills?.join(", ") || "");
        setProfilePic(res.data.profilePic || "");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchPosts = async () => {
    try {
      if (!profile) return;
      const res = await api.get(`/posts/user/${profile._id}`);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (profile) fetchPosts();
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.put(
        "/users/profile",
        { bio, skills: skills.split(",").map((s) => s.trim()), profilePic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      setEditing(false);
    } catch {
      setMessage("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setBio(profile.bio || "");
    setSkills(profile.skills?.join(", ") || "");
    setProfilePic(profile.profilePic || "");
    setMessage("");
  };

  const handleFollow = async () => {
    try {
      await api.put(`/users/follow/${profile._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(!isFollowing);
      fetchData();
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

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    try {
      await api.put(`/posts/comment/${postId}`, { text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-xl mx-auto">
        {message && (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">
            {message}
          </p>
        )}

        {editing ? (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Edit Profile</h1>
              <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                Cancel
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills <span className="text-gray-400 font-normal">(comma separated)</span>
                </label>
                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent" />
              </div>
              {profilePic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                  <img src={profilePic} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                </div>
              )}
              <ImageUpload setImageUrl={setProfilePic} />
              <button type="submit" className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer">
                Save Profile
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#0a66c2] flex items-center justify-center text-white text-2xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">{profile.name}</h1>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isOwnProfile && (
                  <button onClick={handleFollow}
                    className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors cursor-pointer ${
                      isFollowing
                        ? "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600"
                        : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#e2f0ff]"
                    }`}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
                {isOwnProfile && (
                  <button onClick={() => setEditing(true)} className="text-xl hover:scale-110 transition-transform cursor-pointer" title="Edit profile">
                    ✏️
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-6 mb-6 text-sm">
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-lg">{profile.followers?.length || 0}</p>
                <p className="text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-lg">{profile.following?.length || 0}</p>
                <p className="text-gray-500">Following</p>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">About</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {profile.skills?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="bg-[#e2f0ff] text-[#0a66c2] text-xs font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isOwnProfile && !profile.bio && profile.skills?.length === 0 && (
              <p className="text-sm text-gray-400 italic">No profile details yet. Click ✏️ to add your bio and skills.</p>
            )}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isOwnProfile ? "My Posts" : `${profile.name}'s Posts`}
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <p className="text-gray-500">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-semibold text-sm">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{profile.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
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
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none mb-3" rows={3} />
                ) : (
                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{post.text}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                  <span>👍 {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                  <span>💬 {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                    👍 Like
                  </button>
                  <button onClick={() => document.getElementById(`profile-comment-input-${post._id}`)?.focus()}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                    💬 Comment
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    id={`profile-comment-input-${post._id}`}
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent"
                  />
                  <button onClick={() => handleComment(post._id)}
                    className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer">
                    Send
                  </button>
                </div>

                {post.comments.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
