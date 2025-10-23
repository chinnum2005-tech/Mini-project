import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Wallet, Award, BookOpen, Users, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCard, AnimatedButton, AnimatedText } from "../components/GlobalAnimations";

function Dashboard() {
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
    : (emailLocal || "User");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-slate-950"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Header */}
      <motion.header 
        className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800"
        variants={item}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold text-primary">
                <AnimatedText text="BlockLearn" type="split" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent" />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-slate-300 text-sm truncate max-w-32">{displayName}</span>
              <Link to="/settings" className="text-gray-600 dark:text-slate-300 hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <AnimatedButton
                onClick={handleLogout}
                className="text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </AnimatedButton>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div className="mb-8" variants={item}>
          <AnimatedText 
            text={`Welcome back, ${user.first_name || user.firstName}!`} 
            type="split" 
            className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2"
          />
          <motion.p 
            className="text-gray-600 dark:text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ready to continue your learning journey?
          </motion.p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={container}
        >
          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Find a Mentor</h3>
            <p className="text-gray-600 dark:text-slate-400">Connect with experienced mentors in your field</p>
          </AnimatedCard>

          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <BookOpen className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Book a Session</h3>
            <p className="text-gray-600 dark:text-slate-400">Schedule personalized learning sessions</p>
          </AnimatedCard>

          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <Award className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">View Certificates</h3>
            <p className="text-gray-600 dark:text-slate-400">See your blockchain-verified achievements</p>
          </AnimatedCard>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={container}
        >
          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Skills Learning</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">3</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Sessions Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">5</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">2</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Wallet Connected</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">Yes</p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={container}
        >
          {/* Recent Sessions */}
          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Sessions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">JavaScript Fundamentals</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">with Jane Smith</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">React Hooks</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">with Mike Johnson</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                  Upcoming
                </span>
              </div>
            </div>
          </AnimatedCard>

          {/* Learning Goals */}
          <AnimatedCard className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Learning Goals</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">Complete React Course</h3>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">65% completed</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-slate-100">Blockchain Basics</h3>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">30% completed</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default Dashboard;