import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Wallet, Award, BookOpen, Users, Settings, LogOut, Calendar, DollarSign, Star } from "lucide-react";

function MentorDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  useEffect(() => {
    // Check if we have a token and try to get real user data
    if (token) {
      (async () => {
        try {
          const res = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        } catch (error) {
          console.log("Backend not available, using local storage data");
          // If backend is not available, try to get user data from localStorage
          const savedUser = localStorage.getItem("userData");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // No saved data, redirect to login
            handleLogout();
          }
        }
      })();
    } else {
      // No token, check if we have saved user data
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // No saved data, redirect to login
        navigate("/login");
      }
    }
  }, [token, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const nameAvailable = (user?.firstName || user?.first_name) && (user?.lastName || user?.last_name);
  const emailLocal = (user?.email || "").split("@")[0];
  const displayName = nameAvailable
    ? `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
    : (emailLocal || "Mentor");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold text-primary">
                BlockLearn
              </Link>
              <span className="ml-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full">
                Mentor
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-slate-300 text-sm truncate max-w-32">{displayName}</span>
              <Link to="/settings" className="text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Welcome back, {user.first_name || user.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Ready to help students learn today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/sessions" className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <Calendar className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">My Sessions</h3>
            <p className="text-gray-600 dark:text-slate-400">View and manage your upcoming sessions</p>
          </Link>

          <Link to="/match" className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Student Requests</h3>
            <p className="text-gray-600 dark:text-slate-400">Review and accept session requests</p>
          </Link>

          <Link to="/blockchain-certificates" className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <Award className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">My Earnings</h3>
            <p className="text-gray-600 dark:text-slate-400">Track your rewards and certificates</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Students Mentored</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Sessions Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">42</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">4.8</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">12.5 BLC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">Advanced React Patterns</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">with Alex Johnson</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                  Today, 2:00 PM
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">JavaScript ES6+</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">with Sarah Williams</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                  Tomorrow, 10:00 AM
                </span>
              </div>
            </div>
            <Link to="/sessions" className="mt-4 inline-block text-primary hover:text-primary/80 font-medium">
              View all sessions →
            </Link>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Feedback</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-slate-100">Alex Johnson</span>
                </div>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  "Great session! Learned a lot about React hooks and best practices."
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-slate-100">Sarah Williams</span>
                </div>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  "Very patient and knowledgeable mentor. Highly recommended!"
                </p>
              </div>
            </div>
            <Link to="/sessions" className="mt-4 inline-block text-primary hover:text-primary/80 font-medium">
              View all feedback →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;