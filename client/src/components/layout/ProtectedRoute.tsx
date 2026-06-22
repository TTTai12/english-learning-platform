import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProtectedRoute() {
    // TODO 1: Lấy isAuthenticated từ useAuthStore
    const { isAuthenticated } = useAuthStore();
    // TODO 2: Nếu chưa đăng nhập → Navigate về "/login"
    //         Nếu đã đăng nhập   → Outlet
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    return <Outlet />
}
