import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username || '');
        setBio(data.bio || '');
        setIsPublic(data.isPublic !== false);
      }
    }
    
    loadProfile();
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        username: username,
        bio: bio,
        isPublic: isPublic,
        email: currentUser.email,
        userId: currentUser.uid,
        updatedAt: new Date()
      });
      
      setMessage('Profile saved successfully! ✅');
      setTimeout(() => navigate('/planner'), 1500);
    } catch (error) {
      setMessage('Error saving profile ❌');
      console.error(error);
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate('/planner')}
          className="mb-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition font-semibold shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Planner
        </button>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4">
                {username?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-2 rounded-full shadow-lg">
                <span className="text-xl">👤</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h2>
            <p className="text-gray-600">{currentUser?.email}</p>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl mb-6 shadow-md animate-bounce ${
              message.includes('successfully') 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 text-green-800' 
                : 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-400 text-red-800'
            }`}>
              <div className="flex items-center justify-center font-semibold">
                <span className="text-2xl mr-2">{message.includes('successfully') ? '🎉' : '⚠️'}</span>
                {message}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-indigo-200">
              <label className="block text-gray-800 font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 font-medium shadow-sm transition"
                placeholder="Choose a cool username..."
                required
              />
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
              <label className="block text-gray-800 font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span>Bio</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 font-medium shadow-sm transition"
                placeholder="Tell others about yourself... (hobbies, goals, interests)"
                rows="4"
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-6 h-6 mr-4 accent-green-600 cursor-pointer"
                />
                <div>
                  <span className="text-gray-800 font-bold flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <span>Make my schedule public</span>
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    When enabled, other users can discover and view your daily tasks for inspiration
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-teal-700 transition font-bold text-lg shadow-lg transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  '💾 Save Profile'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/planner')}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-xl hover:from-gray-500 hover:to-gray-600 transition font-bold text-lg shadow-lg transform hover:scale-105"
              >
                ❌ Cancel
              </button>
            </div>
          </form>

          {/* Tips section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span>Profile Tips</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Choose a unique username that represents you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Share your goals and interests in your bio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Enable public profile to inspire and connect with others</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}