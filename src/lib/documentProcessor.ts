
import pdfParse from 'pdf-parse';

/**
 * Process different document types and prepare them for embedding
 */
export class DocumentProcessor {
  /**
   * Process a document file (currently supports PDF and text)
   */
  public static async processFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      return await this.processPdf(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await this.processTextFile(file);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  /**
   * Process a PDF file and extract its text content
   */
  private static async processPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  /**
   * Process a text file and extract its content
   */
  private static async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading text file'));
      reader.readAsText(file);
    });
  }

  /**
   * Split a document into chunks for embedding
   */
  public static chunkDocument(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    
    if (text.length <= chunkSize) {
      chunks.push(text);
    } else {
      let startIndex = 0;
      while (startIndex < text.length) {
        let endIndex = startIndex + chunkSize;
        // If we're not at the end, try to find a good break point
        if (endIndex < text.length) {
          // Look for the next period, question mark, or exclamation point after the chunk size
          const nextBreak = text.indexOf('.', endIndex);
          const nextQuestion = text.indexOf('?', endIndex);
          const nextExclamation = text.indexOf('!', endIndex);
          
          // Find the closest one that exists
          const breakPoints = [nextBreak, nextQuestion, nextExclamation]
            .filter(point => point !== -1)
            .sort((a, b) => a - b);
          
          if (breakPoints.length > 0 && breakPoints[0] - endIndex < 100) {
            endIndex = breakPoints[0] + 1; // Include the punctuation mark
          } else {
            // If no good break point, look for a space
            const nextSpace = text.indexOf(' ', endIndex);
            if (nextSpace !== -1 && nextSpace - endIndex < 50) {
              endIndex = nextSpace;
            }
          }
        }
        
        chunks.push(text.substring(startIndex, endIndex).trim());
        startIndex = endIndex - overlap;
      }
    }
    
    return chunks;
  }

  /**
   * Clean and normalize text for better processing
   */
  public static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
      .replace(/\n+/g, ' ')  // Replace multiple newlines with a single space
      .replace(/\t+/g, ' ')  // Replace tabs with a space
      .trim();
  }
}
