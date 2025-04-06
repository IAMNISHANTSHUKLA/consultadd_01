
import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb';
import { pipeline } from '@xenova/transformers';

/**
 * VectorStore class for managing document embeddings and retrieval
 */
export class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private embeddingFunction: any;
  private isInitialized = false;
  private static instance: VectorStore;

  private constructor() {
    this.client = new ChromaClient();
    // Using xenova/transformers for embeddings
    this.initEmbeddingFunction();
  }

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  private async initEmbeddingFunction() {
    try {
      // Initialize the embedding pipeline using transformer.js
      const embeddingModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
      
      // Create custom embedding function that uses the pipeline
      this.embeddingFunction = {
        generate: async (texts: string[]) => {
          try {
            const embeddings = [];
            for (const text of texts) {
              const result = await embeddingModel(text, { pooling: 'mean', normalize: true });
              embeddings.push(Array.from(result.data));
            }
            return embeddings;
          } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
          }
        }
      };
    } catch (error) {
      console.error('Failed to initialize embedding function:', error);
      // Fallback to random embeddings for demo purposes
      this.embeddingFunction = {
        generate: async (texts: string[]) => {
          console.warn('Using fallback random embeddings (for demo purposes only)');
          return texts.map(() => Array.from({ length: 384 }, () => Math.random()));
        }
      };
    }
  }

  public async initialize(collectionName: string = "rfp_documents"): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Make sure embedding function is ready
      if (!this.embeddingFunction) {
        await this.initEmbeddingFunction();
      }

      // Create or get collection
      try {
        this.collection = await this.client.getCollection({
          name: collectionName,
          embeddingFunction: this.embeddingFunction
        });
        console.log("Retrieved existing collection");
      } catch (error) {
        console.log("Creating new collection");
        this.collection = await this.client.createCollection({
          name: collectionName,
          embeddingFunction: this.embeddingFunction
        });
      }

      this.isInitialized = true;
      console.log("ChromaDB vector store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ChromaDB vector store:", error);
      throw error;
    }
  }

  public async addDocuments(documents: { id: string; content: string; metadata?: Record<string, any> }[]): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.collection) throw new Error("Collection not initialized");

    try {
      const ids = documents.map(doc => doc.id);
      const contents = documents.map(doc => doc.content);
      const metadatas = documents.map(doc => doc.metadata || {});

      await this.collection.add({
        ids,
        documents: contents,
        metadatas
      });

      console.log(`Added ${ids.length} documents to the collection`);
    } catch (error) {
      console.error("Error adding documents:", error);
      throw error;
    }
  }

  public async similaritySearch(query: string, limit: number = 5): Promise<Array<{ id: string; content: string; metadata: any; score: number }>> {
    if (!this.isInitialized) await this.initialize();
    if (!this.collection) throw new Error("Collection not initialized");

    try {
      // Fix: Use proper include enum values according to ChromaDB's expected types
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit,
        include: ["documents", "metadatas", "distances"] as any
      });

      // Map the results to a more usable format
      if (results.ids.length > 0 && results.ids[0].length > 0) {
        return results.ids[0].map((id, index) => {
          const distance = results.distances && results.distances[0] ? results.distances[0][index] : 1;
          return {
            id,
            content: results.documents?.[0]?.[index] || "",
            metadata: results.metadatas?.[0]?.[index] || {},
            score: 1 - (distance || 0) // Convert distance to similarity score
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error("Error searching documents:", error);
      throw error;
    }
  }

  public async deleteCollection(collectionName: string): Promise<void> {
    try {
      await this.client.deleteCollection({ name: collectionName });
      this.collection = null;
      this.isInitialized = false;
      console.log(`Collection ${collectionName} deleted`);
    } catch (error) {
      console.error(`Error deleting collection ${collectionName}:`, error);
      throw error;
    }
  }

  public async getCollectionCount(): Promise<number> {
    if (!this.isInitialized) await this.initialize();
    if (!this.collection) throw new Error("Collection not initialized");
    
    return await this.collection.count();
  }
}

export default VectorStore.getInstance();
