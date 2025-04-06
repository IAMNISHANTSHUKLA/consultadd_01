
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput = ({ onSearch, isLoading }: SearchInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Search for code examples..."
          className="pr-10 border-2 h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !query.trim()} 
        className="bg-gradient-chroma hover:opacity-90 transition-opacity h-12"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
            <span>Searching...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Search size={18} />
            <span>Search</span>
          </div>
        )}
      </Button>
    </form>
  );
};

export default SearchInput;
