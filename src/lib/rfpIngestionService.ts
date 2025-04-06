
import { v4 as uuidv4 } from 'uuid';
import vectorStore from './vectorStore';
import { DocumentProcessor } from './documentProcessor';

/**
 * Service for ingesting and processing RFP documents
 */
export class RfpIngestionService {
  /**
   * Process and store an RFP document in the vector database
   */
  public static async ingestRfpDocument(
    file: File,
    metadata: {
      title: string;
      agency: string;
      dueDate?: string;
      rfpNumber?: string;
    }
  ): Promise<string> {
    try {
      // Process the document
      const content = await DocumentProcessor.processFile(file);
      
      // Generate a unique ID for this RFP
      const rfpId = uuidv4();
      
      // Add metadata
      const documentMetadata = {
        ...metadata,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dateIngested: new Date().toISOString(),
        id: rfpId
      };
      
      // Clean and chunk the document
      const cleanedContent = DocumentProcessor.cleanText(content);
      const chunks = DocumentProcessor.chunkDocument(cleanedContent);
      
      // Prepare documents for the vector store
      const documents = chunks.map((chunk, index) => ({
        id: `${rfpId}-chunk-${index}`,
        content: chunk,
        metadata: {
          ...documentMetadata,
          chunkIndex: index,
          totalChunks: chunks.length
        }
      }));
      
      // Store in the vector database
      await vectorStore.addDocuments(documents);
      
      console.log(`RFP document ingested with ID ${rfpId}, ${chunks.length} chunks created`);
      
      return rfpId;
    } catch (error) {
      console.error('Error ingesting RFP document:', error);
      throw new Error(`Failed to ingest RFP document: ${error.message}`);
    }
  }

  /**
   * Get a count of documents in the collection
   */
  public static async getDocumentCount(): Promise<number> {
    return await vectorStore.getCollectionCount();
  }

  /**
   * Reset the vector database (for testing purposes)
   */
  public static async resetDatabase(): Promise<void> {
    await vectorStore.deleteCollection("rfp_documents");
    await vectorStore.initialize();
  }
}
