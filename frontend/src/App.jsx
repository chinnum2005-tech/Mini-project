import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LenisWrapper from "./components/LenisWrapper";
import ChatWidget from "./components/WorkingChatWidget";
import AnimationProvider from "./providers/AnimationProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages that exist
import Index from "./pages/Index.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Skills from "./pages/Skills.jsx";
import Match from "./pages/Match.jsx";
import Sessions from "./pages/Sessions.jsx";
import Settings from "./pages/Settings.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import SetPassword from "./pages/SetPassword.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import BlockchainCertificates from "./pages/BlockchainCertificates.jsx";
import RoleSelection from "./pages/RoleSelection.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import MentorDashboard from "./pages/MentorDashboard.jsx";
import StudentProfileSetup from "./pages/StudentProfileSetup.jsx";
import MentorApplication from "./pages/MentorApplication.jsx";

// Demo pages
import DemoGlowingEffect from "./pages/DemoGlowingEffect.jsx";
import Demo3DHero from "./pages/Demo3DHero.tsx";
import DemoBeams from "./pages/DemoBeams.tsx";
import DemoLoginModern from "./pages/DemoLoginModern.tsx";
import ClickSparkDemo from "./pages/ClickSparkDemo.jsx";
import TestClickSpark from "./pages/TestClickSpark.jsx";
import MagicBentoDemo from "./pages/MagicBentoDemo.jsx";
import TestMagicBento from "./pages/TestMagicBento.jsx";
import SplitTextDemo from "./pages/SplitTextDemo.jsx";
import TestSplitText from "./pages/TestSplitText.jsx";
import GlitchTextDemo from "./pages/GlitchTextDemo.jsx";
import TestGlitchText from "./pages/TestGlitchText.jsx";
import ConnectionTest from "./pages/ConnectionTest.jsx";
import AnimationShowcase from "./pages/AnimationShowcase.jsx";
import AnimationDebug from "./pages/AnimationDebug.jsx";
import SimpleAnimationTest from "./pages/SimpleAnimationTest.jsx";
import MinimalAnimations from "./pages/MinimalAnimations.jsx";
import ComponentTest from "./pages/ComponentTest.jsx";
import ReactComponentTest from "./pages/ReactComponentTest.jsx";
import AnimationSettings from "./pages/AnimationSettings.jsx";
import AnimationGuide from "./pages/AnimationGuide.jsx";
import VoiceChatDemo from "./pages/VoiceChatDemo.jsx";

function App() {
  return (
    <AnimationProvider>
      <LenisWrapper 
        enableClickSpark={true}
        enableBackground={true}
        backgroundType="gradient"
      >
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/mentor-dashboard" element={<ProtectedRoute requiredRole="mentor" mentorApproved={true}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor-application" element={<ProtectedRoute><MentorApplication /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
            <Route path="/match" element={<ProtectedRoute><Match /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
            <Route path="/student-profile-setup" element={<ProtectedRoute><StudentProfileSetup /></ProtectedRoute>} />
            <Route path="/blockchain-certificates" element={<ProtectedRoute><BlockchainCertificates /></ProtectedRoute>} />
            <Route path="/animation-settings" element={<AnimationSettings />} />
            <Route path="/animation-guide" element={<AnimationGuide />} />

            {/* Demo routes */}
            <Route path="/demo-glow" element={<DemoGlowingEffect />} />
            <Route path="/demo-3d" element={<Demo3DHero />} />
            <Route path="/demo-beams" element={<DemoBeams />} />
            <Route path="/demo-login" element={<DemoLoginModern />} />
            <Route path="/demo-clickspark" element={<ClickSparkDemo />} />
            <Route path="/test-clickspark" element={<TestClickSpark />} />
            <Route path="/demo-magicbento" element={<MagicBentoDemo />} />
            <Route path="/test-magicbento" element={<TestMagicBento />} />
            <Route path="/demo-splittext" element={<SplitTextDemo />} />
            <Route path="/test-splittext" element={<TestSplitText />} />
            <Route path="/demo-glitchtext" element={<GlitchTextDemo />} />
            <Route path="/test-glitchtext" element={<TestGlitchText />} />
            <Route path="/connection-test" element={<ConnectionTest />} />
            <Route path="/animation-showcase" element={<AnimationShowcase />} />
            <Route path="/animation-debug" element={<AnimationDebug />} />
            <Route path="/simple-animation-test" element={<SimpleAnimationTest />} />
            <Route path="/minimal-animations" element={<MinimalAnimations />} />
            <Route path="/component-test" element={<ComponentTest />} />
            <Route path="/react-component-test" element={<ReactComponentTest />} />
            <Route path="/voice-chat-demo" element={<VoiceChatDemo />} />
          </Routes>

          {/* Advanced AI Chat Widget - appears on all pages */}
          <ChatWidget />
        </div>
      </LenisWrapper>
    </AnimationProvider>
  );
}

export default App;