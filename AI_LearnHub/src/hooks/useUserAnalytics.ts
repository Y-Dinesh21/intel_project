import { useState, useEffect } from 'react';

interface UserActivity {
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
  dailyActivity: Array<{
    date: string;
    hoursStudied: number;
    xpEarned: number;
    lessonsCompleted: number;
  }>;
  aiMaterialsGenerated: Array<{
    subject: string;
    topic: string;
    date: Date;
    type: 'study_material' | 'quiz' | 'tutor_session';
    performance?: number;
  }>;
  aiFeatureUsage: {
    tutorSessions: number;
    materialsGenerated: number;
    quizzesGenerated: number;
    totalInteractions: number;
  };
  pathProgress: Array<{
    pathId: string;
    subject: string;
    completedLessons: string[];
    totalLessons: number;
    lastUpdated: Date;
  }>;
  lastActiveDate: string;
  weekStartDate: string;
}

const STORAGE_KEY = 'user_analytics';

export const useUserAnalytics = () => {
  const [userActivity, setUserActivity] = useState<UserActivity>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        quizScores: parsed.quizScores?.map((score: any) => ({
          ...score,
          date: new Date(score.date)
        })) || [],
        aiMaterialsGenerated: parsed.aiMaterialsGenerated?.map((material: any) => ({
          ...material,
          date: new Date(material.date)
        })) || [],
        pathProgress: parsed.pathProgress?.map((path: any) => ({
          ...path,
          lastUpdated: new Date(path.lastUpdated)
        })) || [],
        dailyActivity: parsed.dailyActivity || [],
        aiFeatureUsage: parsed.aiFeatureUsage || {
          tutorSessions: 0,
          materialsGenerated: 0,
          quizzesGenerated: 0,
          totalInteractions: 0
        },
        weekStartDate: parsed.weekStartDate || getWeekStart()
      };
    }
    
    return {
      totalXP: 0,
      currentStreak: 0,
      completedLessons: 0,
      totalLessons: 100,
      currentLevel: 'Beginner',
      weeklyGoal: 5,
      weeklyCompleted: 0,
      subjects: [
        { name: 'Mathematics', progress: 0, color: '#3B82F6', icon: '📊', lessonsCompleted: 0, totalLessons: 25 },
        { name: 'Science', progress: 0, color: '#10B981', icon: '🔬', lessonsCompleted: 0, totalLessons: 25 },
        { name: 'History', progress: 0, color: '#8B5CF6', icon: '📚', lessonsCompleted: 0, totalLessons: 25 },
        { name: 'Literature', progress: 0, color: '#EC4899', icon: '📖', lessonsCompleted: 0, totalLessons: 25 }
      ],
      quizScores: [],
      dailyActivity: [],
      aiMaterialsGenerated: [],
      aiFeatureUsage: {
        tutorSessions: 0,
        materialsGenerated: 0,
        quizzesGenerated: 0,
        totalInteractions: 0
      },
      pathProgress: [],
      lastActiveDate: new Date().toDateString(),
      weekStartDate: getWeekStart()
    };
  });

  // Helper function to get the start of the current week (Monday)
  function getWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toDateString();
  }

  // Helper function to check if we need to reset weekly progress
  const checkWeeklyReset = () => {
    const currentWeekStart = getWeekStart();
    if (userActivity.weekStartDate !== currentWeekStart) {
      setUserActivity(prev => ({
        ...prev,
        weeklyCompleted: 0,
        weekStartDate: currentWeekStart
      }));
      return true;
    }
    return false;
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userActivity));
  }, [userActivity]);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActive = new Date(userActivity.lastActiveDate).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastActive === today) {
      return;
    }
    
    let newStreak = userActivity.currentStreak;
    if (lastActive === yesterday) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }
    
    setUserActivity(prev => ({
      ...prev,
      currentStreak: newStreak,
      lastActiveDate: today
    }));
  };

  const addQuizScore = (subject: string, score: number, totalQuestions: number, isAIGenerated: boolean = false) => {
    const xpEarned = score * 10;
    const today = new Date().toDateString();
    
    setUserActivity(prev => {
      checkWeeklyReset();
      
      const newQuizScores = [...prev.quizScores, {
        subject,
        score,
        totalQuestions,
        date: new Date(),
        isAIGenerated
      }];
      
      const todayActivity = prev.dailyActivity.find(day => day.date === today);
      const updatedDailyActivity = todayActivity 
        ? prev.dailyActivity.map(day => 
            day.date === today 
              ? { ...day, xpEarned: day.xpEarned + xpEarned }
              : day
          )
        : [...prev.dailyActivity, {
            date: today,
            hoursStudied: 0.5,
            xpEarned,
            lessonsCompleted: 0
          }];

      const updatedAIUsage = isAIGenerated ? {
        ...prev.aiFeatureUsage,
        quizzesGenerated: prev.aiFeatureUsage.quizzesGenerated + 1,
        totalInteractions: prev.aiFeatureUsage.totalInteractions + 1
      } : prev.aiFeatureUsage;
      
      return {
        ...prev,
        totalXP: prev.totalXP + xpEarned,
        quizScores: newQuizScores,
        dailyActivity: updatedDailyActivity,
        aiFeatureUsage: updatedAIUsage
      };
    });
    
    updateStreak();
  };

  const addAIMaterial = (subject: string, topic: string, type: 'study_material' | 'quiz' | 'tutor_session', performance?: number) => {
    setUserActivity(prev => {
      const updatedAIUsage = {
        ...prev.aiFeatureUsage,
        totalInteractions: prev.aiFeatureUsage.totalInteractions + 1
      };

      if (type === 'study_material') {
        updatedAIUsage.materialsGenerated += 1;
      } else if (type === 'tutor_session') {
        updatedAIUsage.tutorSessions += 1;
      }

      return {
        ...prev,
        aiMaterialsGenerated: [...prev.aiMaterialsGenerated, {
          subject,
          topic,
          date: new Date(),
          type,
          performance
        }],
        aiFeatureUsage: updatedAIUsage
      };
    });
  };

  const addStudySession = (subject: string, duration: number) => {
    const today = new Date().toDateString();
    const xpEarned = Math.floor(duration * 20); // 20 XP per hour
    
    setUserActivity(prev => {
      const todayActivity = prev.dailyActivity.find(day => day.date === today);
      const updatedDailyActivity = todayActivity 
        ? prev.dailyActivity.map(day => 
            day.date === today 
              ? { 
                  ...day, 
                  hoursStudied: day.hoursStudied + duration,
                  xpEarned: day.xpEarned + xpEarned
                }
              : day
          )
        : [...prev.dailyActivity, {
            date: today,
            hoursStudied: duration,
            xpEarned,
            lessonsCompleted: 0
          }];
      
      return {
        ...prev,
        totalXP: prev.totalXP + xpEarned,
        dailyActivity: updatedDailyActivity
      };
    });
    
    updateStreak();
  };

  const completeLesson = (pathId: string, lessonId: string) => {
    const xpEarned = 25;
    const today = new Date().toDateString();
    
    setUserActivity(prev => {
      // Check if we need to reset weekly progress
      const currentWeekStart = getWeekStart();
      const shouldResetWeekly = prev.weekStartDate !== currentWeekStart;
      
      // Update path progress
      const existingPathIndex = prev.pathProgress.findIndex(p => p.pathId === pathId);
      let updatedPathProgress = [...prev.pathProgress];
      
      if (existingPathIndex >= 0) {
        updatedPathProgress[existingPathIndex] = {
          ...updatedPathProgress[existingPathIndex],
          completedLessons: [...updatedPathProgress[existingPathIndex].completedLessons, lessonId],
          lastUpdated: new Date()
        };
      } else {
        // Determine subject based on pathId
        let subject = 'General';
        if (pathId.includes('mathematics')) subject = 'Mathematics';
        else if (pathId.includes('science')) subject = 'Science';
        else if (pathId.includes('history')) subject = 'History';
        
        updatedPathProgress.push({
          pathId,
          subject,
          completedLessons: [lessonId],
          totalLessons: 12, // Default, should be dynamic
          lastUpdated: new Date()
        });
      }

      // Update subject progress based on path completion
      const updatedSubjects = prev.subjects.map(subject => {
        const pathsForSubject = updatedPathProgress.filter(p => p.subject === subject.name);
        const totalCompleted = pathsForSubject.reduce((sum, path) => sum + path.completedLessons.length, 0);
        const newProgress = Math.min(100, (totalCompleted / subject.totalLessons) * 100);
        
        return {
          ...subject,
          lessonsCompleted: totalCompleted,
          progress: newProgress
        };
      });
      
      const todayActivity = prev.dailyActivity.find(day => day.date === today);
      const updatedDailyActivity = todayActivity 
        ? prev.dailyActivity.map(day => 
            day.date === today 
              ? { 
                  ...day, 
                  xpEarned: day.xpEarned + xpEarned,
                  lessonsCompleted: day.lessonsCompleted + 1,
                  hoursStudied: day.hoursStudied + 0.5
                }
              : day
          )
        : [...prev.dailyActivity, {
            date: today,
            hoursStudied: 0.5,
            xpEarned,
            lessonsCompleted: 1
          }];
      
      const newCompletedLessons = prev.completedLessons + 1;
      const currentWeeklyCompleted = shouldResetWeekly ? 0 : prev.weeklyCompleted;
      const newWeeklyCompleted = Math.min(prev.weeklyGoal, currentWeeklyCompleted + 1);
      
      let newLevel = 'Beginner';
      const newTotalXP = prev.totalXP + xpEarned;
      if (newTotalXP >= 2000) newLevel = 'Expert';
      else if (newTotalXP >= 1000) newLevel = 'Advanced';
      else if (newTotalXP >= 500) newLevel = 'Intermediate';
      
      return {
        ...prev,
        totalXP: newTotalXP,
        completedLessons: newCompletedLessons,
        weeklyCompleted: newWeeklyCompleted,
        weekStartDate: currentWeekStart,
        currentLevel: newLevel,
        subjects: updatedSubjects,
        pathProgress: updatedPathProgress,
        dailyActivity: updatedDailyActivity
      };
    });
    
    updateStreak();
  };

  // Generate weekly data based on real user activity
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayActivity = userActivity.dailyActivity.find(activity => 
        new Date(activity.date).toDateString() === dateStr
      );
      
      weekData.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        hours: dayActivity?.hoursStudied || 0,
        xp: dayActivity?.xpEarned || 0
      });
    }
    
    return weekData;
  };

  // Generate performance trend based on quiz scores
  const getPerformanceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const performanceData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = months[date.getMonth()];
      
      const monthlyQuizzes = userActivity.quizScores.filter(quiz => {
        const quizDate = new Date(quiz.date);
        return quizDate.getMonth() === date.getMonth() && 
               quizDate.getFullYear() === date.getFullYear();
      });
      
      const averageScore = monthlyQuizzes.length > 0 
        ? monthlyQuizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.totalQuestions * 100), 0) / monthlyQuizzes.length
        : 0;
      
      performanceData.push({
        month: monthStr,
        score: Math.round(averageScore)
      });
    }
    
    return performanceData;
  };

  return {
    userActivity,
    addQuizScore,
    addAIMaterial,
    addStudySession,
    completeLesson,
    updateStreak,
    getWeeklyData,
    getPerformanceData
  };
};
