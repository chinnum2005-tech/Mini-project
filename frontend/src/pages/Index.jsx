import { Button } from "@/components/ui/button";
import SkillCard from "@/components/SkillCard";
import CategoryCard from "@/components/CategoryCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  Languages,
  Briefcase,
  Sparkles,
  Users,
  ArrowRight,
  BookOpen,
  Camera,
  Music,
  Calculator,
  Mic,
  Heart,
  Zap,
  Star,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AnimatedButton, AnimatedCard, AnimatedText } from "@/components/GlobalAnimations";

const Index = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    navigate('/role-selection');
  };

  const handleLogin = () => {
    navigate('/role-selection');
  };

  const handleBrowseSkills = () => {
    navigate('/skills');
  };

  const handleVoiceChatDemo = () => {
    navigate('/voice-chat-demo');
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-foreground overflow-hidden"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Animated Background */}
      <AnimatedBackground 
        type="gradient"
        primaryColor="hsl(var(--primary))"
        secondaryColor="hsl(var(--secondary))"
        intensity={0.7}
        className="fixed inset-0 -z-10"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <motion.nav 
          className="backdrop-blur-md bg-white/10 dark:bg-slate-900/10 border-b border-white/20 dark:border-slate-700/20"
          variants={item}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <AnimatedText 
                  text="BlockLearn" 
                  type="split" 
                  className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogin}
                  className="text-gray-600 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleVoiceChatDemo}
                  className="text-gray-600 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Mic className="w-4 h-4" />
                  Voice Demo
                </button>
                <AnimatedButton 
                  onClick={handleGetStarted} 
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started
                </AnimatedButton>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div className="mb-8" variants={item}>
              <AnimatedText 
                text="Learn Together, Grow Together" 
                type="split" 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-slate-100 mb-6"
              />
              <motion.p 
                className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Connect with expert mentors, share your knowledge, and build blockchain-verified certificates in our peer-to-peer learning community.
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              variants={item}
            >
              <AnimatedButton
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl"
              >
                Start Learning Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </AnimatedButton>
              <AnimatedButton
                size="lg"
                variant="outline"
                onClick={handleBrowseSkills}
                className="text-lg px-8 py-4 rounded-xl shadow-sm hover:shadow-md"
              >
                Browse Skills
              </AnimatedButton>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
              variants={container}
            >
              <AnimatedCard className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 rounded-2xl p-8">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Find Mentors</h3>
                <p className="text-gray-600 dark:text-slate-400">Connect with experienced mentors in your field of interest</p>
              </AnimatedCard>
              <AnimatedCard className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 rounded-2xl p-8">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Book Sessions</h3>
                <p className="text-gray-600 dark:text-slate-400">Schedule personalized 1-on-1 learning sessions</p>
              </AnimatedCard>
              <AnimatedCard className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 rounded-2xl p-8">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Earn Certificates</h3>
                <p className="text-gray-600 dark:text-slate-400">Get blockchain-verified certificates for your achievements</p>
              </AnimatedCard>
            </motion.div>
          </div>
        </main>

        {/* How It Works Section */}
        <motion.section 
          id="how-it-works" 
          className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 dark:bg-slate-800/5 backdrop-blur-sm"
          variants={item}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-16" variants={item}>
              <AnimatedText 
                text="How It Works" 
                type="split" 
                className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4"
              />
              <motion.p 
                className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Get started with BlockLearn in three simple steps
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={container}
            >
              <AnimatedCard className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Create Your Profile</h3>
                <p className="text-gray-600 dark:text-slate-400">Sign up and add your skills, interests, and availability to connect with the right mentors and learners.</p>
              </AnimatedCard>

              <AnimatedCard className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Find Your Match</h3>
                <p className="text-gray-600 dark:text-slate-400">Browse available mentors or learners, filter by skills and availability, and book sessions that fit your schedule.</p>
              </AnimatedCard>

              <AnimatedCard className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Learn & Earn</h3>
                <p className="text-gray-600 dark:text-slate-400">Complete sessions, provide feedback, and earn blockchain-verified certificates for your learning achievements.</p>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-20 px-4 sm:px-6 lg:px-8"
          variants={item}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              variants={container}
            >
              <AnimatedCard>
                <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
                <div className="text-gray-600 dark:text-slate-400">Active Learners</div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-gray-600 dark:text-slate-400">Expert Mentors</div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-gray-600 dark:text-slate-400">Skills Available</div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-gray-600 dark:text-slate-400">Hours Learned</div>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Index;