import { useState } from 'react';
import { NavLink } from 'react-router-dom'; // Đúng chuẩn stack
import {
  LayoutDashboard, Map, BookOpen, BookMarked,
  Mic, MessageSquare, Layers, BookHeart, Star, ChevronRight,
  Flame, Trophy, Sun, Moon, Menu, X, // Bổ sung các icon còn thiếu từ mẫu
  LogOut, LogIn
} from 'lucide-react';
import { cn } from '../../lib/utils'; // Giữ nguyên util xịn vừa tạo
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tổng quan', group: 'main' },
  { path: '/roadmap', icon: Map, label: 'Lộ trình học tập', group: 'main' },
  { path: '/vocabulary', icon: BookOpen, label: 'Từ vựng & Cụm từ', group: 'learn' },
  { path: '/grammar', icon: BookMarked, label: 'Mẫu câu theo Thì', group: 'learn' },
  { path: '/speaking', icon: Mic, label: 'Luyện nói với AI', group: 'learn' },
  { path: '/conversation', icon: MessageSquare, label: 'Hội thoại mô phỏng', group: 'learn' },
  { path: '/flashcards', icon: Layers, label: 'Flashcards AI', group: 'tools' },
  { path: '/vocab-notebook', icon: BookHeart, label: 'Sổ tay từ vựng', group: 'tools' },
];

const groups = [
  { id: 'main', label: null },
  { id: 'learn', label: 'HỌC TẬP' },
  { id: 'tools', label: 'CÔNG CỤ' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  // 2. Lấy các state gốc và actions từ Zustand Store
  const xp = useAppStore((state) => state.xp);
  const streak = useAppStore((state) => state.streak);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  // Zustand Auth Store state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  // 3. Tự tính toán các Derived State tại đây (Đồng bộ động từ AuthStore nếu đã Đăng nhập)
  const activeXp = isAuthenticated && user ? user.xp : xp;
  const activeStreak = isAuthenticated && user ? user.streak : streak;

  const level = Math.floor(activeXp / 500) + 1;
  const xpToNextLevel = (level * 500) - activeXp;
  const xpPercent = Math.min(100, Math.max(0, Math.round(((activeXp - (level - 1) * 500) / 500) * 100)));

  const badge = { label: 'Học viên', color: 'from-emerald-400 to-teal-500' };
  const darkMode = theme === 'dark';


  // Gom nội dung Sidebar vào một hàm để tái sử dụng cho cả Desktop và Mobile[cite: 2]
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card text-foreground w-[260px] min-h-screen">
      {/* 1. LOGO */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7c8ff6] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wide">EnglishAI</h1>
            <p className="text-slate-400 text-xs mt-0.5">Học thông minh hơn</p>
          </div>
        </div>
      </div>

      {/* 2. GAMIFICATION STATS (Bổ sung phần thiếu)[cite: 2] */}
      <div className="mx-3 mt-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent border border-primary/10 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-foreground text-sm font-semibold">{activeStreak} ngày</span>
          </div>
          <div className={cn("bg-gradient-to-r text-white px-2 py-0.5 rounded-full text-[10px] font-bold", badge.color)}>
            Lv.{level} {badge.label}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="text-muted-foreground">{activeXp} XP tổng</span>
            <span className="text-muted-foreground">còn {xpToNextLevel} XP → Lv.{level + 1}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION (Giữ nguyên phần xử lý NavLink thông minh của bạn)[cite: 1] */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {groups.map((group) => {
          const items = menuItems.filter((item) => item.group === group.id);
          return (
            <div key={group.id} className="mb-2">
              {group.label && (
                <p className="text-muted-foreground px-3 mb-1 text-[10px] font-bold tracking-wider">
                  {group.label}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative text-sm font-medium",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-foreground hover:bg-accent/80"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/50 rounded-r-full" />
                        )}
                        <Icon className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span>{item.label}</span>
                        {!isActive && (
                          <ChevronRight className="ml-auto w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* 4. BOTTOM MENU (Bổ sung phần thiếu)[cite: 2] */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50">
          <Trophy className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-foreground text-xs font-semibold">Huy chương: {Math.floor(xp / 200)}</p>
            <p className="text-muted-foreground text-[10px]">Học đều đặn mỗi ngày!</p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent/80 transition-all text-sm font-medium cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          <span>{darkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
        </button>

        {/* Khu vực thông tin Tài khoản / Đăng nhập */}
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-accent/40 mt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {user.email[0].toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-foreground text-xs font-semibold truncate leading-tight">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-muted-foreground text-[10px] truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
              }}
              title="Đăng xuất"
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all text-sm font-semibold mt-1"
          >
            <LogIn className="w-4 h-4 text-primary shrink-0" />
            <span>Đăng nhập</span>
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Nút bấm toggle menu trên Mobile[cite: 2] */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-card shadow-lg border border-border"
      >
        {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
      </button>

      {/* Giao diện Sidebar cố định trên Desktop[cite: 2] */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-screen bg-card border-r border-border shrink-0 w-[260px]">
        <SidebarContent />
      </aside>

      {/* Giao diện Sidebar dạng Overlay trượt ra trên Mobile[cite: 2] */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <aside className={cn(
          "absolute left-0 top-0 h-full bg-card border-r border-border transition-transform duration-300 w-[260px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}