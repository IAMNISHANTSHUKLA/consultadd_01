
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRagSystem } from "@/hooks/useRagSystem";
import { RfpUploader } from "@/components/RfpUploader";
import { RfpAnalysis } from "@/components/RfpAnalysis";
import { RfpChatbot } from "@/components/RfpChatbot";
import { CompanyProfile } from "@/components/CompanyProfile";
import { EmptyState } from "@/components/EmptyState";
import { Bot, Upload, FileText, Building } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [showUploader, setShowUploader] = useState<boolean>(false);
  
  // Default company details
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "ConsultAdd Inc.",
    certifications: ["ISO 9001", "CMMI Level 5", "Minority-Owned Business"],
    experience: {
      "Government Contracting": { years: 12 },
      "IT Services": { years: 15 },
      "Healthcare IT": { years: 8 }
    },
    capabilities: [
      "Software Development",
      "Data Analytics",
      "Cloud Migration",
      "Cybersecurity",
      "Project Management"
    ],
    registrations: [
      "Federal Contractor Registration",
      "SAM.gov Registered",
      "State of New York Vendor"
    ]
  });

  // Initialize the RAG system
  const {
    loading,
    error,
    currentRfpId,
    analyzedRfp,
    initialize,
    uploadRfp,
    analyzeRfp,
    askQuestion,
  } = useRagSystem(companyDetails);

  // Initialize system on first load
  useEffect(() => {
    initialize().catch(err => {
      console.error("Failed to initialize RAG system:", err);
      toast({
        title: "System Initialization Failed",
        description: "Could not initialize the document analysis system. Please try refreshing the page.",
        variant: "destructive"
      });
    });
  }, []);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  // Handle upload completion
  const handleUploadComplete = async (rfpId: string) => {
    setActiveTab("analyze");
  };

  // Update company details
  const handleUpdateCompanyDetails = (details: typeof companyDetails) => {
    setCompanyDetails(details);
    toast({
      title: "Profile Updated",
      description: "Your company profile has been updated successfully."
    });
  };

  // Handle RFP analysis - create a wrapper function that matches the expected type
  const handleAnalyzeRfp = async (rfpId: string): Promise<void> => {
    await analyzeRfp(rfpId);
    // The return type is void, which matches what's expected in RfpAnalysis
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50">
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">RFP Analysis System</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Upload RFP
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {showUploader && !currentRfpId ? (
          <div className="mb-8">
            <RfpUploader 
              onUpload={async (file, metadata) => {
                try {
                  const rfpId = await uploadRfp(file, metadata);
                  handleUploadComplete(rfpId);
                  setShowUploader(false);
                  return rfpId;
                } catch (error) {
                  console.error("Upload failed:", error);
                  throw error;
                }
              }}
              isLoading={loading} 
            />
          </div>
        ) : !currentRfpId ? (
          <div className="mb-8">
            <EmptyState 
              onAction={() => setShowUploader(true)}
            />
          </div>
        ) : null}

        {currentRfpId && (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="analyze" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  RFP Analysis
                </TabsTrigger>
                <TabsTrigger value="qa" className="flex items-center gap-1">
                  <Bot className="h-4 w-4" />
                  Ask Questions
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Company Profile
                </TabsTrigger>
              </TabsList>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUploader(true)}
              >
                Upload New RFP
              </Button>
            </div>

            <TabsContent value="analyze" className="mt-0">
              <RfpAnalysis
                rfpId={currentRfpId}
                analysis={analyzedRfp}
                onAnalyze={handleAnalyzeRfp}
                isLoading={loading}
              />
            </TabsContent>

            <TabsContent value="qa" className="mt-0">
              <RfpChatbot
                rfpId={currentRfpId}
                onAskQuestion={askQuestion}
                isLoading={loading}
              />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <CompanyProfile
                companyDetails={companyDetails}
                onUpdateCompanyDetails={handleUpdateCompanyDetails}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="py-6 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>
            RFP Analysis System using ChromaDB vector database for semantic search
          </p>
          <p className="mt-1">
            Powered by RAG (Retrieval Augmented Generation) technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
