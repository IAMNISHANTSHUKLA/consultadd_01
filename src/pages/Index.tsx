
import { useState, useEffect } from "react";
import { chromaService, codeSnippets } from "@/lib/chromaService";
import SearchInput from "@/components/SearchInput";
import CodeSnippet from "@/components/CodeSnippet";
import ChromaLogo from "@/components/ChromaLogo";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initChroma = async () => {
      try {
        await chromaService.initialize();
        setDbInitialized(true);
      } catch (error) {
        console.error("Failed to initialize ChromaDB:", error);
        setInitError("Failed to initialize vector database");
      }
    };

    initChroma();
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await chromaService.searchSimilar(query);
      setResults(searchResults);
      console.log("Search results:", searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-white to-slate-50">
      <header className="w-full bg-white shadow-sm py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChromaLogo />
            <h1 className="text-2xl font-bold bg-gradient-chroma text-transparent bg-clip-text">
              ChromaCode Query
            </h1>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
                  <HelpCircle size={18} />
                  <span className="text-sm">About</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>ChromaCode Query uses vector embeddings to search code snippets semantically. Try searching with natural language!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Find Code Snippets Using Natural Language</h2>
            <p className="text-slate-600">
              Our semantic search uses ChromaDB's vector database to find code snippets based on meaning, not just keywords.
            </p>
          </div>

          <SearchInput onSearch={handleSearch} isLoading={isLoading} />

          {initError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 w-full max-w-3xl">
              {initError}. Please try refreshing the page.
            </div>
          )}

          <div className="w-full max-w-3xl space-y-6">
            {!hasSearched ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {codeSnippets.slice(0, 4).map((snippet) => (
                  <CodeSnippet
                    key={snippet.id}
                    id={snippet.id}
                    title={snippet.title}
                    language={snippet.language}
                    code={snippet.code}
                    description={snippet.description}
                  />
                ))}
              </div>
            ) : isLoading ? (
              <LoadingState />
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result) => (
                  <CodeSnippet
                    key={result.id}
                    id={result.id}
                    title={result.title}
                    language={result.language}
                    code={result.code}
                    description={result.description}
                    relevanceScore={result.relevanceScore}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-6 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>
            Built with ChromaDB vector database for semantic code search
          </p>
          <p className="mt-1">
            Note: This is a demonstration using local embeddings. In production, connect to a real embeddings API.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
