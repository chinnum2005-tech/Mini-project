import React, { useState, useEffect } from 'react';
import { Video, Phone, Mic, MicOff, VideoOff, Users, Link as LinkIcon, Copy, Check } from 'lucide-react';

const VideoConference = ({ session, onJoinMeeting }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMeetingPlatform = (link) => {
    if (!link) return 'custom';
    
    if (link.includes('meet.google.com')) return 'google';
    if (link.includes('zoom.us')) return 'zoom';
    if (link.includes('skype.com') || link.includes('join.skype.com')) return 'skype';
    if (link.includes('teams.microsoft.com')) return 'teams';
    return 'custom';
  };

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'google': return 'Google Meet';
      case 'zoom': return 'Zoom';
      case 'skype': return 'Skype';
      case 'teams': return 'Microsoft Teams';
      default: return 'Video Conference';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'google': return '🟦';
      case 'zoom': return '🟢';
      case 'skype': return '🔵';
      case 'teams': return '🟣';
      default: return '🔴';
    }
  };

  const platform = getMeetingPlatform(session?.meeting_link);
  const platformName = getPlatformName(platform);
  const platformIcon = getPlatformIcon(platform);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{platformIcon}</span>
            <h3 className="text-lg font-semibold text-white">{platformName}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
              {session?.status === 'in_progress' ? 'Live' : 'Scheduled'}
            </span>
          </div>
        </div>
        
        {session?.meeting_link && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-sm truncate">
                {session.meeting_link}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(session.meeting_link)}
              className="ml-2 flex-shrink-0 p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Copy meeting link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Meeting Details */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-slate-100">{session?.title}</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              with {session?.mentor}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
              {new Date(session?.scheduled_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {new Date(session?.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-600 dark:text-slate-400">
              <Users className="w-4 h-4 mr-1" />
              {session?.duration_minutes} min
            </span>
          </div>
          <span className="text-gray-600 dark:text-slate-400">
            {session?.location || 'Online'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex space-x-3">
          {session?.status === 'scheduled' && (
            <button
              onClick={() => onJoinMeeting(session)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Video className="w-5 h-5 mr-2" />
              Join Meeting
            </button>
          )}
          
          {session?.status === 'in_progress' && (
            <>
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-3 rounded-lg transition-colors ${
                  isAudioMuted 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className={`p-3 rounded-lg transition-colors ${
                  isVideoMuted 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => onJoinMeeting(session)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Rejoin Meeting
              </button>
            </>
          )}
          
          {session?.status === 'completed' && (
            <div className="w-full text-center py-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
              Session Completed
            </div>
          )}
        </div>
        
        {session?.meeting_link && (
          <div className="mt-3">
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Open in {platformName}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConference;