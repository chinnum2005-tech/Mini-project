import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, Star, BookOpen, Video, MessageCircle, Eye, CheckCircle, XCircle } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

const AdminMentorApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    scheduledAt: "",
    notes: ""
  });
  const [completionData, setCompletionData] = useState({
    feedback: "",
    rating: 3,
    approve: true
  });

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/mentor-verification/pending-applications");
      setApplications(response.data.data);
    } catch (error) {
      console.error("Error fetching pending applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewApplicationDetails = async (applicationId) => {
    try {
      const response = await axiosInstance.get(`/api/mentor-verification/application/${applicationId}`);
      setSelectedApplication(response.data.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching application details:", error);
    }
  };

  const handleVerifyDocument = async (documentId, verified) => {
    try {
      await axiosInstance.post(`/api/mentor-verification/verify-document/${documentId}`, { verified });
      // Refresh application details
      if (selectedApplication) {
        viewApplicationDetails(selectedApplication.application.id);
      }
      // Refresh pending applications list
      fetchPendingApplications();
    } catch (error) {
      console.error("Error verifying document:", error);
    }
  };

  const handleScheduleInterview = async (applicationId) => {
    try {
      await axiosInstance.post(`/api/mentor-verification/schedule-interview/${applicationId}`, interviewData);
      setIsScheduleModalOpen(false);
      setInterviewData({ scheduledAt: "", notes: "" });
      // Refresh pending applications list
      fetchPendingApplications();
    } catch (error) {
      console.error("Error scheduling interview:", error);
    }
  };

  const handleCompleteInterview = async (interviewId) => {
    try {
      await axiosInstance.post(`/api/mentor-verification/complete-interview/${interviewId}`, completionData);
      setIsCompleteModalOpen(false);
      setCompletionData({ feedback: "", rating: 3, approve: true });
      // Refresh pending applications list
      fetchPendingApplications();
    } catch (error) {
      console.error("Error completing interview:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'documents_submitted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Documents Submitted</Badge>;
      case 'under_review':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Under Review</Badge>;
      case 'interview_scheduled':
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Interview Scheduled</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mentor Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Review and manage pending mentor applications
            </p>
          </div>
          <Button onClick={fetchPendingApplications} className="mt-4 md:mt-0">
            Refresh
          </Button>
        </div>

        {/* Applications Table */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>
              {applications.length} application(s) awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Applications</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are no pending mentor applications at the moment.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.first_name} {application.last_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{application.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.qualification}</TableCell>
                      <TableCell>{application.institution}</TableCell>
                      <TableCell>{application.years_of_experience || 0} years</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>{application.document_count || 0} documents</TableCell>
                      <TableCell>{formatDate(application.application_date)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewApplicationDetails(application.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Application Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mentor Application Details</DialogTitle>
              <DialogDescription>
                Review application and manage verification process
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Applicant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="mt-1">{selectedApplication.application.first_name} {selectedApplication.application.last_name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="mt-1">{selectedApplication.application.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="mt-1">{selectedApplication.application.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="mt-1">{getStatusBadge(selectedApplication.application.status)}</p>
                    </div>
                    <div>
                      <Label>Qualification</Label>
                      <p className="mt-1">{selectedApplication.application.qualification}</p>
                    </div>
                    <div>
                      <Label>Institution</Label>
                      <p className="mt-1">{selectedApplication.application.institution}</p>
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <p className="mt-1">{selectedApplication.application.years_of_experience || 0} years</p>
                    </div>
                    <div>
                      <Label>Specialization</Label>
                      <p className="mt-1">{selectedApplication.application.specialization || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Teaching Experience</Label>
                      <p className="mt-1">{selectedApplication.application.teaching_experience || "Not provided"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Motivation</Label>
                      <p className="mt-1">{selectedApplication.application.motivation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>
                      {selectedApplication.documents.length} document(s) uploaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedApplication.documents.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No documents uploaded yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedApplication.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">{doc.document_name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Uploaded on {formatDate(doc.uploaded_at)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {doc.verified ? (
                                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                              {!doc.verified && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleVerifyDocument(doc.id, true)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleVerifyDocument(doc.id, false)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Interview */}
                {selectedApplication.interview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Scheduled At</Label>
                          <p className="mt-1">{formatDate(selectedApplication.interview.scheduled_at)}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <p className="mt-1">{selectedApplication.interview.status}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label>Notes</Label>
                          <p className="mt-1">{selectedApplication.interview.interview_notes || "No notes provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  {selectedApplication.application.status === 'documents_submitted' && (
                    <Button onClick={() => setIsScheduleModalOpen(true)}>
                      Schedule Interview
                    </Button>
                  )}
                  {selectedApplication.application.status === 'interview_scheduled' && selectedApplication.interview && (
                    <Button onClick={() => setIsCompleteModalOpen(true)}>
                      Complete Interview
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Interview Modal */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                Set a date and time for the mentor interview
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduledAt">Interview Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={interviewData.scheduledAt}
                  onChange={(e) => setInterviewData({...interviewData, scheduledAt: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData({...interviewData, notes: e.target.value})}
                  placeholder="Add any notes for the interview..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleInterview}>
                Schedule Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Interview Modal */}
        <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Interview</DialogTitle>
              <DialogDescription>
                Provide feedback and make a decision on the mentor application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={completionData.feedback}
                  onChange={(e) => setCompletionData({...completionData, feedback: e.target.value})}
                  placeholder="Provide feedback on the interview..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={completionData.rating}
                  onChange={(e) => setCompletionData({...completionData, rating: parseInt(e.target.value) || 3})}
                />
              </div>
              <div className="flex items-center space-x-4">
                <Label>Decision</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant={completionData.approve ? "default" : "outline"}
                    onClick={() => setCompletionData({...completionData, approve: true})}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant={!completionData.approve ? "destructive" : "outline"}
                    onClick={() => setCompletionData({...completionData, approve: false})}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteInterview}>
                Complete Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminMentorApplications;