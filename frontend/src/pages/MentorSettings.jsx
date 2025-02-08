import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Clock, DollarSign, Globe, Link as LinkIcon } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

const MentorSettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    headline: '',
    bio: '',
    languages: [],
    ratePerMinute: 1,
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: ''
    },
    availability: {
      isOnline: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/mentors/profile/${user._id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      if (data.success) {
        setSettings({
          headline: data.mentor.headline || '',
          bio: data.mentor.bio || '',
          languages: data.mentor.languages || [],
          ratePerMinute: data.mentor.ratePerMinute || 1,
          socialLinks: data.mentor.socialLinks || {},
          availability: {
            isOnline: data.mentor.availability?.isOnline || false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/mentors/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleOnlineStatusChange = async () => {
    try {
      const newStatus = !settings.availability.isOnline;
      setSettings(prev => ({
        ...prev,
        availability: { ...prev.availability, isOnline: newStatus }
      }));

      const response = await fetch(`${API_URL}/mentors/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ isOnline: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success(`You are now ${newStatus ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        availability: { ...prev.availability, isOnline: !prev.availability.isOnline }
      }));
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Online Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Online Status</h3>
              <p className="text-sm text-gray-500">
                Toggle your availability to receive new chat requests
              </p>
            </div>
            <Switch
              checked={settings.availability.isOnline}
              onCheckedChange={handleOnlineStatusChange}
            />
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Headline</label>
            <Input
              value={settings.headline}
              onChange={(e) => setSettings(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="Your professional headline"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={settings.bio}
              onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell students about yourself"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rate (₹ per minute)</label>
            <Input
              type="number"
              min="1"
              value={settings.ratePerMinute}
              onChange={(e) => setSettings(prev => ({ ...prev, ratePerMinute: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Languages</label>
            <Input
              value={settings.languages.join(', ')}
              onChange={(e) => setSettings(prev => ({ ...prev, languages: e.target.value.split(',').map(lang => lang.trim()) }))}
              placeholder="English, Hindi, etc."
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-medium">Social Links</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <LinkIcon className="w-5 h-5 text-[#0A66C2]" />
              <Input
                value={settings.socialLinks.linkedin || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                }))}
                placeholder="LinkedIn Profile URL"
              />
            </div>

            <div className="flex items-center gap-4">
              <LinkIcon className="w-5 h-5 text-[#333]" />
              <Input
                value={settings.socialLinks.github || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                }))}
                placeholder="GitHub Profile URL"
              />
            </div>

            <div className="flex items-center gap-4">
              <LinkIcon className="w-5 h-5 text-[#1DA1F2]" />
              <Input
                value={settings.socialLinks.twitter || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                }))}
                placeholder="Twitter Profile URL"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-customYellow hover:bg-customYellow/90 text-black"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default MentorSettings; 