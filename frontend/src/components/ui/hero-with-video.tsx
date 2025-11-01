import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Play, Pause, Mail, ArrowRight, Menu, ChevronDown, Sun, Moon } from 'lucide-react';

interface NavbarHeroProps {
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  backgroundImage?: string;
  videoUrl?: string;
  emailPlaceholder?: string;
}

const NavbarHero: React.FC<NavbarHeroProps> = ({
  brandName = "nexus",
  heroTitle = "Innovation Meets Simplicity",
  heroSubtitle = "Join the community",
  heroDescription = "Discover cutting-edge solutions designed for the modern digital landscape.",
  backgroundImage = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  emailPlaceholder = "enter@email.com"
}) => {
  const [email, setEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailSubmit = () => {
    console.log('Email submitted:', email);
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      const p = videoRef.current.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {});
      }
      setIsVideoPlaying(true);
      setIsVideoPaused(false);
    }
  };

  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
  };
  
  const handleResumeVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPaused(false);
    }
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(true);
    setIsVideoPaused(false);
  };

  useEffect(() => {
    // Attempt autoplay on mount; requires muted + playsInline
    if (videoRef.current) {
      videoRef.current.muted = true;
      const p = videoRef.current.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {});
      }
    }
  }, []);

  const ThemeToggleButton = () => {
    if (!mounted) return <div className="w-10 h-10" />;
    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="bg-slate-200/70 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 flex-shrink-0 p-2.5 rounded-full transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
    );
  };

  return (
    <main className="relative bg-background overflow-hidden">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* --- Navbar --- */}
        <div className="py-2 relative z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="#" className="font-bold text-2xl pb-1 cursor-pointer flex-shrink-0">
              {brandName}
            </a>
            <nav className="hidden lg:flex font-medium">
              <ul className="flex items-center space-x-2">
                <li><a href="#" className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg">About</a></li>
                <li className="relative">
                  <button onClick={() => toggleDropdown('desktop-resources')} className="flex items-center hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg">
                    Resources<ChevronDown className={`h-4 w-4 ml-1 transition-transform ${openDropdown === 'desktop-resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'desktop-resources' && (
                    <ul className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-border shadow-lg rounded-xl z-20 w-48">
                      <li><a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">Submenu 1</a></li>
                      <li><a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">Submenu 2</a></li>
                    </ul>
                  )}
                </li>
                <li><a href="#" className="hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg">Blog</a></li>
                <li className="relative">
                  <button onClick={() => toggleDropdown('desktop-pricing')} className="flex items-center hover:text-foreground px-3 py-2 text-sm transition-colors rounded-lg">
                    Plans & Pricing<ChevronDown className={`h-4 w-4 ml-1 transition-transform ${openDropdown === 'desktop-pricing' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'desktop-pricing' && (
                    <ul className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-border shadow-lg rounded-xl z-20 w-48">
                      <li><a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">Plan A</a></li>
                      <li><a href="#" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">Plan B</a></li>
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <a href="#" className="hover:text-muted-foreground cursor-pointer py-2 px-4 text-sm capitalize font-medium transition-colors rounded-xl">Login</a>
              <button className="bg-foreground hover:bg-slate-700 text-background py-2.5 px-5 text-sm rounded-xl capitalize font-medium transition-colors flex items-center gap-2">
                Get Started<ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ThemeToggleButton />
            <div className="lg:hidden relative">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-transparent hover:bg-muted border-none p-2 rounded-xl transition-colors">
                <Menu className="h-6 w-6" />
              </button>
              {isMobileMenuOpen && (
                <ul className="absolute top-full right-0 mt-2 p-2 shadow-lg bg-white dark:bg-slate-900 border border-border rounded-xl w-56 z-30">
                  <li><a href="#" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg">About</a></li>
                  <li><button onClick={() => toggleDropdown('mobile-resources')} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg">
                      Resources<ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-resources' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'mobile-resources' && (<ul className="ml-4 mt-1 border-l border-border pl-3">
                      <li><a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg">Submenu 1</a></li>
                      <li><a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg">Submenu 2</a></li>
                  </ul>)}</li>
                  <li><a href="#" className="block px-3 py-2 text-sm hover:bg-muted rounded-lg">Blog</a></li>
                  <li><button onClick={() => toggleDropdown('mobile-pricing')} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded-lg">
                      Plans & Pricing<ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-pricing' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'mobile-pricing' && (<ul className="ml-4 mt-1 border-l border-border pl-3">
                      <li><a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg">Plan A</a></li>
                      <li><a href="#" className="block px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg">Plan B</a></li>
                  </ul>)}</li>
                  <li className="border-t border-border mt-2 pt-2 space-y-2">
                    <a href="#" className="block w-full text-center px-3 py-2 text-sm hover:bg-muted rounded-lg">Login</a>
                    <button className="w-full bg-foreground text-background hover:bg-slate-700 px-3 py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all duration-200">
                      Get Started<ArrowRight className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* --- Hero Section --- */}
        <div className="pt-4 pb-10 sm:pt-6 sm:pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-5xl font-bold tracking-tight">{heroTitle}</h1>
            <p className="mt-6 text-lg text-muted-foreground">{heroDescription}</p>
            <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <input type="email" placeholder={emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-foreground placeholder-muted-foreground font-medium pl-10 pr-4 py-2 text-sm sm:pl-11 sm:py-3 sm:text-base rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <button onClick={handleEmailSubmit} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 text-sm sm:px-6 sm:py-3 sm:text-base rounded-full normal-case font-medium transition-colors flex items-center gap-2">
                Join Now<ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

{/* --- Media Header (autoplay background) --- */}
        <section className="relative w-full min-h-[70vh] overflow-hidden rounded-none">
          <img src={backgroundImage} alt="Background" className="w-full h-full absolute inset-0 object-cover opacity-0" />
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full absolute inset-0 object-cover pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
            onEnded={handleVideoEnded}
          />
          {/* Content overlay could go here if needed */}
        </section>
      </div>
    </main>
  );
};

export { NavbarHero };







