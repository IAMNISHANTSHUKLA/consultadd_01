import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// src/index.ts
import vectorStore from './VectorStore.ts'; // Use .js if using ESModules

await vectorStore.testFunctionality();

createRoot(document.getElementById("root")!).render(<App />);
