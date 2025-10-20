import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function UserSchedule() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('day');

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  function getWeekDates() {
    const curr = new Date(selectedDate);
    const week = [];
    const firstDay = curr.getDate() - curr.getDay();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(firstDay + i));
      week.push(date.toISOString().split('T')[0]);
    }
    return week;
  }

  useEffect(() => {
    async function loadUserData() {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }

    loadUserData();

    let q;
    if (view === 'week') {
      const weekDates = getWeekDates();
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('date', 'in', weekDates)
      );
    } else {
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('date', '==', selectedDate)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, selectedDate, view]);

  function changeDate(days) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  function getDayNumber(dateStr) {
    const date = new Date(dateStr);
    return date.getDate();
  }

  const completedTasks = tasks.filter(t => t.completed && t.date === selectedDate).length;
  const totalTasks = tasks.filter(t => t.date === selectedDate).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400">
      <nav className="bg-white/95 backdrop-blur-lg shadow-xl border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-white">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.username || 'User'}'s Schedule
                </h1>
                {user?.bio && (
                  <p className="text-gray-600 mt-1 italic">"{user.bio}"</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'day' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
              </div>
              <button
                onClick={() => navigate('/community')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition shadow-lg font-bold"
              >
                Back to Community
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-3xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-gray-600 font-medium">Total Tasks</div>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-gray-600 font-medium">Completed</div>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
              <div className="text-gray-600 font-medium">Completion Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-full transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{formatDate(selectedDate)}</h2>
            </div>
            
            <button
              onClick={() => changeDate(1)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-full transition shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold shadow-sm"
            />
          </div>
        </div>

        {view === 'week' && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Week Overview</h2>
            <div className="grid grid-cols-7 gap-4">
              {getWeekDates().map(date => {
                const dayTasks = tasks.filter(t => t.date === date);
                const isSelectedDay = date === selectedDate;
                const isTodayDay = date === new Date().toISOString().split('T')[0];
                
                return (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`cursor-pointer rounded-xl p-4 transition ${
                      isSelectedDay 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105' 
                        : isTodayDay
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`font-bold text-sm ${isSelectedDay ? 'text-white' : 'text-gray-600'}`}>
                        {getDayName(date)}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${isSelectedDay ? 'text-white' : 'text-gray-800'}`}>
                        {getDayNumber(date)}
                      </div>
                      <div className={`mt-2 text-xs font-semibold ${isSelectedDay ? 'text-white' : 'text-gray-500'}`}>
                        {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                      </div>
                      <div className="mt-2 space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs truncate px-2 py-1 rounded ${
                              task.completed
                                ? isSelectedDay ? 'bg-green-400 text-white' : 'bg-green-100 text-green-800'
                                : isSelectedDay ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.task}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className={`text-xs ${isSelectedDay ? 'text-white' : 'text-gray-500'}`}>
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Schedule for this day</h2>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                <p className="text-blue-600 text-xl font-bold mt-4">Loading schedule...</p>
              </div>
            ) : tasks.filter(t => t.date === selectedDate).length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-500 font-medium">No tasks scheduled for this day.</p>
                <p className="text-gray-400 mt-2">Check another date to see their schedule!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hours.map(hour => {
                  const hourTasks = tasks.filter(t => t.hour === hour && t.date === selectedDate);
                  if (hourTasks.length === 0) return null;
                  
                  return (
                    <div key={hour} className="flex gap-4">
                      <div className="flex-shrink-0 w-24 pt-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-lg text-center font-bold shadow-md">
                          {hour}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {hourTasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl shadow-md border-2 ${
                              task.completed 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                : 'bg-gradient-to-r from-white to-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {task.completed ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                  ✓
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                              )}
                              <span className={`text-lg font-medium ${
                                task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                              }`}>
                                {task.task}
                              </span>
                              {task.completed && (
                                <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                                  Completed
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-semibold text-blue-800 mb-1">Description:</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {task.description}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {completionRate === 100 && totalTasks > 0 && (
          <div className="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-2xl shadow-xl p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {user?.username || 'This user'} crushed it!
            </h3>
            <p className="text-gray-700 font-medium">
              All tasks completed for this day! What an amazing achievement!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}