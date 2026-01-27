import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Edit2, Settings, Heart, Bookmark, LogOut 
} from 'lucide-react';

const ProfileScreen = () => {
  // Mock user data
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "Toronto, Canada",
    joinDate: "January 2024",
    bio: "Travel enthusiast who loves exploring new cafes and restaurants. Always looking for the next great adventure!",
    stats: {
      placesSaved: 24,
      reviewsWritten: 12,
      badgesEarned: 5
    },
    preferences: {
      budget: "Medium",
      favoriteTypes: ["Cafe", "Restaurant", "Park"],
      notifications: true
    }
  });

  const menuItems = [
    { icon: <Edit2 size={20} />, label: "Edit Profile", action: () => console.log("Edit Profile") },
    { icon: <Heart size={20} />, label: "Saved Places", action: () => console.log("Saved Places") },
    { icon: <Bookmark size={20} />, label: "My Reviews", action: () => console.log("My Reviews") },
    { icon: <Settings size={20} />, label: "Settings", action: () => console.log("Settings") },
    { icon: <LogOut size={20} />, label: "Log Out", action: () => console.log("Log Out") }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User size={48} className="text-white" />
                  </div>
                  <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                    <Edit2 size={16} />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                      <p className="text-gray-600">{userData.bio}</p>
                    </div>
                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition">
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{userData.stats.placesSaved}</div>
                      <div className="text-sm text-gray-600">Places Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{userData.stats.reviewsWritten}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{userData.stats.badgesEarned}</div>
                      <div className="text-sm text-gray-600">Badges</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{userData.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{userData.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{userData.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Calendar className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="font-medium">{userData.joinDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Budget Preference</div>
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                    <span className="font-medium">{userData.preferences.budget}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Favorite Place Types</div>
                  <div className="flex flex-wrap gap-2">
                    {userData.preferences.favoriteTypes.map((type, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-gray-500">Receive updates about saved places</div>
                  </div>
                  <div className="relative inline-block w-12 h-6">
                    <input 
                      type="checkbox" 
                      className="opacity-0 w-0 h-0"
                      checked={userData.preferences.notifications}
                      onChange={() => {}}
                    />
                    <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition ${userData.preferences.notifications ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute h-5 w-5 rounded-full bg-white transition-transform ${userData.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'} top-0.5`}></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Menu */}
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition-all hover:translate-x-1"
              >
                <div className="text-gray-600">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{item.label}</div>
                </div>
                <div className="text-gray-400">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;