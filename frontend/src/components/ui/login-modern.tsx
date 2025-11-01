'use client'

import * as React from 'react'
import { useState } from 'react'
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react'

interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  [key: string]: any;
}

const AppInput = (props: InputProps) => {
  const { label, placeholder, icon, type = "text", ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
      { label && 
        <label className='block mb-2 text-sm'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          type={type}
          className="peer relative z-10 border-2 border-[var(--color-border)] h-13 w-full rounded-md bg-[var(--color-surface)] px-4 py-3 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-[var(--color-bg)] placeholder:font-medium text-[var(--color-text-primary)]"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)` ,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)` ,
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

const LoginModern = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

   const socialIcons = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"/>
        </svg>
      ),
      href: '#',
      gradient: 'bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500',
      label: 'Google',
    },
    {
      icon: <Instagram size={24} />,
      href: '#',
      gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500',
      label: 'Instagram',
    },
    {
      icon: <Linkedin size={24} />,
      href: '#',
      bg: 'bg-blue-600',
      label: 'LinkedIn',
    },
    {
      icon: <Facebook size={24} />,
      href: '#',
      bg: 'bg-blue-700',
      label: 'Facebook',
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-4">
    <div className='card w-full max-w-[1200px] lg:w-[70%] md:w-[85%] flex justify-between h-[600px] rounded-2xl overflow-hidden shadow-2xl'>
      <div
        className='w-full lg:w-1/2 px-4 lg:px-16 left h-full relative overflow-hidden bg-[var(--color-surface)]'
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 rounded-full blur-3xl transition-opacity duration-200 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)` ,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div className="form-container sign-in-container h-full z-10 relative">
            <form className='text-center py-10 md:py-20 grid gap-2 h-full' onSubmit={handleSubmit}>
              <div className='grid gap-4 md:gap-6 mb-2'>
                <h1 className='text-3xl md:text-4xl font-extrabold text-[var(--color-heading)]'>Sign in</h1>
                
                {/* Google Sign In Button - Primary */}
                <button
                  type="button"
                  onClick={() => {/* Handle Google Sign In */}}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23"/>
                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53"/>
                  </svg>
                  <span className="font-medium">Sign in with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                  <span className="text-xs text-[var(--color-text-secondary)]">or continue with</span>
                  <div className="flex-1 h-px bg-[var(--color-border)]"></div>
                </div>

                {/* Other Social Icons */}
                <div className="social-container">
                  <div className="flex items-center justify-center">
                    <ul className="flex gap-3 md:gap-4">
                      {socialIcons.slice(1).map((social, index) => {
                        return (
                          <li key={index} className="list-none">
                            <a
                              href={social.href}
                              title={social.label}
                              className={`w-[2.5rem] md:w-[3rem] h-[2.5rem] md:h-[3rem] bg-[var(--color-bg-2)] rounded-full flex justify-center items-center relative z-[1] border-2 border-[var(--color-text-primary)] overflow-hidden group` }
                            >
                              <div
                                className={`absolute inset-0 w-full h-full ${
                                  social.gradient || social.bg
                                } scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100`}
                              />
                              <span className="text-[1.5rem] text-[hsl(203,92%,8%)] transition-all duration-500 ease-in-out z-[2] group-hover:text-white">
                                {social.icon}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
            <span className='text-sm text-[var(--color-text-secondary)]'>or use your email</span>
            <div className='grid gap-4 items-center'>
                <AppInput placeholder="Email" type="email" />
                <AppInput placeholder="Password" type="password" />
              </div>
              <a href="#" className='font-light text-sm md:text-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors'>Forgot your password?</a>
              <div className='flex gap-4 justify-center items-center'>
                 <button 
                  type="submit"
                  className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-xl bg-[var(--color-border)] px-6 py-3 text-sm font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-[var(--color-text-primary)]/50 cursor-pointer"
                >
                <span className="text-sm px-2 py-1 relative z-10">Sign In</span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
              </button>
              </div>
            </form>
          </div>
        </div>
        <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative'>
            <img
              src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'
              alt="Login background"
              className="w-full h-full object-cover transition-transform duration-300 opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50" />
       </div>
      </div>
    </div>
  )
}

export default LoginModern
