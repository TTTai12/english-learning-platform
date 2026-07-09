import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js'; // Helper import prisma xịn của em

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // TODO 1: Kiểm tra nếu email hoặc password trống -> trả về status 400 kèm message lỗi
        if (!email || !password) {
            res.status(400).json({ message: "Email và password không được để trống" });
            return
        }
        // TODO 2: Sử dụng prisma để tìm xem đã có User nào đăng ký email này chưa
        const existingUser = await prisma.user.findUnique({ where: { email } });
        // TODO 3: Nếu đã tồn tại user -> trả về status 400 kèm message thông báo email đã tồn tại
        if (existingUser) {
            res.status(400).json({ message: "Email đã tồn tại" });
            return
        }
        // TODO 4: Tạo salt và băm (hash) mật khẩu của người dùng bằng bcryptjs
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt)
        // TODO 5: Lưu user mới vào database bằng prisma.user.create
        // Set streak mặc định là 7, xp mặc định là 0 như frontend
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                streak: 1,
                xp: 0
            }
        });


        // TODO 6: Ký mã token JWT với payload chứa userId, sử dụng JWT_SECRET lấy từ process.env (nếu không có thì fallback chuỗi bí mật ngẫu nhiên), token hết hạn sau '7d'
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_english_ai_2026';
        // TODO 7: Trả về status 210 (hoặc 201) kèm token và object user (id, email, streak, xp)

        const token = jsonwebtoken.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                streak: user.streak,
                xp: user.xp,
            },
        });
    } catch (error) {
        console.error('Lỗi khi Đăng ký:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// Hàm đăng nhập (login) 
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // TODO 1: Kiểm tra email và password có trống không (dùng lại logic em vừa học ở trên)
        if (!email || !password) {
            res.status(400).json({ message: "Email và password không được để trống" });
            return
        }
        // TODO 2: Tìm user trong database bằng prisma theo email
        const user = await prisma.user.findUnique({ where: { email } })
        // TODO 3: Nếu không tìm thấy user -> trả về status 400 kèm message báo lỗi bảo mật chung
        if (!user) {
            res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
            return
        }
        // TODO 4: Sử dụng bcryptjs.compare để so khớp mật khẩu người dùng gửi lên với user.password
        const isMatch = await bcryptjs.compare(password, user.password);
        // TODO 5: Nếu không khớp -> trả về status 400 kèm message báo lỗi bảo mật chung y hệt trên
        if (!isMatch) {
            res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
            return
        }
        // TODO 6: Ký mã token JWT y hệt như bên Register
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_english_ai_2026';

        // TODO 7: Trả về status 200 (res.json) kèm token và object user (id, email, streak, xp)
        const token = jsonwebtoken.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                streak: user.streak,
                xp: user.xp,
            },
        });
    } catch (error) {
        console.error('Lỗi khi Đăng nhập:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};

// Lấy thông tin tài khoản hiện hành
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Lấy userId đã được Middleware xác thực điền vào request trước đó
        const userId = (req as any).userId;

        // TODO 1: Sử dụng prisma.user.findUnique để tìm user theo id = userId
        // Nhớ dùng 'select' để chỉ lấy: id, email, streak, xp
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                streak: true,
                xp: true,
            }
        });


        // TODO 2: Nếu không tìm thấy user -> trả về status 404 với message "Không tìm thấy người dùng"
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        // TODO 3: Trả về status 200 (res.json) với object user vừa lấy được
        res.status(200).json({ user });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
    }
};
