
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RfpUploaderProps {
  onRfpUploaded: (rfpId: string) => void;
}

export const RfpUploaderEnhanced: React.FC<RfpUploaderProps> = ({ onRfpUploaded }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rfpNumber, setRfpNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !agency) {
      toast({
        title: "Missing information",
        description: "Please provide a file, title, and agency.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      simulateUploadProgress();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("agency", agency);
      if (dueDate) formData.append("dueDate", dueDate);
      if (rfpNumber) formData.append("rfpNumber", rfpNumber);

      // Simulating upload for demonstration
      setTimeout(async () => {
        try {
          // Mock successful upload
          const mockRfpId = "rfp-" + Math.random().toString(36).substring(2, 11);
          
          toast({
            title: "RFP Uploaded",
            description: "Your RFP has been successfully uploaded.",
          });
          
          setFile(null);
          setTitle("");
          setAgency("");
          setDueDate("");
          setRfpNumber("");
          setUploadProgress(0);
          onRfpUploaded(mockRfpId);
        } catch (error) {
          console.error("Error uploading RFP:", error);
          toast({
            title: "Upload Failed",
            description: "Failed to upload RFP. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Error uploading RFP:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload RFP. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Upload RFP Document</CardTitle>
        <CardDescription>
          Upload an RFP document to analyze eligibility, requirements, and risks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
              file ? "bg-primary/5 border-primary/50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-primary mb-2" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="font-medium">Drag and drop your RFP file</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (.pdf, .doc, .docx, .txt)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">RFP Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter RFP title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agency">Agency <span className="text-red-500">*</span></Label>
                <Input
                  id="agency"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="Enter issuing agency"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rfpNumber">RFP Number</Label>
                <Input
                  id="rfpNumber"
                  value={rfpNumber}
                  onChange={(e) => setRfpNumber(e.target.value)}
                  placeholder="Enter RFP number"
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setFile(null);
          setTitle("");
          setAgency("");
          setDueDate("");
          setRfpNumber("");
        }}>
          Reset
        </Button>
        <Button 
          disabled={!file || !title || !agency || isUploading} 
          onClick={handleSubmit}
          className="relative"
        >
          {isUploading ? (
            <>
              <span>Uploading</span>
              <span className="ml-2">{uploadProgress}%</span>
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Upload RFP
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
