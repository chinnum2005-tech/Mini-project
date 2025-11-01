import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, Star, BookOpen, Video, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/lib/axios";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      
      // Fetch dashboard data
      const response = await axiosInstance.get("/api/sessions/dashboard");
      const data = response.data.data;
      
      // Filter for mentor sessions
      const mentorSessions = data.upcoming_sessions.filter(
        session => session.user_role_in_session === 'mentor'
      );
      
      setUpcomingSessions(mentorSessions);
      setPendingQuestions(data.pending_questions);
      
      // Calculate stats
      setStats({
        totalSessions: mentorSessions.length,
        completedSessions: mentorSessions.filter(s => s.status === 'completed').length,
        averageRating: 4.8, // This would come from API in a real implementation
        totalStudents: new Set(mentorSessions.map(s => s.student_id)).size
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      // setLoading(false); // Removed unused variable
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mentor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user?.firstName}! Ready to help students learn today?
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mt-1">
                Verified Mentor
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students Helped</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="questions">Pending Questions</TabsTrigger>
            <TabsTrigger value="skills">My Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don't have any scheduled sessions yet. Students will book sessions with you soon!
                  </p>
                  <Button onClick={() => navigate('/sessions')}>
                    View All Sessions
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{session.skill_name}</CardTitle>
                          <CardDescription>
                            with {session.student_first_name} {session.student_last_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(session.scheduled_at)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(session.scheduled_at)} ({session.duration_minutes} min)
                        </div>
                        {session.meeting_link && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Video className="h-4 w-4 mr-2" />
                            <a 
                              href={session.meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button size="sm">
                          Session Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {pendingQuestions.length === 0 ? (
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Questions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are no pending questions from students at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingQuestions.map((question) => (
                  <Card key={question.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{question.skill_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Asked by {question.student_first_name} {question.student_last_name}
                          </p>
                          <p className="mt-2 text-gray-900 dark:text-white">{question.question}</p>
                        </div>
                        <Badge variant="secondary" className="self-start">
                          {question.priority === 1 ? 'High' : question.priority === 0 ? 'Normal' : 'Low'}
                        </Badge>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          Request Details
                        </Button>
                        <Button size="sm">
                          Answer Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
              <CardHeader>
                <CardTitle>My Teaching Skills</CardTitle>
                <CardDescription>
                  Skills you're offering to teach to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">JavaScript</Badge>
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">Data Science</Badge>
                  <Badge variant="secondary">Machine Learning</Badge>
                </div>
                <Button className="mt-4" onClick={() => navigate('/skills')}>
                  Manage Skills
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentorDashboard;