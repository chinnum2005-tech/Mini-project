import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, UserCog, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStudentLogin = () => {
    navigate('/login?role=student');
  };

  const handleMentorLogin = () => {
    navigate('/login?role=mentor');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="backdrop-blur-md bg-white/10 dark:bg-slate-900/10 border-b border-white/20 dark:border-slate-700/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  BlockLearn
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-slate-100 mb-6">
                Welcome to
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  BlockLearn
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Choose your role to get started with our peer-to-peer learning platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Student Card */}
              <div 
                className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={handleStudentLogin}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-6">
                    <GraduationCap className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Student</h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Learn new skills from expert mentors, book sessions, and earn blockchain-verified certificates.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                    onClick={handleStudentLogin}
                  >
                    Login as Student
                  </Button>
                </div>
              </div>

              {/* Mentor Card */}
              <div 
                className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={handleMentorLogin}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-500/10 p-4 rounded-full mb-6">
                    <UserCog className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Mentor</h3>
                  <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Share your expertise with students. Professors and teachers must apply and go through verification process.
                  </p>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full border-green-500 text-green-500 hover:bg-green-500/10 text-lg py-6 rounded-xl"
                    onClick={handleMentorLogin}
                  >
                    Apply as Mentor
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-gray-600 dark:text-slate-400">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-md border-t border-slate-700/20 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-400">
              &copy; 2024 BlockLearn. All rights reserved. Built with ❤️ for the learning community.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RoleSelection;