import React from 'react';
import { Link } from 'react-router-dom';
import { BeamsBlockLearn } from '@/components/ui/beams-blocklearn';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, Zap, Shield, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Ethereal Beams Hero Section */}
      <section className="relative min-h-screen w-full bg-black text-white overflow-hidden">
        {/* Animated Beams Background */}
        <div className='absolute inset-0 z-0'>
          <BeamsBlockLearn
            beamWidth={2.5}
            beamHeight={18}
            beamNumber={15}
            lightColor="#10b981"
            speed={2.5}
            noiseIntensity={2}
            scale={0.15}
            rotation={43}
          />
        </div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[1]" />

        {/* Glassmorphic Navigation */}
        <nav className="relative z-20 w-full">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Brand */}
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-emerald-400" />
                <span className="text-xl font-bold text-white">BlockLearn</span>
              </div>

              {/* Glassmorphic Navigation Pills */}
              <div className="hidden md:flex items-center space-x-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 p-1">
                <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white">
                  Features
                </a>
                <a href="#stats" className="rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white">
                  Stats
                </a>
                <a href="#cta" className="rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/10 hover:text-white">
                  Join
                </a>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hidden sm:flex items-center rounded-full px-4 py-2 text-sm font-medium text-white/90 transition-all hover:text-white hover:bg-white/10">
                  Login
                </Link>
                <Link to="/signup" className="group relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out rounded-full h-12 px-6 py-3 text-sm bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg">
                  <span className="relative z-10 flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-8 py-20 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-6xl space-y-12">
            <div className="flex flex-col items-center text-center space-y-8">
              <Badge variant="secondary" className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/30 px-4 py-2 rounded-full">
                ✨ Peer-to-Peer Learning Platform
              </Badge>
              
              <div className="space-y-6 flex items-center justify-center flex-col">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
                  Connect, Learn, and
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Share Skills
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                  Join a vibrant community where students exchange knowledge, learn new skills, 
                  and build meaningful connections through peer-to-peer learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
                  <Link to="/signup" className="text-base px-8 py-4 rounded-xl bg-emerald-500 text-white border border-emerald-400/20 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all font-medium">
                    Start Learning Today
                  </Link>
                  <Link to="/login" className="text-base px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all font-medium">
                    I Already Have an Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto pt-8">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3 hover:bg-white/10 transition-colors">
                <GraduationCap size={20} className="text-emerald-400 md:w-6 md:h-6" />
                <h3 className="text-sm md:text-base font-semibold">Learn Anything</h3>
                <p className="text-xs md:text-sm text-gray-400">From programming to photography, find peers to learn from.</p>
              </div>
              
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3 hover:bg-white/10 transition-colors">
                <Users size={20} className="text-teal-400 md:w-6 md:h-6" />
                <h3 className="text-sm md:text-base font-semibold">Connect</h3>
                <p className="text-xs md:text-sm text-gray-400">Build relationships with students who share your interests.</p>
              </div>
              
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3 hover:bg-white/10 transition-colors">
                <Zap size={20} className="text-yellow-400 md:w-6 md:h-6" />
                <h3 className="text-sm md:text-base font-semibold">Fast Setup</h3>
                <p className="text-xs md:text-sm text-gray-400">Get started in minutes with our streamlined onboarding.</p>
              </div>
              
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3 hover:bg-white/10 transition-colors">
                <Shield size={20} className="text-blue-400 md:w-6 md:h-6" />
                <h3 className="text-sm md:text-base font-semibold">Secure</h3>
                <p className="text-xs md:text-sm text-gray-400">Campus-verified authentication for a safe environment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BlockLearn?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the features that make learning and teaching seamless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Learn Anything</h3>
              <p className="text-gray-600">
                From programming to photography, find peers who can teach you new skills 
                or learn from your own expertise.
              </p>
            </div>

            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 009.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect with Peers</h3>
              <p className="text-gray-600">
                Build meaningful relationships with fellow students who share your 
                interests and learning goals.
              </p>
            </div>

            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Secure</h3>
              <p className="text-gray-600">
                Campus-verified authentication ensures a safe environment for all 
                students to learn and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-green-100 text-sm md:text-base">Active Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
              <div className="text-green-100 text-sm md:text-base">Skills Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">1000+</div>
              <div className="text-green-100 text-sm md:text-base">Sessions Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">4.9★</div>
              <div className="text-green-100 text-sm md:text-base">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who are already sharing knowledge and building skills together.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">BlockLearn</h3>
            <p className="text-gray-400 mb-6">
              Connecting students through knowledge sharing
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
