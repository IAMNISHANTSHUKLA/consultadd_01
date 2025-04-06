
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RfpUploaderProps {
  onUpload: (file: File, metadata: { title: string; agency: string; dueDate?: string; rfpNumber?: string }) => Promise<string>;
  isLoading: boolean;
}

export function RfpUploader({ onUpload, isLoading }: RfpUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rfpNumber, setRfpNumber] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if it's a PDF or text file
      if (droppedFile.type === 'application/pdf' || 
          droppedFile.type === 'text/plain' || 
          droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or text file",
          variant: "destructive"
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an RFP document to upload",
        variant: "destructive"
      });
      return;
    }

    if (!title || !agency) {
      toast({
        title: "Missing information",
        description: "Please provide a title and issuing agency",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpload(file, {
        title,
        agency,
        dueDate: dueDate || undefined,
        rfpNumber: rfpNumber || undefined
      });

      toast({
        title: "Upload successful",
        description: "RFP document has been processed and is ready for analysis",
      });

      // Reset form after successful upload
      setFile(null);
      setTitle("");
      setAgency("");
      setDueDate("");
      setRfpNumber("");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while processing the document",
        variant: "destructive"
      });
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload RFP Document</CardTitle>
        <CardDescription>
          Upload an RFP document to analyze eligibility, requirements, and risks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeFile}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop your RFP document here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports PDF and text files
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => document.getElementById('file-upload')?.click()}
                type="button"
              >
                Browse files
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">RFP Title</Label>
            <Input
              id="title"
              placeholder="Enter RFP title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency">Issuing Agency</Label>
            <Input
              id="agency"
              placeholder="Enter agency name"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rfpNumber">RFP Number (Optional)</Label>
            <Input
              id="rfpNumber"
              placeholder="e.g., RFP-2025-001"
              value={rfpNumber}
              onChange={(e) => setRfpNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleUpload}
          disabled={!file || !title || !agency || isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
              Processing...
            </>
          ) : (
            'Upload & Process Document'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
