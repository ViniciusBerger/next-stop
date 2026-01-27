import React from 'react';

const SimpleProfile = () => {
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    location: "Toronto, Canada",
    joinDate: "Jan 2024",
    bio: "Travel enthusiast exploring new places",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            AJ
          </div>
          <h1 className="text-2xl font-bold">{userData.name}</h1>
          <p className="text-gray-600">{userData.bio}</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 text-center mr-3">📧</div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{userData.email}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 text-center mr-3">📍</div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-medium">{userData.location}</div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-8 text-center mr-3">📅</div>
            <div>
              <div className="text-sm text-gray-500">Member Since</div>
              <div className="font-medium">{userData.joinDate}</div>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg mb-4">Profile Options</h2>
          
          <button className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition">
            ✏️ Edit Profile
          </button>
          
          <button className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition">
            ❤️ Saved Places
          </button>
          
          <button className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition">
            ⭐ My Reviews
          </button>
          
          <button className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition">
            ⚙️ Settings
          </button>
          
          <button className="w-full text-left p-4 border rounded-lg hover:bg-red-50 hover:border-red-200 text-red-600 transition">
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfile;