import React, { useState, useEffect } from 'react';

export default function TaskAlerts({ tasks }) {
  const [missedTasks, setMissedTasks] = useState([]);

  useEffect(() => {
    const checkMissedTasks = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const missed = tasks.filter(task => {
        if (task.completed) return false;
        
        const [taskHour, taskMinute] = task.hour.split(':').map(Number);
        const taskTime = taskHour * 60 + taskMinute;
        
        return currentTime > taskTime + 60; // 60 minutes past the scheduled time
      });

      setMissedTasks(missed);
    };

    checkMissedTasks();
    const interval = setInterval(checkMissedTasks, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks]);

  if (missedTasks.length === 0) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">⚠️</span>
        <h3 className="text-lg font-semibold text-red-800">
          Missed Tasks Alert!
        </h3>
      </div>
      <p className="text-red-700 mb-2">
        You have {missedTasks.length} incomplete task{missedTasks.length > 1 ? 's' : ''} that passed their scheduled time:
      </p>
      <ul className="list-disc list-inside text-red-700">
        {missedTasks.map(task => (
          <li key={task.id}>
            <strong>{task.hour}</strong> - {task.task}
          </li>
        ))}
      </ul>
    </div>
  );
}