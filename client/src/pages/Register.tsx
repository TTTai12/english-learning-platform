import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { UserPlus, Mail, Lock } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form reload trang
        const success = await register(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6" >
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tạo tài khoản</h1>
                    <p className="text-muted-foreground text-sm">
                        Đăng ký để bắt đầu luyện tiếng Anh nào
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Mật khẩu
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}
