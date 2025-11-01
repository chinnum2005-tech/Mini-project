import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null, mentorApproved = false }) => {
  const { user, isAuthenticated, loading, mentorStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    } else if (requiredRole && user && user.userType !== requiredRole) {
      // Redirect if user doesn't have required role
      if (requiredRole === "mentor") {
        navigate("/mentor-application");
      } else {
        navigate("/role-selection");
      }
    } else if (mentorApproved && mentorStatus && !mentorStatus.canAccessMentor) {
      // Redirect if mentor is not approved
      navigate("/mentor-application");
    }
  }, [isAuthenticated, user, loading, mentorStatus, requiredRole, mentorApproved, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated and meets role requirements, render children
  if (isAuthenticated) {
    // If no specific role required, or user has required role
    if (!requiredRole || user?.userType === requiredRole) {
      // If mentor approval is required, check status
      if (mentorApproved) {
        if (mentorStatus?.canAccessMentor) {
          return children;
        }
        // Still loading mentor status or not approved
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Checking mentor approval status...</p>
            </div>
          </div>
        );
      }
      return children;
    }
  }

  // User not authenticated or doesn't meet requirements
  return null;
};

export default ProtectedRoute;