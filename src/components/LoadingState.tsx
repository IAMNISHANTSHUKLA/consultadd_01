
import { Card } from "@/components/ui/card";

const LoadingState = () => {
  return (
    <div className="w-full space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-full overflow-hidden border animate-pulse">
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-40 bg-slate-200 rounded w-full"></div>
            <div className="flex justify-end">
              <div className="h-8 bg-slate-200 rounded w-1/6"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;
