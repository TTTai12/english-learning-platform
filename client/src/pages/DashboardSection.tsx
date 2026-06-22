import {
  Flame, Star, BookOpen, Mic, MessageSquare, Layers,
  TrendingUp, Target, Award, ChevronRight, Zap, Map
} from 'lucide-react';
// Import link từ React Router v7 thay vì dùng onClick đổi state cục bộ cũ
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppStore } from '../store/useAppStore'
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * PHẦN 1: MOCK DATA & CONSTANTS
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * MOCK DATA: Dữ liệu hoạt động tuần của user
 * Dùng để vẽ biểu đồ cột BarChart (ngày T2-CN)
 * - minutes: Tổng phút học trong ngày
 * - words: Số từ mới học trong ngày
 */
const weeklyData = [
  { day: 'T2', minutes: 25, words: 12 },
  { day: 'T3', minutes: 40, words: 20 },
  { day: 'T4', minutes: 15, words: 8 },
  { day: 'T5', minutes: 55, words: 28 },
  { day: 'T6', minutes: 35, words: 17 },
  { day: 'T7', minutes: 60, words: 32 },
  { day: 'CN', minutes: 30, words: 15 },
];

/**
 * MOCK DATA: 5 nút "Bắt đầu nhanh" để điều hướng tới các trang chính
 * - Mỗi action có: path (URL), icon component, label, description, colors
 * - Dùng Link component từ React Router để navigation
 */
const quickActions = [
  { path: '/roadmap', icon: Map, label: 'Lộ trình', desc: 'Xem định hướng học tập', color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  { path: '/vocabulary', icon: BookOpen, label: 'Từ vựng', desc: 'Học từ mới hôm nay', color: 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100/50 dark:border-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  { path: '/speaking', icon: Mic, label: 'Luyện nói', desc: 'Cải thiện phát âm', color: 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100/50 dark:border-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { path: '/conversation', icon: MessageSquare, label: 'Hội thoại', desc: 'Chat với AI', color: 'bg-violet-50/50 dark:bg-violet-900/20 border-violet-100/50 dark:border-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
  { path: '/flashcards', icon: Layers, label: 'Flashcards', desc: 'Ôn tập nhanh', color: 'bg-amber-50/50 dark:bg-amber-900/20 border-amber-100/50 dark:border-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
];

/**
 * MOCK DATA: Danh sách huy hiệu/achievements
 * - earned: đã đạt được hay chưa
 * - Dùng để hiển thị trạng thái (màu sắc khác, opacity)
 */


/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENT: DashboardSection - Trang Dashboard chính
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * LAYOUT:
 * 1. Hero Banner - "Sẵn sàng học hôm nay?"
 * 2. Stats Row (2-4 cột) - Streak, XP, Level, Saved Words
 * 3. Level Progress Bar
 * 4. Grid 2 cột (md) - Chart + Achievements
 * 5. Quick Actions Grid (5 cột) - Điều hướng nhanh
 */
export default function Dashboard() {
  // 1. Lấy dữ liệu từ Zustand store
  const xp = useAppStore((state) => state.xp);
  const streak = useAppStore((state) => state.streak);
  const savedWords = useAppStore((state) => state.savedWords);
  const savedWordsCount = savedWords.length;
  const level = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp - (level - 1) * 500;
  const xpPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / 500) * 100)));
  // 2. Tính toán derived state tại chỗ
  const xpToNextLevel = (level * 500) - xp;
  const achievements = [
    { icon: '🔥', label: '7 ngày liên tục', earned: streak >= 7 },
    { icon: '📚', label: '100 từ thuộc', earned: savedWordsCount >= 100 },
    { icon: '🗣️', label: 'Nói lưu loát', earned: xp >= 1000 },
    { icon: '🏆', label: 'Hoàn thành 10 bài', earned: savedWordsCount >= 10 },
  ];

  // Tính greeting dựa vào thời gian hiện tại
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="space-y-6">

      {/**
        * ════ SECTION 1: HERO BANNER ════
        * - Gradient background: primary → indigo-600 → purple-700
        * - Có 2 decorative circles mờ (background)
        * - Hiển thị greeting + streak counter + button "Tiếp tục học"
        */}
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

      {/**
        * ════ SECTION 2: STATS ROW ════
        * 4 thẻ thống kê (Streak, XP, Level, Saved Words)
        * Responsive: 2 cột (mobile) → 4 cột (desktop)
        * Mỗi card có: icon + label + value
        */}
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

      {/**
        * ════ SECTION 3: LEVEL PROGRESS BAR ════
        * Progress bar để track tiến độ lên level tiếp theo
        * Hiển thị: XP hiện tại / 500 XP
        * Gradient bar từ primary → purple-500
        */}
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

      {/**
        * ════ SECTION 4: GRID (Chart + Achievements) ════
        * Responsive: 1 cột (mobile) → 2 cột (desktop)
        * 
        * LEFT SIDE: BarChart hoạt động tuần
        *   - X-axis: Các ngày trong tuần (T2-CN)
        *   - Y-axis: Số phút (độ cao cột)
        *   - 2 data series: phút học (blue) + từ mới (green)
        * 
        * RIGHT SIDE: Achievements Grid 2x2
        *   - Huy hiệu đã đạt: màu sắc đầy đủ
        *   - Huy hiệu chưa mở: mờ (opacity-40)
        */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: BarChart Component */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-foreground text-sm font-semibold">Hoạt động tuần này</h3>
          </div>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)'
                  }}
                  formatter={(value: any, name: any) => {
                    const display = Array.isArray(value) ? value.join(', ') : (value ?? '-')
                    return [
                      name === 'minutes' ? `${display} phút` : `${display} từ`,
                      name === 'minutes' ? 'Thời gian' : 'Từ mới'
                    ]
                  }}
                />
                <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="words" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-xs bg-primary" />
              <span>Phút học</span>
            </div>
            <div className="flex items-center gap-1.5">z
              <div className="w-3 h-2 rounded-xs bg-emerald-500" />
              <span>Từ mới</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Achievements Grid */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="text-foreground text-sm font-semibold">Huy hiệu</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${a.earned
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-border bg-muted/30 opacity-40'
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

      {/**
        * ════ SECTION 5: QUICK ACTIONS ════
        * 5 nút dẫn tới các trang chính
        * Responsive: 2 cột (sm) → 5 cột (lg)
        * 
        * Mỗi card có:
        * - Icon + Label (tên trang)
        * - Description (gợi ý)
        * - ChevronRight icon (ẩn, hiện khi hover)
        * - Click → Navigate đến trang tương ứng
        */}
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
                <ChevronRight className={`w-3 h-3 ${action.iconColor} mt-2 opacity-0 group-hover:opacity-100 transition-opacity self-end`} />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}