import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { fetchBookmarkedWords, fetchWeeklyActivity } from '../services/vocab';
import { ProgressChart } from '../components/features/dashboard/ProgressChart';
import { weeklyData, quickActions } from '../constants/dashboard';
import { Flame, Star, BookOpen, TrendingUp, Target, Award, ChevronRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    getMe();
  }, [getMe]);

  const { data: bookmarkedWords = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarkedWords,
  });

  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['weekly-activity'],
    queryFn: fetchWeeklyActivity,
  });

  const chartData = weeklyActivity.length > 0 ? weeklyActivity : weeklyData;

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const savedWordsCount = bookmarkedWords.length;

  const level = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp - (level - 1) * 500;
  const xpPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 500) * 100)));
  const xpToNextLevel = (level * 500) - xp;

  const achievements = [
    { icon: '🔥', label: '7 ngày liên tục', earned: streak >= 7 },
    { icon: '📚', label: '100 từ thuộc', earned: savedWordsCount >= 100 },
    { icon: '🗣️', label: 'Nói lưu loát', earned: xp >= 1000 },
    { icon: '🏆', label: 'Hoàn thành 10 bài', earned: savedWordsCount >= 10 }
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-32 w-32 h-32 bg-white/5 rounded-full translate-y-10" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm mb-1">{greeting} 👋</p>
          <h2 className="text-white text-2xl font-bold mb-1">Sẵn sàng học hôm nay?</h2>
          <p className="text-indigo-100 text-sm mb-4">Bạn đang ở chuỗi <strong className="font-semibold">{streak} ngày</strong> liên tục. Tuyệt vời!</p>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-2 bg-white text-indigo-950 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors text-sm font-semibold shadow-sm"
          >
            <Zap className="w-4 h-4 fill-current" />
            Tiếp tục học
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Streak', value: `${streak} ngày`, iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500' },
          { icon: Star, label: 'Tổng XP', value: `${xp} XP`, iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-500' },
          { icon: Target, label: 'Cấp độ', value: `Level ${level}`, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
          { icon: BookOpen, label: 'Đã lưu', value: `${savedWordsCount} từ`, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-xs">
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
                <p className="text-foreground text-base font-semibold tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-foreground text-sm font-semibold">Tiến độ cấp độ</h3>
          </div>
          <span className="text-muted-foreground text-xs">{xpToNextLevel} XP để lên Level {level + 1}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Level {level}</span>
          <span className="text-primary font-medium">{xpInCurrentLevel}/500 XP</span>
          <span>Level {level + 1}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart data={chartData} />

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="text-foreground text-sm font-semibold">Huy hiệu</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  a.earned ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-40'
                }`}
              >
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-foreground text-xs font-semibold">{a.label}</p>
                  <p className="text-muted-foreground text-[10px]">{a.earned ? 'Đã đạt được' : 'Chưa mở khóa'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-foreground text-sm font-semibold mb-3">Bắt đầu nhanh</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className={`${action.color} border rounded-xl p-4 text-left hover:shadow-sm transition-all group hover:-translate-y-0.5 flex flex-col h-full`}
              >
                <Icon className={`w-5 h-5 ${action.iconColor} mb-2`} />
                <p className="text-foreground text-sm font-semibold leading-tight">{action.label}</p>
                <p className="text-muted-foreground text-[11px] mt-1 flex-1">{action.desc}</p>
                <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}