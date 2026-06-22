import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout'; // Khung layout chung cho app
import Dashboard from './pages/DashboardSection';
import FlashcardsPage from './pages/Flashcards';
import VocabularyTopicsPage from './pages/Vocabulary';
import VocabNotebookPage from './pages/VocabNotebook';
import { useAppStore } from './store/useAppStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Routes>
      {/* ================= ROUTES CÔNG KHAI (Không cần đăng nhập) ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= ROUTES ĐƯỢC BẢO VỆ (Phải đăng nhập) ================= */}
      {/* 2. Bọc toàn bộ AppLayout và các trang con bên trong ProtectedRoute */}
      <Route element={<ProtectedRoute />}>

        {/* Tất cả các trang nằm dưới AppLayout đều sẽ được bảo vệ */}
        <Route path="/" element={<AppLayout />}>

          {/* Trang chính Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Trang chính roadmap*/}
          <Route
            path="roadmap"
            element={<div className="text-foreground p-4">Trang Lộ trình học tập (Đang phát triển)</div>}
          />
          {/* Route cho trang vocabulary */}
          <Route path="vocabulary" element={<VocabularyTopicsPage />} />

          {/* Route cho trang grammar */}
          <Route
            path="grammar"
            element={<div className="text-foreground p-4">Trang Ngữ pháp (Đang phát triển)</div>}
          />

          {/* Route cho trang speaking */}
          <Route
            path="speaking"
            element={<div className="text-foreground p-4">Trang Luyện nói (Đang phát triển)</div>}
          />

          {/* Route cho trang conversation */}
          <Route
            path="conversation"
            element={<div className="text-foreground p-4">Trang Hội thoại (Đang phát triển)</div>}
          />

          {/* Route cho trang flashcards */}
          <Route path="flashcards" element={<FlashcardsPage />} />

          {/* Route cho trang vocab notebook */}
          <Route
            path="vocab-notebook"
            element={<VocabNotebookPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}
