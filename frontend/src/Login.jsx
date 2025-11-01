import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendOTP, verifyOTP } from './api';
import api from './api';
import { GoogleLogin } from '@react-oauth/google';
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Sparkles, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function Login() {
  const [step, setStep] = useState("enterEmail"); // enterEmail -> enterOtp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const normalizeEmail = (value) => {
    const trimmed = (value || "").trim().toLowerCase();
    if (!trimmed) return "";
    // TEMPORARILY DISABLED: Accept any email without auto-appending domain
    return trimmed;
    // ORIGINAL: return trimmed.includes("@") ? trimmed : `${trimmed}@saividya.ac.in`;
  };

  const sendOtp = async () => {
    const targetEmail = normalizeEmail(email);
    if (!targetEmail) { setMessage("Please enter your email"); return; }
    setIsLoading(true);
    setMessage("");
    try {
      console.log('Sending OTP for login:', { email: targetEmail });
      await sendOTP(targetEmail, false);
      setStep("enterOtp");
      setEmail(targetEmail);
      setMessage(`OTP sent to ${targetEmail}. Please check your inbox.`);
    } catch (error) {
      console.error('Send OTP error:', error);
      setMessage(error.response?.data?.message || error.response?.data?.error || "Failed to send OTP. Ensure backend and SMTP are configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) { setMessage("Please enter the OTP"); return; }
    setIsLoading(true);
    setMessage("");
    try {
      console.log('Verifying OTP for login:', { email, otp });
      const res = await verifyOTP(normalizeEmail(email), otp, null, null, false);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userData", JSON.stringify(res.user));
      navigate("/dashboard");
    } catch (error) {
      console.error('Verify OTP error:', error);
      setMessage(error.response?.data?.message || error.response?.data?.error || "Invalid OTP or server unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Google OAuth login handler
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    setIsLoading(true);
    setMessage("");
    try {
      const response = await api.post('/api/auth/google', { 
        credential: credentialResponse.credential 
      });
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        navigate("/dashboard");
      } else {
        setMessage(response.data.message || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setMessage(error.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Sign In Error:", error);
    // Show detailed error in UI for debugging
    setMessage(`Google sign in failed: ${error?.error || error?.message || JSON.stringify(error)}. Try email login instead.`);
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              {step === "enterEmail" ? "Sign in to continue learning" : "Enter the code sent to your email"}
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
              {/* Google Sign In */}
               <GoogleLogin
                 onSuccess={handleGoogleSuccess}
                 onError={handleGoogleError}
                 useOneTap
                 theme="filled_blue"
                 text="signin_with"
                 shape="pill"
                 size="large"
                 width="100%"
                 logo_alignment="center"
                 className="w-full"
               />

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">or use your email</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4">
                {step === "enterEmail" ? "Login with OTP" : "Verify OTP"}
              </h3>
          {step === "enterEmail" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  onKeyPress={(e) => e.key === 'Enter' && sendOtp()}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Enter your full email address</p>
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
                ) : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white mb-2 text-center">Enter OTP Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-4 bg-card/50 border border-border rounded-xl text-foreground text-center text-2xl tracking-[0.5em] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && verifyOtp()}
                  required
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Code sent to <span className="text-primary">{email}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  className="flex-1 px-6 py-3 rounded-xl bg-card/50 text-foreground border border-border backdrop-blur-sm hover:bg-card transition-all font-medium flex items-center justify-center gap-2" 
                  onClick={() => setStep("enterEmail")}
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
                    "Verify & Login"
                  )}
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-xl backdrop-blur-sm ${
              message.includes("sent") || message.includes("✅")
                ? "bg-primary/20 text-foreground border border-primary/30"
                : "bg-destructive/20 text-foreground border border-destructive/30"
            }`}>
              <div className="flex items-center">
                {message.includes("sent") || message.includes("✅") ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up here
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
}