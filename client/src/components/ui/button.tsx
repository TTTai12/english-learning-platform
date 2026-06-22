import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    children: React.ReactNode;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
    const variantStyles = {
        // 1. Primary: Nền màu chủ đạo, chữ trắng, hover mờ/sáng hơn
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',

        // 2. Outline: Viền nét đứt/nhạt, nền trong suốt, hover có nền nhẹ
        outline: 'border border-border bg-transparent text-foreground hover:bg-muted',

        // 3. Ghost: Trong suốt hoàn toàn, không viền, hover đổi nền nhẹ
        ghost: 'bg-transparent text-foreground hover:bg-muted',
    };

    return (
        <button
            className={cn(
                // Base styles dùng chung cho tất cả variant
                'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                variantStyles[variant],
                className // Cho phép override từ bên ngoài
            )}
            {...props}
        >
            {children}
        </button>
    );
}
