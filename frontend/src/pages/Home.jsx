import Navbar from '../components/Navbar';
import React, { useEffect, useState } from 'react';
import PhotoDetailModal from '../components/PhotoDetailModal';

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:5000/api/photos')
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching photos:", err));
  }, []);

  const handlePhotoDeleted = (deletedId) => {
    setPhotos(photos.filter(p => p.id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20"> {/* pt-20, so as not to hide under the Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-4">
        
        {/* Top block: Tabs */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Feed</h1>
          <div className="bg-white p-1 rounded-lg shadow-sm border">
            <button className="px-4 py-1 bg-gray-100 rounded-md font-medium text-gray-700">🆕 New</button>
            <button className="px-4 py-1 text-gray-500 hover:text-blue-600">🔥 Popular</button>
          </div>
        </div>

        {/* Photo grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading photos... ⏳</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div 
               key={photo.id} 
               onClick={() => setSelectedPhoto(photo)} 
               className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group"
              >
                
                {/* 1. Picture */}
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                   <img 
                     src={photo.image_url} 
                     alt={photo.title} 
                     className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                     loading="lazy" // Lazy loading (faster site)
                   />
                </div>
                
                {/* 2. Info */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 truncate text-sm">{photo.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">@{photo.author}</p>
                    <p className="text-xs text-blue-500 font-bold flex items-center gap-1">
                      ⬇ {photo.downloads}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* If no photos */}
        {!loading && photos.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-2xl mb-2">🤷‍♂️</p>
            <p className="text-gray-500">No photos yet. Be the first!</p>
          </div>
        )}

      </div>

      {selectedPhoto && (
        <PhotoDetailModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onDelete={handlePhotoDeleted}
        />
      )}
    </div>
  );
};
