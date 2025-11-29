import { useState, useEffect, useRef } from 'react';

export default function CategoryDropdown({ selectedIds, onChange }) {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // To detect clicks outside

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (id) => {
    if (selectedIds.includes(id)) {
      // Remove
      onChange(selectedIds.filter(x => x !== id));
    } else {
      // Add
      onChange([...selectedIds, id]);
    }
    setIsOpen(false);
  };

  const selectedObjects = categories.filter(c => selectedIds.includes(c.id));
  const availableCategories = categories.filter(c => !selectedIds.includes(c.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-gray-700 mb-2">Categories</label>
      
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedObjects.map(cat => (
          <span key={cat.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
            {cat.name}
            <button 
              type="button" 
              onClick={() => toggleCategory(cat.id)}
              className="hover:text-blue-900 font-bold"
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left border border-gray-300 px-4 py-2 rounded-lg text-gray-600 bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 transition flex justify-between items-center"
      >
        <span>{availableCategories.length > 0 ? "Select category..." : "All selected"}</span>
        <span className="text-xs">▼</span>
      </button>

      {/* Dropdown List */}
      {isOpen && availableCategories.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
          {availableCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm transition"
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
