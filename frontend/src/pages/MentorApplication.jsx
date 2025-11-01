import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/lib/axios";

const MentorApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Application, 2: Documents, 3: Submitted
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Application form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    qualification: "",
    institution: "",
    yearsOfExperience: "",
    specialization: "",
    teachingExperience: "",
    motivation: ""
  });

  // Document upload state
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const response = await axiosInstance.get("/api/mentor-verification/application-status");
      if (response.data.data) {
        setApplicationStatus(response.data.data);
        if (response.data.data.status !== 'pending') {
          setStep(3); // Show status if already applied
        }
      }
    } catch (err) {
      console.error("Error fetching application status:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post("/api/mentor-verification/apply", formData);
      setSuccess(response.data.message);
      setApplicationStatus(response.data.data);
      setStep(2); // Move to document upload step
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocuments = async (e) => {
    e.preventDefault();
    if (documents.length === 0) {
      setError("Please select at least one document");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });

      const response = await axiosInstance.post(
        `/api/mentor-verification/documents/${applicationStatus.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSuccess(response.data.message);
      setStep(3); // Move to submitted step
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!applicationStatus) return "Loading...";
    
    switch (applicationStatus.status) {
      case 'pending':
        return "Your application has been submitted and is pending review.";
      case 'documents_submitted':
        return "Your documents have been uploaded and are pending verification.";
      case 'under_review':
        return "Your application is under review by our team.";
      case 'interview_scheduled':
        return "An interview has been scheduled. Our team will contact you with details.";
      case 'approved':
        return "Congratulations! Your mentor application has been approved.";
      case 'rejected':
        return "Your mentor application has been rejected. Please contact support for more information.";
      default:
        return "Your application is being processed.";
    }
  };

  const getStatusColor = () => {
    if (!applicationStatus) return "bg-blue-100 text-blue-800";
    
    switch (applicationStatus.status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (step === 3 && applicationStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
            <CardHeader>
              <CardTitle className="text-2xl">Mentor Application Status</CardTitle>
              <CardDescription>
                Track the progress of your mentor application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert className={getStatusColor()}>
                  <AlertDescription className="font-medium">
                    Status: {applicationStatus.status?.replace('_', ' ').toUpperCase()}
                  </AlertDescription>
                  <AlertDescription className="mt-2">
                    {getStatusMessage()}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{applicationStatus.firstName} {applicationStatus.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{applicationStatus.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Qualification</Label>
                    <p className="text-sm">{applicationStatus.qualification}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Institution</Label>
                    <p className="text-sm">{applicationStatus.institution}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted On</Label>
                    <p className="text-sm">
                      {new Date(applicationStatus.application_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Documents Uploaded</Label>
                    <p className="text-sm">{applicationStatus.document_count || 0} documents</p>
                  </div>
                </div>

                {applicationStatus.status === 'approved' && (
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <AlertDescription>
                      <p className="font-medium">🎉 Congratulations!</p>
                      <p className="mt-1">
                        Your mentor application has been approved. You can now access mentor features.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/mentor-dashboard')}
                      >
                        Go to Mentor Dashboard
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {applicationStatus.status === 'rejected' && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertDescription>
                      <p className="font-medium">❌ Application Rejected</p>
                      <p className="mt-1">
                        Unfortunately, your application was not approved. Please contact support for more information.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setStep(1)}
                      >
                        Re-apply
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              <Button onClick={fetchApplicationStatus}>
                Refresh Status
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/20">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 ? "Mentor Application" : "Upload Documents"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Please provide your details to apply as a mentor" 
                : "Upload required documents to complete your application"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      placeholder="e.g., PhD in Computer Science"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      name="institution"
                      placeholder="e.g., Stanford University"
                      value={formData.institution}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Areas of Specialization</Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      placeholder="e.g., Machine Learning, Data Science"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="teachingExperience">Teaching Experience</Label>
                  <Textarea
                    id="teachingExperience"
                    name="teachingExperience"
                    placeholder="Describe your teaching experience..."
                    value={formData.teachingExperience}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Why do you want to be a mentor? *</Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    placeholder="Tell us about your motivation to mentor students..."
                    value={formData.motivation}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/role-selection')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUploadDocuments} className="space-y-6">
                <div>
                  <Label>Upload Required Documents</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Please upload clear scans of your degree certificate, ID proof, and any relevant experience letters.
                    Supported formats: PDF, JPG, PNG (Max 5MB each)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentChange}
                    className="mt-2"
                    disabled={loading}
                  />
                  {documents.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {documents.length} file(s) selected
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading || documents.length === 0}>
                    {loading ? "Uploading..." : "Upload Documents"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorApplication;