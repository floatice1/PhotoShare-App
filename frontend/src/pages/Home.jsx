import Navbar from '../components/Navbar';

export default function Home() {
  const dummyPhotos = [1, 2, 3, 4, 5, 6, 7, 8];

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dummyPhotos.map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group">
              {/* Photo placeholder */}
              <div className="h-48 bg-gray-300 w-full flex items-center justify-center text-gray-500 group-hover:bg-gray-400">
                PHOTO {item}
              </div>
              
              {/* Caption */}
              <div className="p-3">
                <p className="font-bold text-gray-800 truncate">Cool photo {item}</p>
                <p className="text-xs text-gray-500">Author: User123</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
