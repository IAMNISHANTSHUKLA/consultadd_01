
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface CodeSnippetProps {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  relevanceScore?: number;
}

const getLanguageDisplayName = (lang: string) => {
  const map: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'css': 'CSS',
    'html': 'HTML',
    'java': 'Java',
    'go': 'Go',
    'rust': 'Rust',
    'cpp': 'C++',
    'csharp': 'C#',
  };
  
  return map[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

const getRelevanceColor = (score?: number) => {
  if (!score) return 'bg-gray-200 text-gray-800';
  if (score > 0.8) return 'bg-green-100 text-green-800';
  if (score > 0.6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

const CodeSnippet = ({ id, title, language, code, description, relevanceScore }: CodeSnippetProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full overflow-hidden border-2 transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="font-mono">
              {getLanguageDisplayName(language)}
            </Badge>
            {relevanceScore !== undefined && (
              <Badge variant="outline" className={getRelevanceColor(relevanceScore)}>
                {Math.round(relevanceScore * 100)}% match
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="border rounded overflow-hidden bg-slate-50">
        <CodeMirror
          value={code}
          height="auto"
          extensions={[javascript()]}
          editable={false}
          basicSetup={{
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: false,
          }}
        />
      </CardContent>
      <CardFooter className="flex justify-end pt-2 pb-3">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={copyToClipboard}
          className="flex items-center gap-1"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy code'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeSnippet;
