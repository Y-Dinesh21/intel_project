
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserAnalytics } from "@/hooks/useUserAnalytics";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  subject?: string;
}

const AITutor = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI tutor. I can help you with any subject - just ask me questions about math, science, history, literature, or any topic you\'re studying. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('');
  const { toast } = useToast();
  const { addStudySession, addAIMaterial } = useUserAnalytics();

  const formatResponse = (text: string) => {
    // Clean up markdown formatting for better display
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[\*\-\+]\s+/gm, '• ')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    
    return formatted;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      subject: currentSubject
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_OPENROUTER_API_KEY_HERE",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "system",
              "content": "You are a helpful AI tutor. Provide clear, educational responses that help students learn. Break down complex concepts into simple explanations. Use examples when helpful. Keep responses concise but comprehensive. Provide clean, readable text without excessive markdown formatting."
            },
            ...messages.slice(-5).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              "role": "user",
              "content": input
            }
          ],
          "temperature": 0.7,
          "max_tokens": 1000
        })
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again.";
      
      content = formatResponse(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        subject: currentSubject
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Track tutor session and study time
      addStudySession(currentSubject || 'General', 0.25);
      addAIMaterial(currentSubject || 'General', input.substring(0, 50), 'tutor_session');
      
      toast({
        title: "Response received!",
        description: "+5 XP earned for active learning!",
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your internet connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { text: "Explain this concept", icon: BookOpen },
    { text: "Give me examples", icon: Sparkles },
    { text: "Help me solve this", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span>AI Tutor</span>
          </CardTitle>
          <CardDescription>
            Get personalized help with any subject. Ask questions, request explanations, or get study guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Current Subject:</label>
            <Input
              placeholder="e.g., Mathematics, Science, History"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle>Chat with AI Tutor</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                      {message.subject && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {message.subject}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt.text)}
                  className="flex items-center space-x-1"
                >
                  <prompt.icon className="w-3 h-3" />
                  <span>{prompt.text}</span>
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI tutor anything..."
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITutor;
