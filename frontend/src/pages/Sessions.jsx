import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Video, Users } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import VideoConference from '../components/VideoConference';

const Sessions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState({
    upcoming: [],
    inProgress: [],
    completed: []
  });
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    sessionId: null,
    userRole: 'student',
    existingFeedback: null
  });

  // Mock data - in a real app, this would come from an API
  const mockSessions = {
    upcoming: [
      {
        id: 1,
        title: 'Advanced React Patterns',
        mentor: 'Alex Johnson',
        time: 'Today, 3:00 PM',
        duration: '60 min',
        location: 'Online',
        status: 'scheduled',
        meeting_link: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 2,
        title: 'Blockchain Fundamentals',
        mentor: 'Sarah Chen',
        time: 'Tomorrow, 10:00 AM',
        duration: '90 min',
        location: 'Online',
        status: 'scheduled',
        meeting_link: 'https://zoom.us/j/1234567890'
      }
    ],
    inProgress: [
      {
        id: 3,
        title: 'JavaScript ES6+ Features',
        mentor: 'Mike Rodriguez',
        time: 'Now',
        duration: '45 min',
        location: 'Online',
        status: 'in_progress',
        meeting_link: 'https://teams.microsoft.com/l/meetup-join/1234567890'
      }
    ],
    completed: [
      {
        id: 4,
        title: 'Introduction to Node.js',
        mentor: 'Emma Wilson',
        time: 'Oct 15, 2023',
        duration: '60 min',
        location: 'Online',
        status: 'completed',
        meeting_link: 'https://meet.google.com/xyz-abc-def',
        hasFeedback: true
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const openFeedbackModal = (sessionId, userRole, existingFeedback = null) => {
    setFeedbackModal({
      isOpen: true,
      sessionId,
      userRole,
      existingFeedback
    });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      sessionId: null,
      userRole: 'student',
      existingFeedback: null
    });
  };

  const handleFeedbackSubmit = (feedbackData) => {
    // In a real app, this would send data to the backend
    console.log('Feedback submitted:', feedbackData);
    closeFeedbackModal();
  };

  const handleJoinMeeting = (session) => {
    if (session.meeting_link) {
      // Open the meeting link in a new tab
      window.open(session.meeting_link, '_blank');
    } else {
      // If no meeting link, show an alert or handle appropriately
      alert('No meeting link available for this session.');
    }
  };

  const renderSessionCard = (session) => (
    <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              session.status === 'completed'
                ? 'bg-green-500'
                : session.status === 'in_progress'
                ? 'bg-blue-500'
                : 'bg-purple-500'
            }`}>
              {session.mentor.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {session.title}
              </h3>
              <p className="text-gray-600 dark:text-slate-400">with {session.mentor}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {session.time}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {session.duration}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {session.location}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Conference Component */}
        <VideoConference session={session} onJoinMeeting={handleJoinMeeting} />
        
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-4">
          {session.status === 'completed' ? (
            <>
              {session.hasFeedback ? (
                <div className="px-3 py-2 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Feedback Submitted
                </div>
              ) : (
                <button
                  onClick={() => openFeedbackModal(session.id, 'student')}
                  className="btn-primary px-4 py-2 rounded-lg"
                >
                  Give Feedback
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn-secondary px-4 py-2 rounded-lg">Reschedule</button>
              {session.status === 'scheduled' && (
                <button 
                  onClick={() => handleJoinMeeting(session)}
                  className="btn-primary px-4 py-2 rounded-lg flex items-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Session
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">BlockLearn</h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/skills" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Skills
              </Link>
              <Link to="/match" className="text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                Match
              </Link>
              <Link to="/sessions" className="text-primary-600 dark:text-primary-400 font-medium">
                Sessions
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">Learning Sessions</h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage your scheduled learning sessions and track your progress
          </p>
        </div>

        {/* Session Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-slate-700">
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'inProgress'
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('inProgress')}
            >
              In Progress
            </button>
            <button 
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'completed'
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Dynamic Sessions Content */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activeTab === 'upcoming' ? (
            sessions.upcoming.length > 0 ? (
              sessions.upcoming.map(session => renderSessionCard(session))
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No upcoming sessions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Get started by scheduling a new session.</p>
              </div>
            )
          ) : activeTab === 'inProgress' ? (
            sessions.inProgress.length > 0 ? (
              sessions.inProgress.map(session => renderSessionCard(session))
            ) : (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No sessions in progress</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Sessions in progress will appear here.</p>
              </div>
            )
          ) : (
            sessions.completed.length > 0 ? (
              sessions.completed.map(session => renderSessionCard(session))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">No completed sessions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Completed sessions will appear here.</p>
              </div>
            )
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="flex justify-center space-x-4">
            <button 
              className="btn-primary px-6 py-3 rounded-lg"
              onClick={() => navigate('/match')}
            >
              Schedule New Session
            </button>
            <button className="btn-secondary px-6 py-3 rounded-lg">View Calendar</button>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        sessionId={feedbackModal.sessionId}
        userRole={feedbackModal.userRole}
        existingFeedback={feedbackModal.existingFeedback}
      />
    </div>
  );
};

export default Sessions;