import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Download, Share2, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserAnalytics } from "@/hooks/useUserAnalytics";

const StudyMaterialGenerator = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [materialType, setMaterialType] = useState('summary');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { addAIMaterial } = useUserAnalytics();

  const formatStudyMaterial = (text: string) => {
    // Format the response for better readability
    let formatted = text
      // Clean markdown formatting but preserve structure
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Convert headers to clean format
      .replace(/^#{1,6}\s+(.+)$/gm, '$1\n' + '='.repeat(50))
      // Format bullet points
      .replace(/^[\*\-\+]\s+/gm, '• ')
      // Format numbered lists
      .replace(/^\d+\.\s+/gm, (match) => match)
      // Clean up spacing
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    
    return formatted;
  };

  const generateStudyMaterial = async () => {
    if (!topic.trim() || !subject.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both topic and subject.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const materialPrompts = {
        summary: `Create a comprehensive study summary about "${topic}" in ${subject} at ${difficulty} level. Structure it with clear headings, key points, and important concepts. Make it educational and easy to understand. Use simple, clean formatting without excessive markdown.`,
        notes: `Create detailed study notes about "${topic}" in ${subject} at ${difficulty} level. Include definitions, examples, formulas (if applicable), and key takeaways. Format as organized notes with clear sections.`,
        flashcards: `Create 10 flashcard-style question-answer pairs about "${topic}" in ${subject} at ${difficulty} level. Format each as "Q: [question]" followed by "A: [answer]". Keep formatting simple and clean.`,
        outline: `Create a detailed study outline for "${topic}" in ${subject} at ${difficulty} level. Use a hierarchical structure with main topics, subtopics, and key points. Use simple formatting.`
      };

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
              "content": "You are an expert educational content creator. Create clear, well-structured, and informative study materials. Use simple, clean formatting without excessive markdown. Focus on readability and educational value."
            },
            {
              "role": "user",
              "content": materialPrompts[materialType as keyof typeof materialPrompts]
            }
          ]
        })
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "Failed to generate content.";
      
      // Format the content for clean display
      content = formatStudyMaterial(content);
      
      setGeneratedContent(content);
      
      // Track AI material generation
      addAIMaterial(subject, topic, 'study_material');
      
      toast({
        title: "Study Material Generated!",
        description: `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} about "${topic}" created successfully.`,
      });

    } catch (error) {
      console.error('Error generating study material:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate study material. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Study material copied to clipboard.",
    });
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${topic}_${materialType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Study material downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>AI Study Material Generator</span>
          </CardTitle>
          <CardDescription>
            Generate personalized study materials using AI. Create summaries, notes, flashcards, and outlines tailored to your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Science, History"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Algebra, Photosynthesis, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <select
                id="materialType"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
              >
                <option value="summary">Study Summary</option>
                <option value="notes">Detailed Notes</option>
                <option value="flashcards">Flashcards</option>
                <option value="outline">Study Outline</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generateStudyMaterial}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Content...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Generate Study Material</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Generated Study Material</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Badge variant="secondary">
                  {materialType.charAt(0).toUpperCase() + materialType.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 border">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800 font-medium">
                {generatedContent}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={copyContent}>
                <Share2 className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={downloadContent}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyMaterialGenerator;
