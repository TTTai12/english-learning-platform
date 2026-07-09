import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedWord } from '../types';

// Định nghĩa kiểu dữ liệu của store
interface AppState {
    xp: number;
    streak: number;
    savedWords: SavedWord[];
    theme: 'light' | 'dark';

    // Actions
    addXP: (amount: number) => void;
    saveWord: (word: Omit<SavedWord, 'id' | 'savedAt' | 'reviewCount' | 'nextReview'>) => void;
    removeWord: (id: string) => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            xp: 0,
            streak: 1,
            savedWords: [],
            theme: 'light',

            addXP: (amount) =>
                set((state) => ({ xp: state.xp + amount })),

            saveWord: (word) => {
                const now = new Date();
                const nextReview = new Date(now);
                nextReview.setDate(now.getDate() + 1);

                set((state) => {
                    // TODO 1: Kiểm tra nếu từ đã tồn tại trong state.savedWords (cùng english) thì return giữ nguyên state
                    const isExit = state.savedWords.some((w) => w.english === word.english)
                    if (isExit) return state;
                    // TODO 2: Nếu chưa tồn tại, return mảng savedWords mới có chứa từ vựng được clone kèm theo id (dùng crypto.randomUUID()), savedAt, reviewCount: 0, nextReview
                    const newWord: SavedWord = {
                        ...word,
                        id: crypto.randomUUID(),
                        savedAt: now,
                        reviewCount: 0,
                        nextReview,
                    }
                    return {
                        savedWords: [...state.savedWords, newWord]
                    };
                });
            },

            removeWord: (id) =>
                set((state) => ({
                    // TODO 3: Filter loại bỏ word có id trùng khớp ra khỏi savedWords
                    savedWords: state.savedWords.filter((savedWord) => savedWord.id !== id),
                })),

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'dark' ? 'light' : 'dark',
                })),
        }),
        {
            name: 'english-ai-storage', // Tên key lưu trong localStorage
        }
    )
);
