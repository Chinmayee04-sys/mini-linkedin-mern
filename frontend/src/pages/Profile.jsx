import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import ImageUpload from "../components/ImageUpload";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { timeAgo } from "../utils/timeAgo";

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
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [message, setMessage] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [showLikers, setShowLikers] = useState(null);
  const [activityData, setActivityData] = useState(null);

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
        setIsFollowing(currentRes.data.following.some((f) => f._id === userRes.data._id));
      } else {
        const res = await api.get("/users/profile", { headers: { Authorization: `Bearer ${token}` } });
        setProfile(res.data);
        setIsOwnProfile(true);
        setBio(res.data.bio || "");
        setSkills(res.data.skills?.join(", ") || "");
        setProfilePic(res.data.profilePic || "");
        setExperience(res.data.experience || []);
        setEducation(res.data.education || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const fetchPosts = async () => {
    if (!profile) return;
    try {
      const res = await api.get(`/posts/user/${profile._id}`);
      setPosts(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { if (profile) fetchPosts(); }, [profile]);

  const fetchActivity = async () => {
    if (!profile) return;
    try {
      const res = await api.get(`/posts/activity/${profile._id}`);
      setActivityData(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { if (profile) fetchActivity(); }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/users/profile",
        { bio, skills: skills.split(",").map((s) => s.trim()), profilePic, experience, education },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      setEditing(false);
    } catch { setMessage("Failed to update profile"); }
  };

  const handleCancel = () => {
    setEditing(false);
    setBio(profile.bio || "");
    setSkills(profile.skills?.join(", ") || "");
    setProfilePic(profile.profilePic || "");
    setExperience(profile.experience || []);
    setEducation(profile.education || []);
    setMessage("");
  };

  const handleFollow = async () => {
    try {
      await api.put(`/users/follow/${profile._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setIsFollowing(!isFollowing);
      fetchData();
    } catch (err) { console.log(err); }
  };

  const handleEditPost = (post) => { setEditingPostId(post._id); setEditText(post.text); };

  const handleSavePost = async (postId) => {
    try {
      await api.put(`/posts/${postId}`, { text: editText }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingPostId(null); setEditText(""); fetchPosts();
    } catch (err) { console.log(err); }
  };

  const handleCancelEditPost = () => { setEditingPostId(null); setEditText(""); };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/posts/like/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    try {
      await api.put(`/posts/comment/${postId}`, { text }, { headers: { Authorization: `Bearer ${token}` } });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const addExperience = () => setExperience([...experience, { company: "", role: "", startDate: "", endDate: "", description: "" }]);
  const removeExperience = (i) => setExperience(experience.filter((_, idx) => idx !== i));
  const updateExperience = (i, field, val) => {
    const copy = [...experience]; copy[i][field] = val; setExperience(copy);
  };

  const addEducation = () => setEducation([...education, { school: "", degree: "", field: "", startDate: "", endDate: "" }]);
  const removeEducation = (i) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEducation = (i, field, val) => {
    const copy = [...education]; copy[i][field] = val; setEducation(copy);
  };

  if (!profile) {
    return <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] flex items-center justify-center"><div className="animate-pulse flex items-center gap-3 text-gray-400"><div className="w-3 h-3 bg-[#0a66c2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-3 h-3 bg-[#0a66c2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-3 h-3 bg-[#0a66c2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-xl mx-auto">
        {message && <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">{message}</p>}

        {editing ? (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Edit Profile</h1>
              <button onClick={handleCancel} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, MongoDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent" />
              </div>
              {profilePic && <div><label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label><img src={profilePic} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" /></div>}
              <ImageUpload setImageUrl={setProfilePic} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">Experience</h2>
                  <button type="button" onClick={addExperience} className="text-xs text-[#0a66c2] font-medium hover:underline cursor-pointer">+ Add</button>
                </div>
                {experience.map((exp, i) => (
                  <div key={i} className="border border-gray-200 rounded-md p-3 mb-2 space-y-2">
                    <div className="flex justify-end"><button type="button" onClick={() => removeExperience(i)} className="text-xs text-red-500 cursor-pointer">Remove</button></div>
                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    <input type="text" placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Start date" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                      <input type="text" placeholder="End date" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    </div>
                    <textarea placeholder="Description" value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} rows={2}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2] resize-none" />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">Education</h2>
                  <button type="button" onClick={addEducation} className="text-xs text-[#0a66c2] font-medium hover:underline cursor-pointer">+ Add</button>
                </div>
                {education.map((edu, i) => (
                  <div key={i} className="border border-gray-200 rounded-md p-3 mb-2 space-y-2">
                    <div className="flex justify-end"><button type="button" onClick={() => removeEducation(i)} className="text-xs text-red-500 cursor-pointer">Remove</button></div>
                    <input type="text" placeholder="School" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                      <input type="text" placeholder="Field of study" value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Start date" value={edu.startDate} onChange={(e) => updateEducation(i, "startDate", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                      <input type="text" placeholder="End date" value={edu.endDate} onChange={(e) => updateEducation(i, "endDate", e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0a66c2]" />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full bg-[#0a66c2] text-white font-medium py-2.5 rounded-full hover:bg-[#004182] transition-colors cursor-pointer">Save Profile</button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 mb-6 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt="" className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-md ring-2 ring-[#0a66c2]/20" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-2 ring-[#0a66c2]/20">
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
                    className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${isFollowing ? "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50" : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#e2f0ff] hover:shadow-sm"}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
                {isOwnProfile && (
                  <button onClick={() => setEditing(true)} className="text-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer" title="Edit profile">✏️</button>
                )}
              </div>
            </div>

            <div className="flex gap-6 mb-6 text-sm">
              <div className="text-center bg-gray-50 rounded-lg px-4 py-2 min-w-[80px]"><p className="font-semibold text-gray-800 text-lg">{profile.followers?.length || 0}</p><p className="text-gray-500 text-xs">Followers</p></div>
              <div className="text-center bg-gray-50 rounded-lg px-4 py-2 min-w-[80px]"><p className="font-semibold text-gray-800 text-lg">{profile.following?.length || 0}</p><p className="text-gray-500 text-xs">Following</p></div>
            </div>

            {profile.bio && <div className="mb-5"><h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> About</h2><p className="text-sm text-gray-600 whitespace-pre-wrap ml-2.5">{profile.bio}</p></div>}

            {profile.skills?.length > 0 && (
              <div className="mb-5"><h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> Skills</h2>
                <div className="flex flex-wrap gap-2 ml-2.5">{profile.skills.map((skill, i) => (
                  <span key={i} className="bg-[#e2f0ff] text-[#0a66c2] text-xs font-medium px-3 py-1 rounded-full hover:bg-[#cce4ff] transition-colors cursor-default">{skill}</span>
                ))}</div>
              </div>
            )}

            {profile.experience?.length > 0 && (
              <div className="mb-5"><h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><span className="w-1 h-4 bg-[#0a66c2] rounded-full inline-block" /> Experience</h2>
                <div className="space-y-3 ml-2.5">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-[#0a66c2] pl-3 hover:border-l-[3px] transition-all duration-200">
                      <p className="font-medium text-sm text-gray-800">{exp.role}</p>
                      <p className="text-xs text-gray-500">{exp.company}</p>
                      {(exp.startDate || exp.endDate) && <p className="text-xs text-gray-400">{exp.startDate} - {exp.endDate || "Present"}</p>}
                      {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.education?.length > 0 && (
              <div className="mb-5"><h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><span className="w-1 h-4 bg-green-600 rounded-full inline-block" /> Education</h2>
                <div className="space-y-3 ml-2.5">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-green-600 pl-3 hover:border-l-[3px] transition-all duration-200">
                      <p className="font-medium text-sm text-gray-800">{edu.school}</p>
                      {(edu.degree || edu.field) && <p className="text-xs text-gray-500">{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</p>}
                      {(edu.startDate || edu.endDate) && <p className="text-xs text-gray-400">{edu.startDate} - {edu.endDate || "Present"}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwnProfile && !profile.bio && profile.skills?.length === 0 && profile.experience?.length === 0 && (
              <p className="text-sm text-gray-400 italic">No profile details yet. Click ✏️ to add your bio, skills, experience and education.</p>
            )}
          </div>
        )}

        {!editing && profile && <ActivityHeatmap data={activityData} />}

        <h2 className="text-lg font-semibold text-gray-800 mb-4">{isOwnProfile ? "My Posts" : `${profile.name}'s Posts`}</h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center"><p className="text-gray-500">No posts yet.</p></div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 hover:border-[#0a66c2]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {profile.profilePic ? (
                      <img src={profile.profilePic} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-200" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{profile.name}</p>
                      <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  {isOwnProfile && (
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
                  <div className="text-xs text-gray-500 mb-2 bg-gray-50 rounded-lg p-2 border border-gray-100 animate-fadeIn">
                    Liked by {post.likes.length} people
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer active:scale-95">👍 Like</button>
                  <button onClick={() => document.getElementById(`prof-comment-${post._id}`)?.focus()}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer active:scale-95">💬 Comment</button>
                </div>

                <div className="flex gap-2 mb-3">
                  <input id={`prof-comment-${post._id}`} type="text" placeholder="Write a comment..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleComment(post._id); }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors" />
                  <button onClick={() => handleComment(post._id)}
                    className="bg-[#0a66c2] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#004182] transition-all duration-200 cursor-pointer active:scale-95 shadow-sm hover:shadow-md">Send</button>
                </div>

                {post.comments.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {post.comments.map((comment, index) => (
                      <div key={index} className="flex gap-2 animate-fadeIn">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
