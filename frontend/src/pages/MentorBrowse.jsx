import ProfileCard from "@/components/common/MentorCard"
import Header from '../components/common/Header';
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import axios from "axios";
import Footer from '../components/common/Footer';

const API_URL = import.meta.env.VITE_API_URL ;

const MENTORING_AREAS = ['coding-software', 'freelancing', 'career-job'];

export default function MentorBrowse() {
  const [isVisible, setIsVisible] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    maxRate: 50,
    experience: 0
  });
  
  // Separate state for temporary filter values
  const [tempFilters, setTempFilters] = useState({
    search: '',
    area: '',
    maxRate: 50,
    experience: 0
  });

  const fetchMentors = async (filterParams = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterParams.search) params.append('search', filterParams.search);
      if (filterParams.area) params.append('area', filterParams.area);
      if (filterParams.maxRate) params.append('maxRate', filterParams.maxRate);
      if (filterParams.experience > 0) params.append('experience', filterParams.experience);

      const response = await axios.get(`${API_URL}/mentors/mentordata?${params.toString()}`);
      setMentors(response.data.mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    // Initial fetch without filters
    fetchMentors({});
  }, []);

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    fetchMentors(tempFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      search: '',
      area: '',
      maxRate: 50,
      experience: 0
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    fetchMentors(defaultFilters);
  };

  return (
    <div className="font-poppins pt-28">
    <Header isVisible={isVisible} />
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setShowMobileFilters(true)}
            className="w-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          >
            Filters & Search
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Mobile Filter Slide-over */}
          <div className={`
            lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300
            ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}>
            <div className={`
              fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl transform transition-transform duration-300
              ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}
            `}>
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Search */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-gray-700">Search by Name or Skills</Label>
                    <Input 
                      placeholder="e.g. DSA, Client Acquisition ..." 
                      value={tempFilters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="border-gray-200"
                    />
                  </div>

                  {/* Mentoring Areas */}
                  <div className="space-y-3 mb-6">
                    <Label className="text-gray-700">Mentoring Area</Label>
                    {MENTORING_AREAS.map(area => (
                      <div key={area} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          checked={tempFilters.area === area}
                          onCheckedChange={(checked) => handleFilterChange('area', checked ? area : '')}
                        />
                        <Label className="capitalize text-gray-600 cursor-pointer">
                          {area.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Rate Range */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-gray-700">Maximum Rate (₹/min): {tempFilters.maxRate}</Label>
                    <Slider
                      value={[tempFilters.maxRate]}
                      onValueChange={([value]) => handleFilterChange('maxRate', value)}
                      max={50}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-2 mb-6">
                    <Label className="text-gray-700">Minimum Experience (years): {tempFilters.experience}</Label>
                    <Slider
                      value={[tempFilters.experience]}
                      onValueChange={([value]) => handleFilterChange('experience', value)}
                      max={40}
                      step={1}
                      className="py-4"
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <Button 
                    onClick={() => {
                      handleApplyFilters();
                      setShowMobileFilters(false);
                    }}
                    className="w-full bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    onClick={() => {
                      handleClearFilters();
                      setShowMobileFilters(false);
                    }}
                    variant="outline"
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Filters - Left Side (unchanged) */}
          <div className="hidden lg:block col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 sticky top-22">
              <h2 className="text-xl font-semibold text-gray-900">Find Your Mentor</h2>
              
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-gray-700">Search by Name or Skills</Label>
                <Input 
                  placeholder="e.g. DSA, Client Acquisition ..." 
                  value={tempFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="border-gray-200"
                />
              </div>

              {/* Mentoring Areas */}
              <div className="space-y-3">
                <Label className="text-gray-700">Mentoring Area</Label>
                {MENTORING_AREAS.map(area => (
                  <div key={area} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={tempFilters.area === area}
                      onCheckedChange={(checked) => handleFilterChange('area', checked ? area : '')}
                    />
                    <Label className="capitalize text-gray-600 cursor-pointer">
                      {area.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
    </div>
    
              {/* Rate Range */}
              <div className="space-y-2">
                <Label className="text-gray-700">Maximum Rate (₹/min): {tempFilters.maxRate}</Label>
                <Slider
                  value={[tempFilters.maxRate]}
                  onValueChange={([value]) => handleFilterChange('maxRate', value)}
                  max={50}
                  step={1}
                  className="py-4"
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label className="text-gray-700">Minimum Experience (years): {tempFilters.experience}</Label>
                <Slider
                  value={[tempFilters.experience]}
                  onValueChange={([value]) => handleFilterChange('experience', value)}
                  max={40}
                  step={1}
                  className="py-4"
                />
              </div>

              {/* Filter Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleApplyFilters}
                  className="w-full bg-customYellow hover:bg-customYellow hover:scale-105 text-black"
                >
                  Apply Filters
                </Button>
                <Button 
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Mentor List - Right Side */}
          <div className="col-span-12 lg:col-span-9 space-y-4 mb-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg bg-gray-200 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="h-5 w-56 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
                          <div className="h-5 w-40 bg-yellow-100 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-11/12 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-10/12 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Array.from({ length: 8 }).map((_, chipIdx) => (
                            <div key={chipIdx} className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                          <div className="h-9 w-28 bg-gray-200 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No mentors found matching your criteria.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {mentors.map(mentor => (
                  <ProfileCard key={mentor._id} mentor={mentor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
  </div>
  );
}