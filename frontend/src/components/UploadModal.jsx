import { useState, useEffect } from 'react';
import CategoryDropdown from './CategoryDropdown';

export default function UploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const addCategory = (catId) => {
    if (!selectedCats.includes(catId)) {
      setSelectedCats([...selectedCats, catId]);
    }
    setIsDropdownOpen(false);
  };

  const removeCategory = (catId) => {
    setSelectedCats(selectedCats.filter(id => id !== catId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Fill in the name and select the file!");

    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('categories', selectedCats.join(','));

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        alert("Photo uploaded successfully! 🎉");
        onClose();
        window.location.reload();
      } else {
        alert("Upload error");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoriesObjects = categories.filter(c => selectedCats.includes(c.id));
  const availableCategories = categories.filter(c => !selectedCats.includes(c.id));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
        
        {/* Close button (X) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl">
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">📤 Add Photo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* File selection field + Preview */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
            {preview ? (
              <img src={preview} alt="Preview" className="h-48 mx-auto object-contain rounded" />
            ) : (
              <div className="text-gray-500 py-8">
                <p>Click to select a photo</p>
                <span className="text-4xl">📷</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My cute cat..."
            />
          </div>

          <CategoryDropdown 
            selectedIds={selectedCats} 
            onChange={setSelectedCats} 
          />

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Uploading...' : 'Post Photo'}
          </button>
        </form>
      </div>
    </div>
  );
};
