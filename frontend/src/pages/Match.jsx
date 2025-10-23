import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function Match() {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    matchType: 'both',
    availability: 'any'
  });

  // Fetch available skills for learning
  useEffect(() => {
    const fetchAvailableSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/user-skills/skills/available-for-learning`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableSkills(response.data.data || []);
      } catch (error) {
        console.error('Error fetching available skills:', error);
      }
    };

    fetchAvailableSkills();
  }, []);

  // Handle skill selection
  const handleSkillSelect = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  // Find matches based on selected skills
  const findMatches = async () => {
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill you want to learn');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/skill-matching/match-mentors`, 
        { skill_preferences: selectedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMatches(response.data.data.matched_mentors || []);
    } catch (error) {
      console.error('Error finding matches:', error);
      alert('Error finding matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">BlockLearn</h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/skills" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Skills
              </Link>
              <Link to="/match" className="text-primary-600 dark:text-primary-400 font-medium">
                Match
              </Link>
              <Link to="/sessions" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Sessions
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">Find Your Perfect Mentor</h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select the skills you want to learn and find mentors who can help you
          </p>
        </div>

        {/* Skill Selection */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Select Skills You Want to Learn</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors text-center ${
                  selectedSkills.includes(skill.id)
                    ? "bg-primary/10 border border-primary"
                    : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => handleSkillSelect(skill.id)}
              >
                <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{skill.name}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{skill.category}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button 
              className="btn-primary"
              onClick={findMatches}
              disabled={loading || selectedSkills.length === 0}
            >
              {loading ? 'Finding Mentors...' : 'Find Mentors'}
            </button>
            {selectedSkills.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                Selected {selectedSkills.length} skill(s) to learn
              </p>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Filter Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Skill Category</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Skills</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="languages">Languages</option>
                <option value="music">Music</option>
                <option value="photography">Photography</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Match Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.matchType}
                onChange={(e) => handleFilterChange('matchType', e.target.value)}
              >
                <option value="both">Both (Teach & Learn)</option>
                <option value="teach">I can teach</option>
                <option value="learn">I want to learn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Availability</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
              >
                <option value="any">Any time</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="text-center py-10">
            <div className="loader mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-slate-400">Finding the best mentors for you...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {matches.map((match) => (
              <div key={match.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold">
                    {match.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">{match.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{match.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Stats:</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Rating: {match.stats.average_rating ? match.stats.average_rating.toFixed(1) : 'N/A'} ({match.stats.total_reviews} reviews)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {match.stats.total_sessions} sessions taught
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button className="btn-primary flex-1">Connect</button>
                  <button className="btn-secondary">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-slate-400">No mentors found. Try selecting different skills or adjusting your filters.</p>
          </div>
        )}

        {/* Load More */}
        {!loading && matches.length > 0 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">Load More Mentors</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Match;