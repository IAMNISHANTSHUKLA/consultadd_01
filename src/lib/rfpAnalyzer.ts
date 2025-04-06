
import vectorStore from './vectorStore';

interface CompanyDetails {
  companyName: string;
  certifications: string[];
  experience: Record<string, any>;
  capabilities: string[];
  registrations: string[];
}

export class RfpAnalyzer {
  private companyDetails: CompanyDetails;

  constructor(companyDetails: CompanyDetails) {
    this.companyDetails = companyDetails;
  }

  /**
   * Analyze eligibility based on RFP requirements and company details
   */
  public async analyzeEligibility(rfpId: string): Promise<{
    eligible: boolean;
    missingRequirements: string[];
    eligibilityReport: string;
  }> {
    // Get compliance requirements from the vector store
    const requirementResults = await vectorStore.similaritySearch(
      "What are the mandatory eligibility requirements, certifications, and qualifications needed to bid on this RFP?",
      10
    );

    // Extract and analyze requirements
    const missingRequirements: string[] = [];
    let eligible = true;
    let analysisText = "";

    // Process each requirement chunk
    if (requirementResults.length > 0) {
      for (const result of requirementResults) {
        // This is a simplified analysis - in a real system, you would use more sophisticated NLP
        const requirements = this.extractRequirements(result.content);
        
        for (const req of requirements) {
          if (!this.checkRequirementMet(req)) {
            missingRequirements.push(req);
            eligible = false;
          }
        }
        
        analysisText += result.content + "\n\n";
      }
    } else {
      analysisText = "No specific eligibility requirements found in the RFP.";
    }

    // Generate eligibility report
    const eligibilityReport = this.generateEligibilityReport(eligible, missingRequirements, analysisText);

    return {
      eligible,
      missingRequirements,
      eligibilityReport
    };
  }

  /**
   * Extract submission requirements from RFP
   */
  public async extractSubmissionRequirements(rfpId: string): Promise<{
    formatRequirements: string[];
    documentRequirements: string[];
    deadlines: string[];
    submissionChecklist: string;
  }> {
    // Query the vector store for submission requirements
    const submissionResults = await vectorStore.similaritySearch(
      "What are the submission requirements, document format, page limits, and deadlines for this RFP?",
      10
    );

    // Parse the results
    const formatRequirements: string[] = [];
    const documentRequirements: string[] = [];
    const deadlines: string[] = [];
    let submissionText = "";

    // Extract submission requirements from the retrieved chunks
    if (submissionResults.length > 0) {
      for (const result of submissionResults) {
        // Simple extraction logic - would be more sophisticated in a real system
        const formatReqs = this.extractFormatRequirements(result.content);
        const docReqs = this.extractDocumentRequirements(result.content);
        const dateReqs = this.extractDeadlines(result.content);
        
        formatRequirements.push(...formatReqs);
        documentRequirements.push(...docReqs);
        deadlines.push(...dateReqs);
        
        submissionText += result.content + "\n\n";
      }
    }

    // Generate a consolidated checklist
    const submissionChecklist = this.generateSubmissionChecklist(
      formatRequirements, 
      documentRequirements, 
      deadlines
    );

    return {
      formatRequirements: [...new Set(formatRequirements)], // Remove duplicates
      documentRequirements: [...new Set(documentRequirements)],
      deadlines: [...new Set(deadlines)],
      submissionChecklist
    };
  }

  /**
   * Analyze contract risks from RFP
   */
  public async analyzeContractRisks(rfpId: string): Promise<{
    riskyClauses: string[];
    suggestedModifications: Record<string, string>;
    riskReport: string;
  }> {
    // Query for contract terms and conditions
    const contractResults = await vectorStore.similaritySearch(
      "What are the contract terms, conditions, and clauses that might put vendors at a disadvantage?",
      10
    );

    const riskyClauses: string[] = [];
    const suggestedModifications: Record<string, string> = {};
    let riskText = "";

    // Analyze contract terms from retrieved chunks
    if (contractResults.length > 0) {
      for (const result of contractResults) {
        // Extract and analyze risky clauses
        const clauses = this.extractRiskyClauses(result.content);
        
        for (const clause of clauses) {
          riskyClauses.push(clause);
          suggestedModifications[clause] = this.suggestModification(clause);
        }
        
        riskText += result.content + "\n\n";
      }
    }

    // Generate a comprehensive risk report
    const riskReport = this.generateRiskReport(riskyClauses, suggestedModifications, riskText);

    return {
      riskyClauses,
      suggestedModifications,
      riskReport
    };
  }

  /**
   * Generate a comprehensive summary of the RFP analysis
   */
  public async generateRfpSummary(rfpId: string): Promise<string> {
    // General RFP overview
    const overviewResults = await vectorStore.similaritySearch(
      "What is the overall scope, purpose, and key requirements of this RFP?",
      5
    );
    
    let summary = "# RFP Analysis Summary\n\n";
    
    // Add overview section
    summary += "## Overview\n\n";
    if (overviewResults.length > 0) {
      const overviewText = overviewResults.map(r => r.content).join("\n\n");
      summary += this.summarizeText(overviewText, 500) + "\n\n";
    } else {
      summary += "No overview information found.\n\n";
    }
    
    // Add eligibility analysis
    const { eligible, missingRequirements, eligibilityReport } = await this.analyzeEligibility(rfpId);
    summary += "## Eligibility Assessment\n\n";
    summary += `**Overall Eligibility:** ${eligible ? "Eligible to bid" : "Not eligible to bid"}\n\n`;
    
    if (missingRequirements.length > 0) {
      summary += "**Missing Requirements:**\n\n";
      missingRequirements.forEach(req => {
        summary += `- ${req}\n`;
      });
      summary += "\n";
    } else if (!eligible) {
      summary += "**Missing Requirements:** Specific requirements could not be determined.\n\n";
    } else {
      summary += "**All requirements met.**\n\n";
    }
    
    // Add submission requirements
    const { submissionChecklist } = await this.extractSubmissionRequirements(rfpId);
    summary += "## Submission Requirements\n\n";
    summary += submissionChecklist + "\n\n";
    
    // Add risk analysis
    const { riskReport } = await this.analyzeContractRisks(rfpId);
    summary += "## Contract Risk Analysis\n\n";
    summary += this.summarizeText(riskReport, 500) + "\n\n";
    
    // Add recommendation
    summary += "## Recommendation\n\n";
    if (eligible) {
      summary += "Based on the analysis, it is recommended to **proceed with bidding** on this RFP. Company meets all the eligibility criteria.\n\n";
    } else {
      summary += "Based on the analysis, it is recommended to **NOT proceed with bidding** on this RFP due to missing requirements.\n\n";
    }
    
    return summary;
  }

  // Helper methods
  private extractRequirements(text: string): string[] {
    // This is a simplified implementation - in a real system, you would use NLP
    const requirements: string[] = [];
    
    // Look for common requirement patterns
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for bullet points, numbering, or requirement-like language
      if (
        trimmedLine.match(/^[\•\-\*]/) || // Bullet points
        trimmedLine.match(/^\d+[\.\)]/) || // Numbered lists
        trimmedLine.match(/must have|required|shall have|minimum|at least/i) // Requirement language
      ) {
        if (trimmedLine.length > 10) { // Avoid too short lines
          requirements.push(trimmedLine);
        }
      }
    }
    
    return requirements;
  }

  private checkRequirementMet(requirement: string): boolean {
    const { certifications, experience, capabilities, registrations } = this.companyDetails;
    
    // Check if requirement mentions certifications
    if (requirement.toLowerCase().includes('certification') || requirement.toLowerCase().includes('certified')) {
      return certifications.some(cert => 
        requirement.toLowerCase().includes(cert.toLowerCase())
      );
    }
    
    // Check if requirement mentions years of experience
    const experienceMatch = requirement.match(/(\d+)\s+years?\s+experience/i);
    if (experienceMatch) {
      const yearsRequired = parseInt(experienceMatch[1]);
      // Simplified check - in a real system you would have more structured data
      const hasEnoughExperience = Object.values(experience).some(
        (exp: any) => exp && exp.years >= yearsRequired
      );
      return hasEnoughExperience;
    }
    
    // Check capabilities
    return capabilities.some(capability => 
      requirement.toLowerCase().includes(capability.toLowerCase())
    );
  }

  private generateEligibilityReport(eligible: boolean, missingRequirements: string[], analysisText: string): string {
    let report = "# Eligibility Analysis Report\n\n";
    
    report += `## Overall Assessment: ${eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}\n\n`;
    
    report += "## Company Qualifications\n\n";
    report += `Company Name: ${this.companyDetails.companyName}\n\n`;
    
    report += "### Certifications\n";
    if (this.companyDetails.certifications.length > 0) {
      this.companyDetails.certifications.forEach(cert => {
        report += `- ${cert}\n`;
      });
    } else {
      report += "- No certifications provided\n";
    }
    
    report += "\n### Experience\n";
    Object.entries(this.companyDetails.experience).forEach(([area, details]) => {
      report += `- ${area}: ${(details as any).years} years\n`;
    });
    
    report += "\n## RFP Requirements Analysis\n\n";
    
    if (missingRequirements.length > 0) {
      report += "### Missing Requirements\n\n";
      missingRequirements.forEach(req => {
        report += `- ${req}\n`;
      });
    } else {
      report += "All requirements appear to be met based on available information.\n";
    }
    
    report += "\n## Raw Analysis\n\n";
    report += analysisText;
    
    return report;
  }

  private extractFormatRequirements(text: string): string[] {
    const formats: string[] = [];
    
    // Look for format specifications
    if (text.match(/page limit|font size|margin|spacing|format|template/i)) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.match(/page|font|margin|spacing|format|template|size|header|footer/i)) {
          formats.push(line.trim());
        }
      }
    }
    
    return formats;
  }

  private extractDocumentRequirements(text: string): string[] {
    const documents: string[] = [];
    
    // Look for required documents
    if (text.match(/submit|include|attach|provide|form|document|certificate/i)) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.match(/submit|include|attach|provide|form|document|certificate/i)) {
          documents.push(line.trim());
        }
      }
    }
    
    return documents;
  }

  private extractDeadlines(text: string): string[] {
    const deadlines: string[] = [];
    
    // Look for dates and deadlines
    if (text.match(/due|deadline|by|before|date|schedule/i)) {
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.match(/due|deadline|by|before|date|schedule/i) && 
            (line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || line.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i))) {
          deadlines.push(line.trim());
        }
      }
    }
    
    return deadlines;
  }

  private generateSubmissionChecklist(formatReqs: string[], docReqs: string[], deadlines: string[]): string {
    let checklist = "# RFP Submission Checklist\n\n";
    
    // Add deadlines section
    checklist += "## Important Deadlines\n\n";
    if (deadlines.length > 0) {
      deadlines.forEach(deadline => {
        checklist += `- [ ] ${deadline}\n`;
      });
    } else {
      checklist += "- [ ] No specific deadlines found - verify due date in the RFP\n";
    }
    
    // Add format requirements
    checklist += "\n## Format Requirements\n\n";
    if (formatReqs.length > 0) {
      formatReqs.forEach(format => {
        checklist += `- [ ] ${format}\n`;
      });
    } else {
      checklist += "- [ ] No specific format requirements found - check the RFP for details\n";
    }
    
    // Add document requirements
    checklist += "\n## Required Documents\n\n";
    if (docReqs.length > 0) {
      docReqs.forEach(doc => {
        checklist += `- [ ] ${doc}\n`;
      });
    } else {
      checklist += "- [ ] No specific document requirements found - check the RFP for details\n";
    }
    
    // Add final verification items
    checklist += "\n## Final Verification\n\n";
    checklist += "- [ ] All forms completely filled out\n";
    checklist += "- [ ] All required signatures included\n";
    checklist += "- [ ] Correct number of copies prepared\n";
    checklist += "- [ ] Proposal properly sealed and marked\n";
    checklist += "- [ ] Delivery method arranged for on-time submission\n";
    
    return checklist;
  }

  private extractRiskyClauses(text: string): string[] {
    const riskyClauses: string[] = [];
    
    // Look for potentially risky contract language
    const riskTerms = [
      "termination", "unilateral", "waive", "without cause", "sole discretion", 
      "unlimited liability", "indemnification", "warranty", "liquidated damages",
      "penalties", "remedy", "exclusive", "limitation of liability"
    ];
    
    // Split text into sentences or paragraphs
    const sections = text.split(/[.;]\s+/);
    
    for (const section of sections) {
      for (const term of riskTerms) {
        if (section.toLowerCase().includes(term)) {
          const trimmedSection = section.trim() + '.';
          if (trimmedSection.length > 20 && !riskyClauses.includes(trimmedSection)) {
            riskyClauses.push(trimmedSection);
          }
          break; // Move to next section after finding one risk term
        }
      }
    }
    
    return riskyClauses;
  }

  private suggestModification(clause: string): string {
    // This is a simplified implementation - in a real system, you would use more sophisticated NLP
    let suggestion = "Request clarification or modification to balance rights between parties.";
    
    if (clause.toLowerCase().includes("termination")) {
      suggestion = "Add requirement for reasonable notice period (e.g., 30 days) before termination.";
    } else if (clause.toLowerCase().includes("unilateral") || clause.toLowerCase().includes("sole discretion")) {
      suggestion = "Request mutual agreement language or objective criteria for decisions.";
    } else if (clause.toLowerCase().includes("unlimited liability") || clause.toLowerCase().includes("indemnification")) {
      suggestion = "Request cap on liability proportional to contract value.";
    } else if (clause.toLowerCase().includes("warranty")) {
      suggestion = "Clarify warranty scope and limit duration to reasonable period.";
    } else if (clause.toLowerCase().includes("liquidated damages") || clause.toLowerCase().includes("penalties")) {
      suggestion = "Request reduction in amounts and/or grace period for cure.";
    }
    
    return suggestion;
  }

  private generateRiskReport(riskyClauses: string[], modifications: Record<string, string>, analysisText: string): string {
    let report = "# Contract Risk Analysis Report\n\n";
    
    if (riskyClauses.length > 0) {
      report += "## Identified Risky Clauses\n\n";
      
      riskyClauses.forEach((clause, index) => {
        report += `### Risk ${index + 1}\n\n`;
        report += `**Clause:** ${clause}\n\n`;
        report += `**Suggested Modification:** ${modifications[clause] || "Request clarification or modification."}\n\n`;
        report += `**Risk Level:** ${this.assessRiskLevel(clause)}\n\n`;
      });
    } else {
      report += "No significant contract risks identified based on available information.\n\n";
    }
    
    report += "## General Recommendations\n\n";
    report += "1. Perform a detailed legal review of all contract terms\n";
    report += "2. Request clarification on any ambiguous language\n";
    report += "3. Negotiate modification of high-risk clauses before submission\n";
    report += "4. Document all assumptions in your proposal\n\n";
    
    report += "## Raw Analysis\n\n";
    report += analysisText;
    
    return report;
  }

  private assessRiskLevel(clause: string): string {
    // Simplified risk assessment logic
    const highRiskTerms = ["unlimited liability", "indemnification", "without cause", "sole discretion"];
    const mediumRiskTerms = ["termination", "warranty", "liquidated damages", "penalties"];
    
    for (const term of highRiskTerms) {
      if (clause.toLowerCase().includes(term)) {
        return "High";
      }
    }
    
    for (const term of mediumRiskTerms) {
      if (clause.toLowerCase().includes(term)) {
        return "Medium";
      }
    }
    
    return "Low";
  }

  private summarizeText(text: string, maxLength: number): string {
    // Very simplified summarization - in a real system, you would use NLP
    if (text.length <= maxLength) {
      return text;
    }
    
    // Basic extractive summarization - take the first part up to maxLength
    // and try to end at a sentence boundary
    let summary = text.substring(0, maxLength);
    const lastPeriod = summary.lastIndexOf('.');
    
    if (lastPeriod > maxLength * 0.7) { // If we found a period in the latter part
      summary = summary.substring(0, lastPeriod + 1);
    }
    
    return summary + " [...]";
  }
}
