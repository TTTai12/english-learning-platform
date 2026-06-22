import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm cn giúp gộp các class Tailwind và tự động xóa bỏ class xung đột
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}