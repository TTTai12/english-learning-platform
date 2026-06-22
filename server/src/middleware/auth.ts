import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';

// Mở rộng kiểu dữ liệu Request của Express để chứa thêm trường userId
export interface AuthRequest extends Request {
    userId?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // TODO 1: Lấy chuỗi Authorization từ req.headers
    const authHeader = req.headers.authorization;

    // TODO 2: Kiểm tra nếu authHeader trống HOẶC không bắt đầu bằng "Bearer "
    // -> trả về status 401 kèm message "Không tìm thấy token. Truy cập bị từ chối"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Không tìm thấy token. Truy cập bị từ chối" });
        return;
    }
    // TODO 3: Tách lấy chuỗi token gốc bằng cách dùng hàm .split(' ')[1]
    const token = authHeader.split(' ')[1];
    try {
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_english_ai_2026';

        // TODO 4: Giải mã token bằng hàm jsonwebtoken.verify(token, jwtSecret)
        const decoded = jsonwebtoken.verify(token, jwtSecret) as { userId: string };


        // TODO 5: Gán userId giải mã được vào request: req.userId = decoded.userId;
        req.userId = decoded.userId;

        if (!decoded.userId) {
            res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
            return;
        }
        // TODO 6: Gọi hàm next() để chuyển tiếp request sang controller tiếp theo
        next();
    } catch (error) {
        // Nếu token hết hạn hoặc sai chữ ký, hàm verify sẽ ném ra lỗi (throw error)
        res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        return;
    }
};
