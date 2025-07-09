import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Trophy, Target, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserAnalytics } from "@/hooks/useUserAnalytics";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject?: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selectedAnswer: number; correct: boolean }[];
}

const QuizSystem = () => {
  // Sample quiz questions
  const sampleQuestions: Question[] = [
    {
      id: '1',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      explanation: 'Paris is the capital and largest city of France.',
      subject: 'Geography'
    },
    {
      id: '2',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: 'Basic addition: 2 + 2 = 4',
      subject: 'Mathematics'
    },
    {
      id: '3',
      question: 'Who wrote Romeo and Juliet?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 1,
      explanation: 'William Shakespeare wrote Romeo and Juliet in the early part of his career.',
      subject: 'Literature'
    }
  ];

  const { addQuizScore, addAIMaterial, completeLesson } = useUserAnalytics();
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // AI Quiz Generation
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // TODO: Replace with your actual OpenRouter API key
  const API_KEY = "YOUR_OPENROUTER_API_KEY_HERE";

  const generateAIQuiz = async () => {
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
      const prompt = `Create a 5-question multiple choice quiz about "${topic}" in ${subject}. Format as JSON array with "question", "options" (array of 4 choices), "correctAnswer" (index of correct answer 0-3), and "explanation" fields. Make sure the JSON is valid and properly formatted.`;

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
              "content": "You are an educational quiz generator. Create high-quality multiple choice questions that are accurate and educational. Always respond with valid JSON format only, no additional text."
            },
            {
              "role": "user",
              "content": prompt
            }
          ]
        })
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "Failed to generate quiz.";
      
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let parsedQuestions;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          parsedQuestions = JSON.parse(content);
        }
        
        parsedQuestions = parsedQuestions.map((q: any, index: number) => ({
          id: (Date.now() + index).toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: subject
        }));
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        toast({
          title: "Generation Failed",
          description: "Failed to parse the generated quiz. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Track AI material generation
      addAIMaterial(subject, topic, 'quiz');

      setQuestions(parsedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizCompleted(false);
      setQuizResult(null);
      setShowExplanation(false);
      
      toast({
        title: "Quiz Generated!",
        description: `AI quiz about "${topic}" created successfully.`,
      });

    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI quiz. Please check your API key and internet connection.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const completeQuiz = () => {
    const answers = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] ?? -1,
      correct: selectedAnswers[q.id] === q.correctAnswer
    }));

    const score = answers.filter(a => a.correct).length;
    
    // Check if this is an AI-generated quiz
    const isAIGenerated = questions.length > 3; // AI quizzes have 5 questions, sample has 3
    
    // Track the quiz score in user analytics
    addQuizScore(currentQuestion.subject || 'General', score, questions.length, isAIGenerated);
    
    setQuizResult({
      score,
      totalQuestions: questions.length,
      answers
    });
    
    setQuizCompleted(true);
    
    const percentage = Math.round((score / questions.length) * 100);
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}/${questions.length} (${percentage}%). +${score * 10} XP earned!`,
    });
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizResult(null);
    setShowExplanation(false);
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  if (quizCompleted && quizResult) {
    const percentage = Math.round((quizResult.score / quizResult.totalQuestions) * 100);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Quiz Completed!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {quizResult.score}/{quizResult.totalQuestions}
              </div>
              <div className="text-xl text-gray-600 mb-4">
                {percentage}% Score
              </div>
              <Progress value={percentage} className="h-3 mb-4" />
              
              <div className="flex justify-center space-x-4 mb-6">
                <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                  {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Review Your Answers:</h3>
              {questions.map((question, index) => {
                const userAnswer = quizResult.answers[index];
                const isCorrect = userAnswer.correct;
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your answer: {question.options[userAnswer.selectedAnswer] || "Not answered"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetQuiz} className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Quiz Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>AI Quiz Generator</span>
          </CardTitle>
          <CardDescription>
            Generate custom quizzes using AI. Enter your topic and subject to create personalized questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="e.g., Mathematics, Science, History"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Input
                placeholder="e.g., Algebra, Photosynthesis, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>
          
          <Button
            onClick={generateAIQuiz}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Generate AI Quiz</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quiz Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interactive Quiz</CardTitle>
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / questions.length) * 100} 
            className="h-2"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id] === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showExplanation;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : isSelected
                          ? 'border-red-500 bg-red-500 text-red-800'
                          : 'border-gray-200 bg-gray-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isSelected
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-gray-300'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedAnswers[currentQuestion.id] !== undefined && (
            <div className="space-y-4">
              <Button
                onClick={toggleExplanation}
                variant="outline"
                className="w-full"
              >
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </Button>
              
              {showExplanation && currentQuestion.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion.id] === undefined}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSystem;
