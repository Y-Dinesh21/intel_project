import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Lock, Play, Star, BookOpen, Target, Award, Trophy } from 'lucide-react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  type: 'video' | 'reading' | 'quiz' | 'practice';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  lessons: Lesson[];
  skills: string[];
  subject: string;
}

const LearningPath = () => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([
    {
      id: 'mathematics-fundamentals',
      title: 'Mathematics Fundamentals',
      description: 'Master the essential mathematical concepts from basic arithmetic to algebra',
      difficulty: 'Beginner',
      progress: 65,
      totalLessons: 12,
      completedLessons: 8,
      estimatedTime: '4 weeks',
      subject: 'Mathematics',
      skills: ['Arithmetic', 'Basic Algebra', 'Fractions', 'Decimals', 'Percentages'],
      lessons: [
        { id: '1', title: 'Introduction to Numbers', duration: '15 min', completed: true, locked: false, type: 'video' },
        { id: '2', title: 'Basic Addition and Subtraction', duration: '20 min', completed: true, locked: false, type: 'practice' },
        { id: '3', title: 'Multiplication Tables', duration: '25 min', completed: true, locked: false, type: 'practice' },
        { id: '4', title: 'Division Fundamentals', duration: '20 min', completed: true, locked: false, type: 'video' },
        { id: '5', title: 'Working with Fractions', duration: '30 min', completed: true, locked: false, type: 'reading' },
        { id: '6', title: 'Decimal Operations', duration: '25 min', completed: true, locked: false, type: 'practice' },
        { id: '7', title: 'Percentage Calculations', duration: '20 min', completed: true, locked: false, type: 'video' },
        { id: '8', title: 'Introduction to Algebra', duration: '35 min', completed: true, locked: false, type: 'reading' },
        { id: '9', title: 'Solving Linear Equations', duration: '40 min', completed: false, locked: false, type: 'practice' },
        { id: '10', title: 'Graphing Linear Functions', duration: '30 min', completed: false, locked: true, type: 'video' },
        { id: '11', title: 'Word Problems', duration: '45 min', completed: false, locked: true, type: 'practice' },
        { id: '12', title: 'Final Assessment', duration: '60 min', completed: false, locked: true, type: 'quiz' }
      ]
    },
    {
      id: 'science-basics',
      title: 'Science Fundamentals',
      description: 'Explore the basic principles of physics, chemistry, and biology',
      difficulty: 'Beginner',
      progress: 40,
      totalLessons: 15,
      completedLessons: 6,
      estimatedTime: '5 weeks',
      subject: 'Science',
      skills: ['Scientific Method', 'Physics Basics', 'Chemistry Basics', 'Biology Basics'],
      lessons: [
        { id: '1', title: 'The Scientific Method', duration: '20 min', completed: true, locked: false, type: 'video' },
        { id: '2', title: 'Observation and Hypothesis', duration: '25 min', completed: true, locked: false, type: 'reading' },
        { id: '3', title: 'Basic Physics Concepts', duration: '30 min', completed: true, locked: false, type: 'video' },
        { id: '4', title: 'Matter and Atoms', duration: '35 min', completed: true, locked: false, type: 'reading' },
        { id: '5', title: 'Chemical Reactions', duration: '40 min', completed: true, locked: false, type: 'practice' },
        { id: '6', title: 'Living Organisms', duration: '30 min', completed: true, locked: false, type: 'video' },
        { id: '7', title: 'Cell Structure', duration: '35 min', completed: false, locked: false, type: 'reading' },
        { id: '8', title: 'Energy and Motion', duration: '40 min', completed: false, locked: true, type: 'practice' },
      ]
    },
    {
      id: 'world-history',
      title: 'World History Overview',
      description: 'Journey through major historical events and civilizations',
      difficulty: 'Intermediate',
      progress: 25,
      totalLessons: 20,
      completedLessons: 5,
      estimatedTime: '6 weeks',
      subject: 'History',
      skills: ['Ancient Civilizations', 'Medieval History', 'Modern History', 'Historical Analysis'],
      lessons: [
        { id: '1', title: 'Introduction to History', duration: '15 min', completed: true, locked: false, type: 'video' },
        { id: '2', title: 'Ancient Mesopotamia', duration: '30 min', completed: true, locked: false, type: 'reading' },
        { id: '3', title: 'Ancient Egypt', duration: '35 min', completed: true, locked: false, type: 'video' },
        { id: '4', title: 'Ancient Greece', duration: '40 min', completed: true, locked: false, type: 'reading' },
        { id: '5', title: 'The Roman Empire', duration: '45 min', completed: true, locked: false, type: 'video' },
        { id: '6', title: 'Medieval Europe', duration: '40 min', completed: false, locked: false, type: 'reading' },
      ]
    }
  ]);

  const { completeLesson, addStudySession } = useUserAnalytics();
  const { toast } = useToast();

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'reading': return '📚';
      case 'quiz': return '📝';
      case 'practice': return '💡';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDurationInHours = (duration: string) => {
    const minutes = parseInt(duration.split(' ')[0]);
    return minutes / 60;
  };

  const startLesson = (lesson: Lesson, pathId: string) => {
    if (lesson.locked) return;
    
    setCurrentLesson(lesson);
    
    // Simulate lesson completion after 2 seconds
    setTimeout(() => {
      completeLesson(pathId, lesson.id);
      
      const hours = getDurationInHours(lesson.duration);
      addStudySession(getPathSubject(pathId), hours);
      
      // Update local state
      setLearningPaths(prev => prev.map(path => {
        if (path.id === pathId) {
          const updatedLessons = path.lessons.map(l => 
            l.id === lesson.id ? { ...l, completed: true } : l
          );
          
          // Unlock next lesson
          const currentIndex = path.lessons.findIndex(l => l.id === lesson.id);
          if (currentIndex < path.lessons.length - 1) {
            updatedLessons[currentIndex + 1].locked = false;
          }
          
          const completedCount = updatedLessons.filter(l => l.completed).length;
          const newProgress = (completedCount / path.totalLessons) * 100;
          
          return {
            ...path,
            lessons: updatedLessons,
            completedLessons: completedCount,
            progress: newProgress
          };
        }
        return path;
      }));
      
      setCurrentLesson(null);
      
      toast({
        title: "Lesson Completed! 🎉",
        description: `You earned +25 XP and gained study time!`,
      });
    }, 2000);
  };

  const getPathSubject = (pathId: string) => {
    const path = learningPaths.find(p => p.id === pathId);
    return path?.subject || 'General';
  };

  if (selectedPath) {
    const path = learningPaths.find(p => p.id === selectedPath);
    if (!path) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedPath('')}>
            ← Back to Paths
          </Button>
          <Badge className={getDifficultyColor(path.difficulty)}>
            {path.difficulty}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>{path.title}</span>
            </CardTitle>
            <p className="text-gray-600">{path.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(path.progress)}%</div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{path.completedLessons}/{path.totalLessons}</div>
                <p className="text-sm text-gray-600">Lessons</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{path.estimatedTime}</div>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
            </div>
            
            <Progress value={path.progress} className="h-3 mb-4" />
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Skills you'll learn:</h4>
              <div className="flex flex-wrap gap-2">
                {path.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {path.lessons.map((lesson, index) => (
                <div key={lesson.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                  lesson.completed ? 'bg-green-50 border-green-200' : 
                  lesson.locked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-colors`}>
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : lesson.locked ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getLessonIcon(lesson.type)}</span>
                      <h4 className={`font-medium ${lesson.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {lesson.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}</span>
                      <Badge variant="outline" className="text-xs">
                        {lesson.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    {lesson.completed ? (
                      <Badge className="bg-green-600">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : lesson.locked ? (
                      <Badge variant="secondary">Locked</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => startLesson(lesson, path.id)}
                        disabled={currentLesson?.id === lesson.id}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        {currentLesson?.id === lesson.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            Learning...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>Personalized Learning Paths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Follow structured learning paths designed to build your knowledge step by step. 
            Each path is tailored to your current level and learning goals.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <Card 
                key={path.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPath(path.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(path.difficulty)}>
                      {path.difficulty}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {path.estimatedTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <p className="text-sm text-gray-600">{path.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{Math.round(path.progress)}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{path.completedLessons}/{path.totalLessons} lessons</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {path.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{path.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPath(path.id);
                      }}
                    >
                      {path.progress > 0 ? 'Continue' : 'Start Path'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Recommended for You</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Advanced Mathematics</h3>
                <p className="text-gray-600 mb-4">
                  Based on your progress in Mathematics Fundamentals, you're ready for calculus and advanced topics.
                </p>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                  <span className="text-sm text-gray-600">8 weeks • 25 lessons</span>
                </div>
              </div>
              <Button variant="outline">
                View Path
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPath;
