
import { Search } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Search className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No search results yet</h3>
      <p className="text-slate-500 max-w-md">
        Try searching for code snippets using natural language. For example:
      </p>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>"React state management"</p>
        <p>"API with error handling"</p>
        <p>"CSS flexbox layout"</p>
      </div>
    </div>
  );
};

export default EmptyState;
