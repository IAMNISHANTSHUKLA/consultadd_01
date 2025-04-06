
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, FileText, Download } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface RfpAnalysisProps {
  rfpId: string | null;
  analysis: {
    summary: string;
    eligibilityReport: string;
    submissionChecklist: string;
    riskReport: string;
    eligible: boolean;
    missingRequirements: string[];
  } | null;
  onAnalyze: (rfpId: string) => Promise<void>;
  isLoading: boolean;
}

export function RfpAnalysis({ rfpId, analysis, onAnalyze, isLoading }: RfpAnalysisProps) {
  const [activeTab, setActiveTab] = useState("summary");

  const handleAnalyze = () => {
    if (rfpId) {
      onAnalyze(rfpId);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>RFP Analysis</CardTitle>
            <CardDescription>
              Automated analysis of RFP eligibility, requirements, and risks
            </CardDescription>
          </div>
          {rfpId && !analysis && (
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze RFP'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!rfpId && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No RFP Selected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Please upload an RFP document to analyze eligibility, requirements, and potential risks.
            </p>
          </div>
        )}

        {rfpId && isLoading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Analyzing RFP document...</p>
          </div>
        )}

        {rfpId && analysis && (
          <>
            <div className="flex items-center gap-2 p-4 rounded-lg mb-4 bg-slate-50">
              <div className="p-2 rounded-full bg-slate-100">
                {analysis.eligible ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium">
                  {analysis.eligible 
                    ? "Eligible to Bid" 
                    : "Not Eligible to Bid"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.eligible 
                    ? "Your company meets all eligibility requirements for this RFP." 
                    : `${analysis.missingRequirements.length} eligibility issues found.`}
                </p>
              </div>
            </div>

            <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
              </TabsList>
              
              <div className="relative border rounded-md p-4 overflow-auto max-h-[500px]">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 z-10"
                  onClick={() => {
                    const content = activeTab === "summary" ? analysis.summary :
                                   activeTab === "eligibility" ? analysis.eligibilityReport :
                                   activeTab === "checklist" ? analysis.submissionChecklist :
                                   analysis.riskReport;
                    
                    const filename = `rfp-${activeTab}-report.md`;
                    handleDownload(content, filename);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                
                <TabsContent value="summary" className="mt-0 prose prose-sm max-w-none">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </TabsContent>
                
                <TabsContent value="eligibility" className="mt-0 prose prose-sm max-w-none">
                  <ReactMarkdown>{analysis.eligibilityReport}</ReactMarkdown>
                </TabsContent>
                
                <TabsContent value="checklist" className="mt-0 prose prose-sm max-w-none">
                  <ReactMarkdown>{analysis.submissionChecklist}</ReactMarkdown>
                </TabsContent>
                
                <TabsContent value="risks" className="mt-0 prose prose-sm max-w-none">
                  <ReactMarkdown>{analysis.riskReport}</ReactMarkdown>
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </CardContent>
      {rfpId && analysis && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            <p className="text-xs text-muted-foreground">
              This analysis is AI-generated and should be reviewed by legal experts.
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={() => handleDownload(
              [analysis.summary, analysis.eligibilityReport, analysis.submissionChecklist, analysis.riskReport].join('\n\n---\n\n'),
              'rfp-complete-analysis.md'
            )}
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export All
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
