import { cn } from '../../lib/utils';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}
export function Input({ className, ...props }: InputProps) {
    return (
        <input
            className={cn(
                // 1. Kích thước & Căn chỉnh
                "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground",

                // 2. Trạng thái Focus (Khi người dùng nhấp chuột vào ô nhập liệu)
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",

                // 3. Trạng thái Bị vô hiệu hóa (Disabled) & Hiệu ứng chuyển động (Transition)
                "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                className
            )}
            {...props}
        />
    );
}
