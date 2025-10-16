import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadUsers() {
      try {
        const q = query(
          collection(db, 'users'),
          where('isPublic', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.userId !== currentUser.uid);
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
      setLoading(false);
    }

    loadUsers();
  }, [currentUser]);

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function viewUserSchedule(userId) {
    navigate(`/user/${userId}`);
  }

  const avatarColors = [
    'from-red-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-purple-500 to-indigo-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
      <nav className="bg-white/95 backdrop-blur-lg shadow-xl border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-4xl">👥</span> Community
              </h1>
              <p className="text-gray-600 mt-1">Discover and connect with other planners</p>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-bold"
            >
              ← Back to My Planner
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <input
                type="text"
                placeholder="Search users by name, bio, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 font-medium shadow-sm text-lg"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-purple-200 text-center">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-3xl font-bold text-purple-600">{users.length}</div>
            <div className="text-gray-600 font-medium">Public Users</div>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-pink-200 text-center">
            <div className="text-4xl mb-2">🌟</div>
            <div className="text-3xl font-bold text-pink-600">{filteredUsers.length}</div>
            <div className="text-gray-600 font-medium">Search Results</div>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-red-200 text-center">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-3xl font-bold text-red-600">Active</div>
            <div className="text-gray-600 font-medium">Community Status</div>
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            <p className="text-white text-xl font-bold mt-4">Loading amazing people...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border-2 border-purple-200">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-2xl text-gray-700 font-bold mb-2">
              {searchTerm ? 'No users found' : 'No public users yet'}
            </p>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Be the first to share your schedule with the community!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/profile')}
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-bold"
              >
                Set Up Your Profile
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden border-2 border-purple-200"
              >
                <div className={`h-24 bg-gradient-to-r ${avatarColors[index % avatarColors.length]}`}></div>
                <div className="p-6 -mt-12">
                  <div className="flex justify-center mb-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${avatarColors[index % avatarColors.length]} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white`}>
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl text-center text-gray-800 mb-1">
                    {user.username || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4">{user.email}</p>
                  
                  {user.bio && (
                    <p className="text-gray-600 text-sm text-center mb-4 line-clamp-3 italic">
                      "{user.bio}"
                    </p>
                  )}
                  
                  <button
                    onClick={() => viewUserSchedule(user.userId)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg font-bold"
                  >
                    📅 View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}