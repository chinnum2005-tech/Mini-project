import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Sparkles, ArrowLeft, Mail, User, CheckCircle, AlertCircle } from "lucide-react";
import { sendOTP, verifyOTP } from "@/api";
import { useAuth } from "@/contexts/AuthContext";

function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup"); // "signup" or "verify"
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await sendOTP(email);
      if (response.success) {
        setMessage("✅ OTP sent to your email! Please check your inbox.");
        setStep("verify");
      } else {
        setMessage(`❌ ${response.message || "Failed to send OTP. Please try again."}`);
      }
    } catch (error) {
      setMessage("❌ Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await verifyOTP(email, otp, firstName, lastName, true);
      if (response.success) {
        await login(response.token, response.user);
        setMessage("✅ Account created successfully!");
        // Redirect to profile setup for new users
        setTimeout(() => navigate("/student-profile-setup"), 1500);
      } else {
        setMessage(`❌ ${response.message || "Invalid OTP. Please try again."}`);
      }
    } catch (error) {
      setMessage("❌ Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">
              Join the BlockLearn community today
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
              {step === "signup" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                        required
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
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
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
                      "Send OTP to Email"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Enter Verification Code</h3>
                    <p className="text-muted-foreground text-sm">
                      We've sent a 6-digit code to <strong>{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 rounded-xl bg-primary text-primary-foreground border border-primary/20 shadow-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                      "Create Account"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("signup");
                      setOtp("");
                      setMessage("");
                    }}
                    className="w-full px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    ← Back to signup
                  </button>
                </form>
              )}

              {/* Message Display */}
              {message && (
                <div className={`mt-4 p-4 rounded-xl backdrop-blur-sm ${
                  message.includes("✅")
                    ? "bg-primary/20 text-foreground border border-primary/30"
                    : "bg-destructive/20 text-foreground border border-destructive/30"
                }`}>
                  <div className="flex items-center">
                    {message.includes("✅") ? (
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
}

export default Signup;