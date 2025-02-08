import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MentorSchedule = ({ mentorId }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${API_URL}/mentors/schedule/${mentorId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.schedule);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [mentorId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading schedule...</div>;
  }

  if (!schedule) {
    return null;
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="mt-4 bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-500" />
        <h3 className="font-medium text-gray-700">Weekly Schedule</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {DAYS.map((day) => {
          const slots = schedule[day.toLowerCase()] || [];
          return (
            <div key={day} className="text-sm">
              <div className="font-medium text-gray-700 mb-1">{day}</div>
              {slots.length > 0 ? (
                slots.map((slot, index) => (
                  <div key={index} className="text-gray-600">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Not available</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MentorSchedule; 