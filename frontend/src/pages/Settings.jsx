import React, { useState } from "react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null); // null, 'success', or 'error'
  const [deleteMessage, setDeleteMessage] = useState('');

  const current = theme === "system" ? systemTheme : theme;

  const handleDeleteAccount = async () => {
    // First confirmation step
    setDeleteStatus(null);
    
    setIsDeleting(true);
    
    try {
      // Get the auth token from localStorage (assuming it's stored there)
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Account deleted successfully
        setDeleteStatus('success');
        setDeleteMessage("Your account has been permanently deleted.");
        // Remove token from localStorage
        localStorage.removeItem('token');
        // Redirect to home page or login page after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        // Handle error
        setDeleteStatus('error');
        setDeleteMessage(data.message || "Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setDeleteStatus('error');
      setDeleteMessage("An error occurred while deleting your account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteStatus(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <section className="card">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Appearance</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">Choose your display theme. "System" follows your OS preference.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${current === "light" ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800" : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"}`}
            >
              <div className="font-medium text-gray-900 dark:text-slate-100">Light</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Bright interface</div>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${current === "dark" ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800" : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"}`}
            >
              <div className="font-medium text-gray-900 dark:text-slate-100">Dark</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Low-light friendly</div>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${theme === "system" ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800" : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"}`}
            >
              <div className="font-medium text-gray-900 dark:text-slate-100">System</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Match OS setting</div>
            </button>
          </div>
        </section>

        {/* Account Management Section */}
        <section className="card mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Account Management</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">Manage your account settings and preferences.</p>
          
          <div className="border border-red-200 dark:border-red-900 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Delete Account</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
            
            {/* First confirmation dialog */}
            {showDeleteConfirm && !deleteStatus && (
              <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-red-300 dark:border-red-700">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Confirm Account Deletion</h4>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                  Are you absolutely sure you want to delete your account? This will permanently remove all your data and cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Success or error message */}
            {deleteStatus && (
              <div className={`mt-4 p-4 rounded-lg border ${
                deleteStatus === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <h4 className={`font-medium ${
                  deleteStatus === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {deleteStatus === 'success' ? 'Account Deleted Successfully' : 'Deletion Failed'}
                </h4>
                <p className={`text-sm mt-1 ${
                  deleteStatus === 'success' 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {deleteMessage}
                </p>
                {deleteStatus === 'success' && (
                  <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                    Redirecting to homepage in 3 seconds...
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}