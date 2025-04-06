
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bot, FileText, Upload } from "lucide-react";
import { RfpAnalysis } from "@/components/RfpAnalysis";
import { RfpChatbot } from "@/components/RfpChatbot";
import { RfpUploader } from "@/components/RfpUploader";
import { useRagSystem } from "@/hooks/useRagSystem";
import { CompanyProfile } from "@/components/CompanyProfile";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [currentRfpId, setCurrentRfpId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzedRfp, setAnalyzedRfp] = useState<{
    summary: string;
    eligibilityReport: string;
    submissionChecklist: string;
    riskReport: string;
    eligible: boolean;
    missingRequirements: string[];
  } | null>(null);

  const companyProfile = {
    name: "ConsultAdd",
    description: "Provider of professional services to U.S. government agencies",
    certifications: [
      "ISO 9001:2015",
      "CMMI Level 3",
      "GSA Schedule Contract Holder",
    ],
    pastPerformance: [
      {
        agency: "Department of Defense",
        projectName: "IT Systems Modernization",
        year: 2023,
        value: "$5.2M",
      },
      {
        agency: "Department of Health",
        projectName: "Data Analytics Platform",
        year: 2022,
        value: "$3.8M",
      },
      {
        agency: "Department of Energy",
        projectName: "Cybersecurity Enhancement",
        year: 2021,
        value: "$4.5M",
      },
    ],
    stateRegistrations: ["Texas", "California", "Virginia", "Maryland", "DC"],
    capabilities: [
      "Software Development",
      "Cloud Migration",
      "Data Analytics",
      "Cybersecurity",
      "IT Consulting",
    ],
  };

  const analyzeRfp = async (rfpId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyze-rfp?rfpId=${rfpId}`, {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze RFP");
      }
      
      const data = await response.json();
      setAnalyzedRfp(data);
      return data;
    } catch (error) {
      console.error("Error analyzing RFP:", error);
      toast({
        title: "Error",
        description: "Failed to analyze RFP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRfpUploaded = (rfpId: string) => {
    setCurrentRfpId(rfpId);
    setActiveTab("analyze");
    toast({
      title: "Success",
      description: "RFP uploaded successfully. Ready for analysis.",
    });
  };

  // Handle RFP analysis - create a wrapper function that matches the expected type
  const handleAnalyzeRfp = async (rfpId: string): Promise<void> => {
    await analyzeRfp(rfpId);
    // The return type is void, which matches what's expected in RfpAnalysis
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero section with gradient background */}
      <div className="relative w-full bg-white">
        {/* Background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">RFP AI Analysis</span>
              <span className="block text-indigo-600">Smart Insights for Government Contracts</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Automate RFP analysis with AI-powered insights. Save time, reduce risk, and increase win rates.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-grow px-4 py-8 container mx-auto max-w-7xl">
        <Tabs 
          defaultValue="upload" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-14">
              <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bot className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <TabsContent value="upload" className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <RfpUploader onRfpUploaded={handleRfpUploaded} />
                    </div>
                    <div>
                      <CompanyProfile profile={companyProfile} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analyze" className="mt-0">
                  <RfpAnalysis
                    rfpId={currentRfpId}
                    analysis={analyzedRfp}
                    onAnalyze={handleAnalyzeRfp}
                    isLoading={loading}
                  />
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <RfpChatbot rfpId={currentRfpId} />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </main>
      
      <footer className="bg-white shadow-inner py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ConsultAdd RFP AI Analysis Tool
            </p>
            <div className="flex space-x-4">
              <Button variant="link" size="sm" className="text-gray-500">
                Terms
              </Button>
              <Button variant="link" size="sm" className="text-gray-500">
                Privacy
              </Button>
              <Button variant="link" size="sm" className="text-gray-500">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
