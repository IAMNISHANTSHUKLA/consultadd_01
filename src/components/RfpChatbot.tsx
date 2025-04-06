
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, AlertCircle, HelpCircle } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RfpChatbotProps {
  rfpId: string | null;
  onAskQuestion: (question: string, rfpId?: string) => Promise<{
    results: Array<{ id: string; content: string; metadata: any; score: number }>;
    answer: string;
  }>;
  isLoading: boolean;
}

export function RfpChatbot({ rfpId, onAskQuestion, isLoading }: RfpChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you with questions about the RFP. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Get response from RAG system
      const response = await onAskQuestion(input, rfpId || undefined);
      
      // For each retrieved document, add context
      const contextMessages: ChatMessage[] = response.results.map(result => ({
        role: 'assistant',
        content: `**Related Context:**\n\n${result.content}\n\n**Relevance Score:** ${(result.score * 100).toFixed(0)}%`,
        timestamp: new Date()
      }));
      
      // Add the final answer
      const answerMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, ...contextMessages, answerMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    "What are the eligibility requirements?",
    "When is the submission deadline?",
    "What documents need to be included?",
    "Are there any high-risk clauses?"
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 text-primary mr-2" />
            <div>
              <CardTitle className="text-lg">RFP Assistant</CardTitle>
              <CardDescription className="text-xs">
                Ask questions about the RFP document
              </CardDescription>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center">
            {rfpId ? (
              <span className="flex items-center text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                RFP Loaded
              </span>
            ) : (
              <span className="flex items-center text-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                No RFP Selected
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-[400px] p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'assistant'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert">
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'assistant'
                      ? 'text-muted-foreground'
                      : 'text-primary-foreground/80'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput(question);
                }}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex items-center w-full gap-2">
          <Input
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
