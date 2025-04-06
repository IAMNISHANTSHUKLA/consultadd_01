
import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb';

// Sample code snippets for demonstration
export const codeSnippets = [
  {
    id: '1',
    title: 'React useState Hook Example',
    language: 'javascript',
    code: `import React, { useState } from 'react';

function Counter() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
    description: 'A simple React component that demonstrates the useState hook for state management.'
  },
  {
    id: '2',
    title: 'Async/Await Function',
    language: 'javascript',
    code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! Status: \${response.status}\`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}`,
    description: 'An async JavaScript function that fetches user data from an API with error handling.'
  },
  {
    id: '3',
    title: 'Array Map and Filter',
    language: 'javascript',
    code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter out odd numbers, then double each value
const processedNumbers = numbers
  .filter(num => num % 2 === 0)
  .map(num => num * 2);

console.log(processedNumbers); // [4, 8, 12, 16, 20]`,
    description: 'Example of using array methods filter and map for data transformation in JavaScript.'
  },
  {
    id: '4',
    title: 'Simple Express.js API',
    language: 'javascript',
    code: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Sample in-memory data
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    description: 'A simple Express.js API with endpoints to retrieve users.'
  },
  {
    id: '5',
    title: 'CSS Flexbox Layout',
    language: 'css',
    code: `.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 2rem;
}

.item {
  flex: 1 1 300px;
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}`,
    description: 'CSS flexbox layout with responsive design using media queries.'
  },
  {
    id: '6',
    title: 'Python List Comprehension',
    language: 'python',
    code: `# Traditional way
squares = []
for x in range(10):
    squares.append(x**2)
print(squares)

# Using list comprehension
squares = [x**2 for x in range(10)]
print(squares)

# With conditional filtering
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)`,
    description: 'Examples of list comprehension in Python for concise list creation and transformation.'
  }
];

class ChromaService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private embeddingFunction: any;
  private isInitialized = false;

  constructor() {
    this.client = new ChromaClient();
    // Note: In a production app, you'd use a real OpenAI API key
    // Here we're using a mock embedding function for demonstration
    this.embeddingFunction = {
      generate: async (texts: string[]) => {
        // Mock embedding function that creates random vectors
        // In a real app, you'd use OpenAI or another embedding provider
        return texts.map(() => {
          // Generate a random 384-dimensional vector
          return Array.from({ length: 384 }, () => Math.random());
        });
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create or get collection
      const collectionName = "code_snippets";
      
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

      // Add sample documents if the collection is empty
      const count = await this.collection.count();
      if (count === 0) {
        await this.addSampleData();
      }

      this.isInitialized = true;
      console.log("ChromaDB service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ChromaDB service:", error);
      throw error;
    }
  }

  private async addSampleData() {
    if (!this.collection) throw new Error("Collection not initialized");

    const ids = codeSnippets.map(snippet => snippet.id);
    const documents = codeSnippets.map(snippet => 
      `${snippet.title}. ${snippet.description} ${snippet.code}`
    );
    const metadatas = codeSnippets.map(snippet => ({
      title: snippet.title,
      language: snippet.language,
      description: snippet.description
    }));

    await this.collection.add({
      ids,
      documents,
      metadatas
    });

    console.log(`Added ${ids.length} sample code snippets to the collection`);
  }

  async searchSimilar(query: string, limit: number = 5) {
    if (!this.isInitialized) await this.initialize();
    if (!this.collection) throw new Error("Collection not initialized");

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit
      });

      // Map the results to include the full code snippets
      if (results.ids.length > 0) {
        const matchedIds = results.ids[0];
        return matchedIds.map((id, index) => {
          const snippetData = codeSnippets.find(snippet => snippet.id === id);
          const metadata = results.metadatas?.[0]?.[index] || {};
          const distance = results.distances?.[0]?.[index];
          
          return {
            ...snippetData,
            relevanceScore: distance ? 1 - distance : 1, // Convert distance to a relevance score
            metadata
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error("Error searching similar documents:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const chromaService = new ChromaService();
