import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || !token) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, token]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFollow = async (userId) => {
    try {
      await api.put(`/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, following: !u.following } : u
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/feed" className="text-[#0a66c2] font-bold text-xl tracking-tight shrink-0">
          MiniLink
        </Link>

        {token && (
          <div ref={dropdownRef} className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              className="w-full px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white focus:border-transparent"
            />
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3 text-center">No users found</p>
                ) : (
                  results.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => { navigate(`/profile/${user._id}`); setShowDropdown(false); setQuery(""); }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer"
                    >
                      {user.profilePic ? (
                        <img src={user.profilePic} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFollow(user._id); }}
                        className="text-xs font-medium px-3 py-1 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e2f0ff] transition-colors cursor-pointer shrink-0"
                      >
                        {user.following ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {token ? (
            <>
              <Link to="/feed" className="text-gray-600 hover:text-[#0a66c2] px-2 py-1.5 text-sm font-medium transition-colors">
                Feed
              </Link>
              <Link to="/create-post" className="text-gray-600 hover:text-[#0a66c2] px-2 py-1.5 text-sm font-medium transition-colors">
                Post
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-[#0a66c2] px-2 py-1.5 text-sm font-medium transition-colors">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 ml-2 cursor-pointer transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#0a66c2] font-medium text-sm px-4 py-1.5 rounded-full border border-[#0a66c2] hover:bg-[#e2f0ff] transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="text-white font-medium text-sm px-4 py-1.5 rounded-full bg-[#0a66c2] hover:bg-[#004182] transition-colors">
                Join now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
