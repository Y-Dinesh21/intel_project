
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, BarChart3, Trophy, Target, Clock, Bot, LogOut, User } from 'lucide-react';
import StudyMaterialGenerator from '@/components/learning/StudyMaterialGenerator';
import ProgressDashboard from '@/components/learning/ProgressDashboard';
import QuizSystem from '@/components/learning/QuizSystem';
import LearningPath from '@/components/learning/LearningPath';
import AITutor from '@/components/learning/AITutor';
import LoginPage from '@/components/auth/LoginPage';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const authProvider = useAuthProvider();
  const { userActivity, completeLesson } = useUserAnalytics();

  const handleStartLesson = () => {
    const subjects = ['mathematics', 'science', 'history', 'literature'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomLessonId = `lesson-${Date.now()}`;
    completeLesson(randomSubject, randomLessonId);
  };

  if (!authProvider.isAuthenticated) {
    return (
      <AuthContext.Provider value={authProvider}>
        <LoginPage />
      </AuthContext.Provider>
    );
  }

  // Calculate safe completion percentage
  const safeCompletedLessons = userActivity.completedLessons || 0;
  const safeTotalLessons = userActivity.totalLessons || 100;
  const completionPercentage = safeTotalLessons > 0 
    ? Math.round((safeCompletedLessons / safeTotalLessons) * 100) 
    : 0;

  // Calculate safe weekly goal percentage with proper fallbacks
  const safeWeeklyCompleted = userActivity.weeklyCompleted || 0;
  const safeWeeklyGoal = userActivity.weeklyGoal || 5;
  const weeklyGoalPercentage = safeWeeklyGoal > 0 
    ? Math.min(100, (safeWeeklyCompleted / safeWeeklyGoal) * 100)
    : 0;

  return (
    <AuthContext.Provider value={authProvider}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI LearnHub</h1>
                  <p className="text-sm text-gray-600">Your AI-Powered Learning Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{authProvider.user?.avatar}</span>
                  <div className="text-sm">
                    <div className="font-medium">{authProvider.user?.name}</div>
                    <div className="text-gray-600">{userActivity.currentLevel}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Trophy className="w-4 h-4 mr-1" />
                  {userActivity.totalXP || 0} XP
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Target className="w-4 h-4 mr-1" />
                  {userActivity.currentStreak || 0} day streak
                </Badge>
                <Button variant="outline" size="sm" onClick={authProvider.logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="tutor" className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Tutor</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Materials</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="path" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Path</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total XP</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userActivity.totalXP || 0}</div>
                    <p className="opacity-80">Keep learning to earn more!</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userActivity.currentStreak || 0} days</div>
                    <p className="opacity-80">{(userActivity.currentStreak || 0) > 0 ? 'Keep it up!' : 'Start your streak today!'}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Lessons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{safeCompletedLessons} of {safeTotalLessons}</div>
                    <p className="opacity-80">{completionPercentage}% complete</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userActivity.currentLevel || 'Beginner'}</div>
                    <p className="opacity-80">
                      {userActivity.currentLevel === 'Beginner' ? 'Level 1' :
                       userActivity.currentLevel === 'Intermediate' ? 'Level 2' :
                       userActivity.currentLevel === 'Advanced' ? 'Level 3' : 'Level 4'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Progress</CardTitle>
                    <CardDescription>Your learning progress across different subjects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userActivity.subjects.map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{subject.icon}</span>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(subject.progress || 0)}%</span>
                        </div>
                        <Progress value={subject.progress || 0} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {subject.lessonsCompleted || 0} of {subject.totalLessons} lessons completed
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Goal</CardTitle>
                    <CardDescription>Track your weekly learning target</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Lessons completed this week</span>
                        <span className="font-bold">{safeWeeklyCompleted} of {safeWeeklyGoal}</span>
                      </div>
                      <Progress value={weeklyGoalPercentage} className="h-3" />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {safeWeeklyCompleted >= safeWeeklyGoal 
                            ? 'Goal achieved! Great work!' 
                            : `${safeWeeklyGoal - safeWeeklyCompleted} more lessons to reach your goal!`
                          }
                        </span>
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600" onClick={handleStartLesson}>
                          Start Lesson
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ProgressDashboard userProgress={userActivity} />
            </TabsContent>

            <TabsContent value="tutor">
              <AITutor />
            </TabsContent>

            <TabsContent value="materials">
              <StudyMaterialGenerator />
            </TabsContent>

            <TabsContent value="quiz">
              <QuizSystem />
            </TabsContent>

            <TabsContent value="path">
              <LearningPath />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default Index;
