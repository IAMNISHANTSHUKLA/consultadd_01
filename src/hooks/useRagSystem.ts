
import { useState, useCallback } from 'react';
import { RfpIngestionService } from '../lib/rfpIngestionService';
import { RfpAnalyzer } from '../lib/rfpAnalyzer';
import vectorStore from '../lib/vectorStore';

interface CompanyDetails {
  companyName: string;
  certifications: string[];
  experience: Record<string, any>;
  capabilities: string[];
  registrations: string[];
}

export function useRagSystem(companyDetails: CompanyDetails) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRfpId, setCurrentRfpId] = useState<string | null>(null);
  const [analyzedRfp, setAnalyzedRfp] = useState<{
    summary: string;
    eligibilityReport: string;
    submissionChecklist: string;
    riskReport: string;
    eligible: boolean;
    missingRequirements: string[];
  } | null>(null);

  // Initialize the vector store
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await vectorStore.initialize();
      setLoading(false);
    } catch (err) {
      setError(`Failed to initialize RAG system: ${err.message}`);
      setLoading(false);
    }
  }, []);

  // Upload and process an RFP document
  const uploadRfp = useCallback(async (
    file: File,
    metadata: {
      title: string;
      agency: string;
      dueDate?: string;
      rfpNumber?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const rfpId = await RfpIngestionService.ingestRfpDocument(file, metadata);
      setCurrentRfpId(rfpId);
      setLoading(false);
      return rfpId;
    } catch (err) {
      setError(`Failed to upload RFP: ${err.message}`);
      setLoading(false);
      throw err;
    }
  }, []);

  // Analyze an RFP document
  const analyzeRfp = useCallback(async (rfpId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const analyzer = new RfpAnalyzer(companyDetails);
      
      // Run all analyses in parallel
      const [
        summary,
        eligibilityResult,
        submissionResult,
        riskResult
      ] = await Promise.all([
        analyzer.generateRfpSummary(rfpId),
        analyzer.analyzeEligibility(rfpId),
        analyzer.extractSubmissionRequirements(rfpId),
        analyzer.analyzeContractRisks(rfpId)
      ]);
      
      const result = {
        summary,
        eligibilityReport: eligibilityResult.eligibilityReport,
        submissionChecklist: submissionResult.submissionChecklist,
        riskReport: riskResult.riskReport,
        eligible: eligibilityResult.eligible,
        missingRequirements: eligibilityResult.missingRequirements
      };
      
      setAnalyzedRfp(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`Failed to analyze RFP: ${err.message}`);
      setLoading(false);
      throw err;
    }
  }, [companyDetails]);

  // Ask a question about the RFP
  const askQuestion = useCallback(async (question: string, rfpId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // If rfpId is provided, scope the question to that RFP
      const queryText = rfpId 
        ? `For the RFP with ID ${rfpId}: ${question}`
        : question;
        
      // Get relevant chunks from the vector store
      const results = await vectorStore.similaritySearch(queryText, 5);
      
      setLoading(false);
      return {
        results,
        // In a real system, you would use an LLM to generate an answer from the chunks
        answer: "To provide a complete answer, I'd need to use the retrieved chunks and generate a response with an LLM."
      };
    } catch (err) {
      setError(`Failed to answer question: ${err.message}`);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    currentRfpId,
    analyzedRfp,
    initialize,
    uploadRfp,
    analyzeRfp,
    askQuestion,
  };
}
