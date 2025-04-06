import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RfpUploaderProps {
  isLoading: boolean;
}

export function RfpUploader({ isLoading }: RfpUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rfpNumber, setRfpNumber] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const isValidFile = (file: File) =>
    file.type === "application/pdf" ||
    file.name.endsWith(".docx");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) {
      setFile(selected);
    } else {
      toast({
        title: "Invalid file type",
        description: "Only PDF or DOCX files are supported",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && isValidFile(dropped)) {
      setFile(dropped);
    } else {
      toast({
        title: "Invalid file type",
        description: "Only PDF or DOCX files are supported",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload",
        variant: "destructive"
      });
      return;
    }

    if (!title || !agency) {
      toast({
        title: "Missing fields",
        description: "RFP title and agency are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("agency", agency);
      if (dueDate) formData.append("dueDate", dueDate);
      if (rfpNumber) formData.append("rfpNumber", rfpNumber);

      const response = await fetch("/api/upload-rfp", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to upload");
      }

      toast({
        title: "Upload successful",
        description: "RFP processed and sent to ChromaDB",
      });

      // Reset
      setFile(null);
      setTitle("");
      setAgency("");
      setDueDate("");
      setRfpNumber("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const removeFile = () => setFile(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload RFP Document</CardTitle>
        <CardDescription>
          Upload a PDF or DOCX document for vector processing and eligibility analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : file
              ? "border-green-500 bg-green-50"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
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
                <Button variant="ghost" size="sm" onClick={removeFile} type="button">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop your RFP (PDF or DOCX)
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="secondary" size="sm" onClick={() => document.getElementById('file-upload')?.click()} type="button">
                Browse files
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">RFP Title</Label>
            <Input id="title" placeholder="Enter RFP title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agency">Issuing Agency</Label>
            <Input id="agency" placeholder="Enter agency name" value={agency} onChange={(e) => setAgency(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rfpNumber">RFP Number (Optional)</Label>
            <Input id="rfpNumber" placeholder="e.g., RFP-2025-001" value={rfpNumber} onChange={(e) => setRfpNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleUpload} disabled={!file || !title || !agency || isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
              Processing...
            </>
          ) : (
            "Upload & Process Document"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
