import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 h-16 flex items-center px-6 justify-between">
      
      {/* 1. LEFT PART: Logo */}
      <div className="flex items-center gap-4">
        <Link to="/home" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          📸 <span className="hidden sm:block">PhotoShare</span>
        </Link>
      </div>

      {/* 2. CENTER PART: Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="🔍 Search photos..." 
            className="w-full bg-gray-100 border-none rounded-full py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 3. RIGHT PART: Menu */}
      <div className="flex items-center gap-4">
        {/* Navigation Links */}
        <Link to="/home" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
        <Link to="/my-photos" className="text-gray-600 hover:text-blue-600 font-medium">My Photos</Link>

        {/* Upload Button */}
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
          onClick={() => alert("Soon there will be a modal here!")}
        >
          <span>+</span> <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Profile and Logout */}
        <div className="flex items-center gap-3 border-l pl-4 ml-2">
          <div className="text-sm text-right hidden md:block">
            <p className="font-bold text-gray-800">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-red-500 hover:bg-red-50 p-2 rounded-full"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
};
