import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Target, Award, Clock, BookOpen } from 'lucide-react';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

interface UserProgressData {
  totalXP: number;
  currentStreak: number;
  completedLessons: number;
  totalLessons: number;
  currentLevel: string;
  weeklyGoal: number;
  weeklyCompleted: number;
  subjects: Array<{
    name: string;
    progress: number;
    color: string;
    icon: string;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
  quizScores: Array<{
    subject: string;
    score: number;
    totalQuestions: number;
    date: Date;
    isAIGenerated?: boolean;
  }>;
  aiMaterialsGenerated: Array<{
    subject: string;
    topic: string;
    date: Date;
    type: 'study_material' | 'quiz' | 'tutor_session';
    performance?: number;
  }>;
}

interface ProgressDashboardProps {
  userProgress: UserProgressData;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userProgress }) => {
  const { getWeeklyData, getPerformanceData } = useUserAnalytics();
  
  const weeklyData = getWeeklyData();
  const performanceData = getPerformanceData();

  // Helper function to format hours for tooltips (short format)
  const formatHoursShort = (totalHours: number) => {
    if (totalHours === 0) return "0hrs";
    if (totalHours < 1) {
      const minutes = Math.round(totalHours * 60);
      return `${minutes}min`;
    }
    return `${totalHours.toFixed(1)}hrs`;
  };

  // Helper function to format hours and minutes for labels
  const formatHoursMinutes = (totalHours: number) => {
    if (totalHours === 0) return "0min";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  // Define distinct colors for subjects
  const subjectColors = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

  // Convert subject data for pie chart with proper time formatting and distinct colors
  const subjectData = userProgress.subjects
    .filter(subject => (subject.lessonsCompleted || 0) > 0)
    .map((subject, index) => ({
      subject: subject.name,
      hours: Math.max(0.1, ((subject.lessonsCompleted || 0) * 0.5)),
      fill: subjectColors[index % subjectColors.length], // Use distinct colors
      formattedTime: formatHoursMinutes((subject.lessonsCompleted || 0) * 0.5)
    }));

  // If no subjects have progress, show default data
  if (subjectData.length === 0) {
    subjectData.push({
      subject: 'Start Learning',
      hours: 0.1,
      fill: '#E5E7EB',
      formattedTime: '0min'
    });
  }

  // Calculate achievements based on real progress
  const calculateAchievements = () => {
    const aiQuizzes = userProgress.quizScores.filter(q => q.isAIGenerated).length;
    const aiMaterials = userProgress.aiMaterialsGenerated.filter(m => m.type === 'study_material').length;
    const perfectScores = userProgress.quizScores.filter(q => q.score === q.totalQuestions).length;
    
    return [
      { 
        title: 'Week Warrior', 
        description: '7-day learning streak', 
        icon: '🔥', 
        earned: userProgress.currentStreak >= 7 
      },
      { 
        title: 'Quiz Master', 
        description: '5 perfect quiz scores', 
        icon: '🎯', 
        earned: perfectScores >= 5 
      },
      { 
        title: 'AI Explorer', 
        description: 'Used AI quiz generation 3 times', 
        icon: '🤖', 
        earned: aiQuizzes >= 3 
      },
      { 
        title: 'Study Creator', 
        description: 'Generated 5 AI study materials', 
        icon: '📚', 
        earned: aiMaterials >= 5 
      },
      { 
        title: 'Subject Expert', 
        description: 'Complete 80% of a subject', 
        icon: '🎓', 
        earned: userProgress.subjects.some(s => (s.progress || 0) >= 80) 
      },
      { 
        title: 'Consistent Learner', 
        description: '30-day streak', 
        icon: '📖', 
        earned: userProgress.currentStreak >= 30 
      }
    ];
  };

  const achievements = calculateAchievements();
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const totalWeeklyHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);

  const totalQuizzesTaken = userProgress.quizScores.length;
  const averageQuizScore = totalQuizzesTaken > 0 
    ? Math.round(userProgress.quizScores.reduce((sum, quiz) => sum + (quiz.score / quiz.totalQuestions * 100), 0) / totalQuizzesTaken)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">{totalWeeklyHours.toFixed(1)}</div>
                <p className="text-sm text-blue-600">Hours studied</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Quiz Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900">{averageQuizScore}%</div>
                <p className="text-sm text-green-600">Quiz performance</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900">{totalQuizzesTaken}</div>
                <p className="text-sm text-purple-600">Total completed</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">{earnedAchievements}/{achievements.length}</div>
                <p className="text-sm text-orange-600">Unlocked</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Weekly Learning Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatHoursShort(value), 'Study Time']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 6, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Study Time by Subject</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="hours"
                  label={({ subject, formattedTime }) => `${subject}: ${formattedTime}`}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatHoursMinutes(value), 'Study Time']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Performance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Average Score']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalQuizzesTaken}</div>
                  <div className="text-sm text-blue-600">Total Quizzes</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{averageQuizScore}%</div>
                  <div className="text-sm text-green-600">Average Score</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userProgress.quizScores.length > 0 ? (
                  userProgress.quizScores.slice(-5).reverse().map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{quiz.subject}</div>
                        <div className="text-xs text-gray-600">
                          {Math.round((quiz.score / quiz.totalQuestions) * 100)}% ({quiz.score}/{quiz.totalQuestions})
                        </div>
                      </div>
                      <Badge variant={quiz.score === quiz.totalQuestions ? 'default' : 'secondary'}>
                        {quiz.score === quiz.totalQuestions ? '🏆 Perfect' : '📊 Score'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No quizzes taken yet. Start with a quiz to see your results here!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                achievement.earned ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${achievement.earned ? 'text-yellow-800' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    {achievement.earned && <Badge className="bg-yellow-600">Earned</Badge>}
                  </div>
                  <p className={`text-sm ${achievement.earned ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
