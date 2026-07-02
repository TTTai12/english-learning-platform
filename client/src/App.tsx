import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout'; // Khung layout chung cho app
import Dashboard from './pages/DashboardSection';
import FlashcardsPage from './pages/Flashcards';
import VocabularyTopicsPage from './pages/Vocabulary';
import VocabNotebookPage from './pages/VocabNotebook';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import GrammarPage from './pages/Grammar';
import SpeakingPage from './pages/Speaking';


export default function App() {
  const theme = useAppStore((state) => state.theme);
  const getMe = useAuthStore((state) => state.getMe);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Khôi phục phiên đăng nhập từ token trong localStorage khi mở web
  useEffect(() => {
    getMe();
  }, [getMe]);

  return (
    <Routes>
      {/* 1. Routes công khai có Sidebar (Ai cũng xem được) */}
      <Route element={<AppLayout />}>
        {/* Trang chính Dashboard */}
        <Route index element={<Dashboard />} />
        {/* Route cho trang flashcards */}
        <Route path="flashcards" element={<FlashcardsPage />} />
        {/* 2. Routes được bảo vệ (Phải đăng nhập mới được học) */}
        <Route element={<ProtectedRoute />}>
          {/* Trang chính roadmap*/}
          <Route
            path="roadmap"
            element={<div className="text-foreground p-4">Trang Lộ trình học tập (Đang phát triển)</div>}
          />
          {/* Route cho trang vocabulary */}
          <Route path="vocabulary" element={<VocabularyTopicsPage />} />

          {/* Route cho trang grammar */}
          <Route path="grammar" element={<GrammarPage />} />


          {/* Route cho trang speaking */}
          <Route path="speaking" element={<SpeakingPage />} />

          {/* Route cho trang conversation */}
          <Route
            path="conversation"
            element={<div className="text-foreground p-4">Trang Hội thoại (Đang phát triển)</div>}
          />

          {/* Route cho trang vocab notebook */}
          <Route
            path="vocab-notebook"
            element={<VocabNotebookPage />}
          />
        </Route>
      </Route>

      {/* 3. Routes công khai không có Sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
