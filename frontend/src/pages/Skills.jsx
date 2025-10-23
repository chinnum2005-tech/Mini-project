import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function Skills() {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState(3);
  
  // Fetch available skills and user's skills
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch available skills for learning
        const availableResponse = await axios.get(`${API_URL}/user-skills/skills/available-for-learning`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableSkills(availableResponse.data.data || []);
        
        // Fetch user's current skills
        const userResponse = await axios.get(`${API_URL}/user-skills/skills`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserSkills(userResponse.data.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Add a skill to the user's learning list
  const addSkill = async () => {
    if (!selectedSkill) {
      alert('Please select a skill to add');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/user-skills/skills`, 
        { 
          skill_id: parseInt(selectedSkill), 
          skill_type: 'needed', // Students can only have "needed" skills
          proficiency_level: proficiencyLevel 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add the new skill to the user's skills list
      setUserSkills([...userSkills, response.data.data]);
      
      // Reset form
      setSelectedSkill('');
      setProficiencyLevel(3);
      
      alert('Skill added successfully!');
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Error adding skill. Please try again.');
    }
  };

  // Remove a skill from the user's learning list
  const removeSkill = async (skillId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/user-skills/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the skill from the user's skills list
      setUserSkills(userSkills.filter(skill => skill.skill_id !== skillId));
      
      alert('Skill removed successfully!');
    } catch (error) {
      console.error('Error removing skill:', error);
      alert('Error removing skill. Please try again.');
    }
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
              <Link to="/skills" className="text-primary-600 dark:text-primary-400 font-medium">
                Skills
              </Link>
              <Link to="/match" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">My Learning Skills</h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage the skills you want to learn through BlockLearn
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="loader mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-slate-400">Loading your skills...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Add New Skill */}
            <section className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Add a New Skill to Learn</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Select a Skill
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                  >
                    <option value="">Choose a skill...</option>
                    {availableSkills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Your Current Proficiency Level
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={proficiencyLevel}
                      onChange={(e) => setProficiencyLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100 w-8">
                      {proficiencyLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
                
                <button 
                  className="btn-primary w-full mt-4"
                  onClick={addSkill}
                >
                  Add Skill
                </button>
              </div>
            </section>

            {/* My Learning Skills */}
            <section className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Skills I Want to Learn</h2>
              <div className="space-y-4">
                {userSkills.length > 0 ? (
                  userSkills.map((skill) => (
                    <div key={skill.skill_id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300">{skill.skill_name}</h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm">Category: {skill.category}</p>
                          <p className="text-blue-600 dark:text-blue-400 text-sm">
                            Proficiency Level: {skill.proficiency_level}/5
                          </p>
                        </div>
                        <button
                          onClick={() => removeSkill(skill.skill_id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-slate-400">
                    You haven't added any skills yet. Select a skill above to get started!
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Browse All Skills */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Browse All Available Skills</h2>
            <p className="text-gray-600 dark:text-slate-400">Explore the skills you can learn through BlockLearn</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {availableSkills.slice(0, 12).map((skill) => (
              <div key={skill.id} className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">{skill.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{skill.category}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Skills;