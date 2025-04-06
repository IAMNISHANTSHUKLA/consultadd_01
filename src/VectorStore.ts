// Filename: vectorStore.ts
// Description: A singleton class to manage ChromaDB vector store via REST API using embeddings from @xenova/transformers

import axios from 'axios';

const { pipeline } = await import('@xenova/transformers');

export class VectorStore {
  private static instance: VectorStore;
  private embeddingModel: (text: string, options: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }> | null = null;
  private collectionName = 'rfp_documents';
  private chromaUrl = 'http://localhost:8000/api/v1';

  private constructor() {}

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  private async initEmbeddingModel(): Promise<void> {
    if (!this.embeddingModel) {
      this.embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as (text: string, options: { pooling: "none" | "mean" | "cls"; normalize: boolean }) => Promise<{ data: Float32Array }>;
    }
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    await this.initEmbeddingModel();
    const results: number[][] = [];

    for (const text of texts) {
      const output = await (this.embeddingModel as (text: string, options: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>)(text, {
        pooling: 'mean',
        normalize: true,
      });
      results.push(Array.from(output.data));
    }

    return results;
  }

  public async initialize(): Promise<void> {
    try {
      await axios.post(`${this.chromaUrl}/collections`, {
        name: this.collectionName,
      });
      console.log(`✅ Created new Chroma collection: ${this.collectionName}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
      if (err?.response?.status === 409) {
        console.log(`ℹ️ Collection ${this.collectionName} already exists`);
      } else {
        console.error('❌ Failed to initialize Chroma collection:', err);
          throw err;
        }
      }
    }
  }

  public async addDocuments(
    docs: { id: string; content: string; metadata?: Record<string, unknown> }[]
  ): Promise<void> {
    await this.initialize();
    const ids = docs.map((d) => d.id);
    const texts = docs.map((d) => d.content);
    const metadatas = docs.map((d) => d.metadata || {});

    const embeddings = await this.generateEmbeddings(texts);

    await axios.post(`${this.chromaUrl}/collections/${this.collectionName}/add`, {
      ids,
      documents: texts,
      metadatas,
      embeddings,
    });

    console.log(`✅ Added ${docs.length} documents to Chroma`);
  }

  public async similaritySearch(
    query: string,
    limit: number = 5
  ): Promise<Array<{ id: string; content: string; metadata: Record<string, unknown>; score: number }>> {
    await this.initialize();

    const [embedding] = await this.generateEmbeddings([query]);

    const res = await axios.post(`${this.chromaUrl}/collections/${this.collectionName}/query`, {
      queries: [embedding],
      n_results: limit,
      include: ['documents', 'metadatas', 'distances'],
    });

    const results = res.data;

    if (results.ids?.[0]?.length > 0) {
      return results.ids[0].map((id: string, i: number) => ({
        id,
        content: results.documents[0][i],
        metadata: results.metadatas[0][i],
        score: 1 - results.distances[0][i], // Lower distance = higher similarity
      }));
    }

    return [];
  }

  public async testFunctionality(): Promise<void> {
    try {
      const testDocs = [
        { id: '1', content: 'This is a test document about AI.', metadata: { topic: 'AI' } },
        { id: '2', content: 'This document discusses machine learning.', metadata: { topic: 'ML' } },
      ];

      await this.addDocuments(testDocs);

      const results = await this.similaritySearch('Tell me about AI', 2);
      console.log('🔍 Similarity results:', results);
    } catch (err) {
      console.error('❌ Test failed:', err);
    }
  }
}

export default VectorStore.getInstance();
