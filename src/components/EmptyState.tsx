
import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No RFP Uploaded Yet",
  description = "Upload an RFP document to analyze eligibility, extract requirements, and identify potential risks.",
  actionText = "Upload an RFP",
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <FileQuestion className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
