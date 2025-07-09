
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const demoAccounts = [
  {
    id: '1',
    name: 'Vijay Kumar',
    email: 'vijay@example.com',
    password: 'demo123',
    avatar: '🧑‍💼',
    progress: {
      totalXP: 1250,
      currentStreak: 12,
      completedLessons: 35,
      weeklyCompleted: 7,
      subjects: [
        { name: 'Mathematics', progress: 75, lessonsCompleted: 15, totalLessons: 20 },
        { name: 'Science', progress: 60, lessonsCompleted: 12, totalLessons: 20 },
        { name: 'History', progress: 85, lessonsCompleted: 17, totalLessons: 20 },
        { name: 'Literature', progress: 45, lessonsCompleted: 9, totalLessons: 20 }
      ],
      quizScores: [
        { subject: 'Mathematics', score: 8, totalQuestions: 10, date: new Date('2024-01-15') },
        { subject: 'Science', score: 7, totalQuestions: 10, date: new Date('2024-01-14') },
        { subject: 'History', score: 9, totalQuestions: 10, date: new Date('2024-01-13') }
      ],
      dailyActivity: [
        { date: '2024-01-15', hoursStudied: 2.5, xpEarned: 150, lessonsCompleted: 3 },
        { date: '2024-01-14', hoursStudied: 1.8, xpEarned: 120, lessonsCompleted: 2 },
        { date: '2024-01-13', hoursStudied: 3.2, xpEarned: 200, lessonsCompleted: 4 }
      ]
    }
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'demo123',
    avatar: '👩‍🎓',
    progress: {
      totalXP: 2100,
      currentStreak: 25,
      completedLessons: 68,
      weeklyCompleted: 5,
      subjects: [
        { name: 'Mathematics', progress: 90, lessonsCompleted: 18, totalLessons: 20 },
        { name: 'Science', progress: 95, lessonsCompleted: 19, totalLessons: 20 },
        { name: 'History', progress: 70, lessonsCompleted: 14, totalLessons: 20 },
        { name: 'Literature', progress: 80, lessonsCompleted: 16, totalLessons: 20 }
      ],
      quizScores: [
        { subject: 'Mathematics', score: 10, totalQuestions: 10, date: new Date('2024-01-15') },
        { subject: 'Science', score: 9, totalQuestions: 10, date: new Date('2024-01-14') },
        { subject: 'Literature', score: 8, totalQuestions: 10, date: new Date('2024-01-12') }
      ],
      dailyActivity: [
        { date: '2024-01-15', hoursStudied: 3.0, xpEarned: 180, lessonsCompleted: 2 },
        { date: '2024-01-14', hoursStudied: 2.2, xpEarned: 140, lessonsCompleted: 3 },
        { date: '2024-01-13', hoursStudied: 2.8, xpEarned: 170, lessonsCompleted: 2 }
      ]
    }
  },
  {
    id: '3',
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    password: 'demo123',
    avatar: '👨‍🔬',
    progress: {
      totalXP: 850,
      currentStreak: 5,
      completedLessons: 22,
      weeklyCompleted: 3,
      subjects: [
        { name: 'Mathematics', progress: 40, lessonsCompleted: 8, totalLessons: 20 },
        { name: 'Science', progress: 55, lessonsCompleted: 11, totalLessons: 20 },
        { name: 'History', progress: 25, lessonsCompleted: 5, totalLessons: 20 },
        { name: 'Literature', progress: 30, lessonsCompleted: 6, totalLessons: 20 }
      ],
      quizScores: [
        { subject: 'Science', score: 6, totalQuestions: 10, date: new Date('2024-01-14') },
        { subject: 'Mathematics', score: 5, totalQuestions: 10, date: new Date('2024-01-13') }
      ],
      dailyActivity: [
        { date: '2024-01-15', hoursStudied: 1.5, xpEarned: 90, lessonsCompleted: 1 },
        { date: '2024-01-14', hoursStudied: 1.2, xpEarned: 70, lessonsCompleted: 2 },
        { date: '2024-01-13', hoursStudied: 2.0, xpEarned: 110, lessonsCompleted: 2 }
      ]
    }
  }
];

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('current_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const account = demoAccounts.find(acc => acc.email === email && acc.password === password);
    if (account) {
      const userData = {
        id: account.id,
        name: account.name,
        email: account.email,
        avatar: account.avatar
      };
      setUser(userData);
      
      // Set user progress in analytics
      localStorage.setItem('user_analytics', JSON.stringify({
        ...account.progress,
        lastActiveDate: new Date().toDateString()
      }));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_analytics');
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};

export const getDemoAccounts = () => demoAccounts.map(acc => ({
  name: acc.name,
  email: acc.email,
  password: acc.password
}));
