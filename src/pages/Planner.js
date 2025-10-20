import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import TaskAlerts from '../components/TaskAlerts';

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedHour, setSelectedHour] = useState('09:00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('day');
  const [expandedTask, setExpandedTask] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
    if (!currentUser) return;

    let q;
    if (view === 'week') {
      const weekDates = getWeekDates();
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('date', 'in', weekDates)
      );
    } else {
      q = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid),
        where('date', '==', selectedDate)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    });

    return unsubscribe;
  }, [currentUser, selectedDate, view]);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await addDoc(collection(db, 'tasks'), {
        userId: currentUser.uid,
        task: newTask,
        description: newDescription,
        hour: selectedHour,
        date: selectedDate,
        completed: false,
        createdAt: new Date()
      });
      
      setNewTask('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function toggleComplete(taskId, currentStatus) {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !currentStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function deleteTask(taskId) {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out');
    }
  }

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

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <nav className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Daily Planner
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'day' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    view === 'week' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/community')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow-md font-semibold"
              >
                Community
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-600 transition shadow-md font-semibold"
              >
                Profile
              </button>
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {currentUser?.email?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-md font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <TaskAlerts tasks={todayTasks} />

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-3 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">{formatDate(selectedDate)}</h2>
              {isToday && (
                <span className="inline-block mt-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                  Today
                </span>
              )}
            </div>
            
            <button
              onClick={() => changeDate(1)}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 p-3 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition shadow-md font-semibold"
            >
              Jump to Today
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-indigo-200">
          <h2 className="text-2xl font-bold mb-4 text-indigo-900">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Task title"
                className="flex-1 min-w-[250px] px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 font-medium shadow-sm"
                required
              />
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold shadow-sm bg-white"
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
            </div>
            
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 font-medium shadow-sm"
              rows="3"
            />
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg font-bold"
            >
              Add Task
            </button>
          </form>
        </div>

        {view === 'week' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Week Overview</h2>
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
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105' 
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
                                : isSelectedDay ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
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
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Schedule</h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-500 font-medium">No tasks scheduled yet</p>
                <p className="text-gray-400 mt-2">Add your first task above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hours.map(hour => {
                  const hourTasks = tasks.filter(t => t.hour === hour);
                  if (hourTasks.length === 0) return null;
                  
                  return (
                    <div key={hour} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 pt-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-3 py-2 rounded-lg text-center font-bold shadow-md text-sm">
                          {hour}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {hourTasks.map(task => {
                          const isExpanded = expandedTask === task.id;
                          
                          return (
                            <div
                              key={task.id}
                              className={`p-4 rounded-xl shadow-md transition border-2 ${
                                task.completed 
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                  : 'bg-gradient-to-r from-white to-indigo-50 border-indigo-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleComplete(task.id, task.completed)}
                                    className="w-5 h-5 cursor-pointer accent-indigo-600 mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-lg font-medium ${
                                        task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                      }`}>
                                        {task.task}
                                      </span>
                                      {task.description && (
                                        <button
                                          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                          className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                                        >
                                          {isExpanded ? 'Hide Details' : 'Show Details'}
                                        </button>
                                      )}
                                      {task.completed && (
                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                          Done
                                        </span>
                                      )}
                                    </div>
                                    
                                    {isExpanded && task.description && (
                                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <p className="text-sm font-semibold text-indigo-800 mb-1">Description:</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                          {task.description}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg transition font-semibold shadow-sm text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}