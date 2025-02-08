import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, Plus, Trash2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MentorAvailability = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Redirect if not a mentor
    if (!user || user.role !== 'mentor') {
      navigate('/');
      return;
    }

    fetchSchedule();
    fetchOnlineStatus();
  }, [user, navigate]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`${API_URL}/mentors/schedule/${user._id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || {});
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/mentors/status/${user._id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleAddTimeSlot = (day) => {
    const dayKey = day.toLowerCase();
    setSchedule(prev => ({
      ...prev,
      [dayKey]: [
        ...(prev[dayKey] || []),
        { start: '09:00', end: '17:00' }
      ]
    }));
  };

  const handleRemoveTimeSlot = (day, index) => {
    const dayKey = day.toLowerCase();
    setSchedule(prev => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (day, index, field, value) => {
    const dayKey = day.toLowerCase();
    setSchedule(prev => ({
      ...prev,
      [dayKey]: prev[dayKey].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/mentors/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ schedule })
      });

      if (!response.ok) throw new Error('Failed to save schedule');
      
      toast.success('Schedule saved successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnlineStatusChange = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      const response = await fetch(`${API_URL}/mentors/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ isOnline: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`You are now ${newStatus ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      setIsOnline(!isOnline); // Revert on error
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Availability Settings</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleOnlineStatusChange}
                />
              </div>
              <Button
                onClick={handleSaveSchedule}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            {DAYS.map(day => {
              const dayKey = day.toLowerCase();
              const slots = schedule[dayKey] || [];

              return (
                <div key={day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{day}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimeSlot(day)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </Button>
                  </div>

                  {slots.length === 0 ? (
                    <p className="text-sm text-gray-500">No time slots added</p>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTimeSlot(day, index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAvailability; 