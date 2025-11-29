import { useAuth } from '../context/AuthContext';

export default function PhotoDetailModal({ photo, onClose, onDelete }) {
  const { user } = useAuth();
  
  const canDelete = user && (user.username === photo.author || ['admin', 'moder'].includes(user.role));

  const handleDownload = () => {
    // Open the download link in a new window
    // This will trigger the backend endpoint, which will increment the counter
    window.open(`http://localhost:5000/api/photos/${photo.id}/download`, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/photos/${photo.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        alert("Photo deleted!");
        onDelete(photo.id);
        onClose();
      } else {
        alert("Error deleting photo");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* 1. LEFT PART: Image (Black background) */}
        <div className="bg-white flex-1 flex items-center justify-center p-2">
          <img 
            src={photo.image_url} 
            alt={photo.title} 
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>

        {/* 2. RIGHT PART: Info */}
        <div className="w-full md:w-80 bg-white p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Title */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800 break-words">{photo.title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl font-bold leading-none">&times;</button>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {photo.author[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-bold text-gray-800">@{photo.author}</p>
              </div>
            </div>

            {/* Technical details */}
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between border-b pb-2">
                <span>📅 Date</span>
                <span className="font-medium">{photo.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>📐 Size</span>
                <span className="font-medium">{photo.resolution || "?"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>💾 Weight</span>
                <span className="font-medium">{photo.size || "?"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>🖼 Format</span>
                <span className="font-medium">{photo.format || "?"}</span>
              </div>
              
               {/* Categories */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {photo.categories.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      #{cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 mt-4">
            <button 
              onClick={handleDownload}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              ⬇ Download ({photo.downloads})
            </button>

            {canDelete && (
              <button 
                onClick={handleDelete}
                className="w-full border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 transition"
              >
                🗑 Delete
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
