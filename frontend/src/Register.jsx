import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendOTP, verifyOTP } from './api';
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Sparkles, ArrowLeft, Mail, User, CheckCircle, AlertCircle } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState("enterDetails"); // enterDetails → otp
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const normalizeEmail = (value) => {
    const trimmed = (value || "").trim().toLowerCase();
    if (!trimmed) return "";
    return trimmed.includes("@") ? trimmed : `${trimmed}@saividya.ac.in`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setMessage("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      console.log('Sending OTP for registration:', formData);
      await sendOTP(normalizeEmail(formData.email), true);
      setStep("otp");
      setMessage("OTP sent to your email! Check your inbox.");
    } catch (error) {
      console.error('Send OTP error:', error);
      setMessage(error.response?.data?.message || error.response?.data?.error || error.message || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter the OTP");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      console.log('Verifying OTP for registration:', { email: formData.email, otp, firstName: formData.firstName, lastName: formData.lastName });
      const res = await verifyOTP(normalizeEmail(formData.email), otp, formData.firstName, formData.lastName, true);
      localStorage.setItem("token", res.token);
      
      // Save user data to localStorage for offline access
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        profileComplete: res.user?.profileComplete || false
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      
      setMessage("✅ Registration successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setMessage(error.response?.data?.message || error.response?.data?.error || error.message || "Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("enterDetails");
    setMessage("");
    setOtp("");
  };

  // Google OAuth registration handler
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    setIsLoading(true);
    setMessage("");
    try {
      const res = await axios.post('/api/auth/google', { 
        credential: credentialResponse.credential,
        isNewUser: true
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));
      setMessage("✅ Registration successful! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Google registration error:", error);
      setMessage(error.response?.data?.message || "Google registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    setMessage("Google registration failed. Please try again.");
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-50 dark:bg-slate-950 text-foreground overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground 
        type="blobs" 
        intensity={0.6}
        disableOnMobile={true}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <Sparkles className="w-10 h-10 text-primary" />
              <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BlockLearn
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {step === "enterDetails" ? "Create Your Account" : "Verify Your Email"}
            </h2>
            <p className="text-muted-foreground">
              {step === "enterDetails" 
                ? "Join the BlockLearn community today" 
                : "We've sent a verification code to your email"
              }
            </p>
          </div>

          {/* Form Card */}
          <div 
            className="backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-border/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Gradient Blob Effect */}
            <div
              className={`absolute pointer-events-none w-[400px] h-[400px] bg-gradient-hero opacity-20 rounded-full blur-3xl transition-opacity duration-200 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />

            <div className="relative z-10">
              {/* Google Sign In */}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="100%"
                className="w-full"
              />

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">or register with email</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

          {step === "enterDetails" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Campus Email
                </label>
                <input
                  id="email"
                  type="text"
                  name="email"
                  placeholder="yourid (e.g., abc or xyz.12)"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && sendOtp()}
                />
                <p className="text-xs text-muted-foreground mt-1">We will use @saividya.ac.in by default</p>
              </div>
              
              <button
                onClick={sendOtp}
                disabled={isLoading}
                className="w-full px-8 py-4 rounded-xl bg-primary text-primary-foreground border border-primary/20 shadow-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2 text-center">
                  Enter Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm font-mono"
                  maxLength="6"
                  onKeyPress={(e) => e.key === 'Enter' && verifyOtp()}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Code sent to: <span className="text-primary font-medium">{formData.email}</span>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={goBack}
                  className="flex-1 px-6 py-3 rounded-xl bg-card/50 text-foreground border border-border backdrop-blur-sm hover:bg-card transition-all font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={verifyOtp}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground border border-primary/20 shadow-lg hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-xl active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify & Register"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (message.includes("✅") || message.includes("sent")) && (
            <div className="mt-4 p-4 rounded-xl backdrop-blur-sm bg-primary/20 text-foreground border border-primary/30">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}
          {message && !(message.includes("✅") || message.includes("sent")) && (
            <div className="mt-4 p-4 rounded-xl backdrop-blur-sm bg-destructive/20 text-foreground border border-destructive/30">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}
            </div>
          </div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <p className="text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in here
            </Link>
          </p>
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;
