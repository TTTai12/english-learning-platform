import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Lightbulb, X, Volume2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

// Định nghĩa kiểu dữ liệu cho một Tình huống
interface Scenario {
    id: string;
    title: string;
    description: string;
    difficulty: 'Dễ' | 'Trung bình' | 'Khó';
    icon: string;
    systemInstruction: string;
    firstMessage: string;
}

// Định nghĩa kiểu dữ liệu cho một Tin nhắn trong phòng chat
interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    translation?: string; // Dành riêng cho AI dịch sang tiếng Việt
}

// Danh sách các tình huống mô phỏng theo Figma
const scenarios: Scenario[] = [
    {
        id: 'restaurant',
        title: 'Đặt món tại nhà hàng',
        description: 'Luyện tập giao tiếp khi đi ăn',
        difficulty: 'Dễ',
        icon: '🍽️',
        systemInstruction: "You are a friendly waiter at a restaurant. Ask the user what they want to order. Keep your responses short (under 2 sentences) and simple. Check if they make any grammar mistakes and correct them nicely inside brackets like '[Correction: ...]'. At the very end of your response, always provide a line starting with 'vn: ' followed by the Vietnamese translation.",
        firstMessage: "Good evening! Welcome to La Bella Italia. Do you have a reservation, or would you like a table for walk-in guests?\nvn: Chào buổi tối! Chào mừng đến La Bella Italia. Bạn có đặt bàn trước, hay muốn ngồi ngay?"
    },
    {
        id: 'shopping',
        title: 'Mua sắm',
        description: 'Hỏi giá, thử đồ, thanh toán',
        difficulty: 'Dễ',
        icon: '🛍️',
        systemInstruction: "You are a shop assistant at a clothing store. Help the user find clothes and process checkout. Keep your responses short (under 2 sentences). Correct any grammar errors inside brackets like '[Correction: ...]'. Always add a line starting with 'vn: ' followed by the Vietnamese translation at the end.",
        firstMessage: "Hi there! Welcome to our store. How can I help you today? Are you looking for anything specific?\nvn: Xin chào! Chào mừng đến cửa hàng. Tôi có thể giúp gì cho bạn hôm nay? Bạn đang tìm món đồ cụ thể nào à?"
    },
    {
        id: 'meeting',
        title: 'Họp công việc',
        description: 'Thảo luận, trình bày ý tưởng',
        difficulty: 'Khó',
        icon: '💼',
        systemInstruction: "You are a senior project manager hosting a meeting. Ask the user for updates on their tasks. Keep responses professional, clear and short. Correct grammar errors inside brackets like '[Correction: ...]'. Always add a line starting with 'vn: ' followed by the Vietnamese translation at the end.",
        firstMessage: "Good morning team. Let's start the meeting. Can you give me a brief update on your project status?\nvn: Chào buổi sáng cả đội. Chúng ta bắt đầu cuộc họp nhé. Bạn có thể cập nhật ngắn gọn về tiến độ dự án của mình không?"
    },
    {
        id: 'airport',
        title: 'Sân bay',
        description: 'Check-in, hỏi đường, chuyến bay',
        difficulty: 'Trung bình',
        icon: '✈️',
        systemInstruction: "You are an airport check-in counter agent. Greet the passenger and check their passport and booking. Keep responses short. Correct grammar errors inside brackets like '[Correction: ...]'. Always add a line starting with 'vn: ' followed by the Vietnamese translation at the end.",
        firstMessage: "Hello! Welcome to Sky Airways. May I please have your passport and ticket reference code?\nvn: Xin chào! Chào mừng đến với hãng bay Sky Airways. Tôi có thể xin hộ chiếu và mã đặt vé của bạn được không?"
    },
    {
        id: 'hotel',
        title: 'Đặt phòng khách sạn',
        description: 'Check-in, yêu cầu dịch vụ',
        difficulty: 'Trung bình',
        icon: '🏨',
        systemInstruction: "You are a hotel receptionist checking in a guest. Greet them and ask for their name and booking. Keep responses friendly and short. Correct grammar errors inside brackets like '[Correction: ...]'. Always add a line starting with 'vn: ' followed by the Vietnamese translation at the end.",
        firstMessage: "Welcome to The Grand Hotel! How can I assist you? Are you checking in today?\nvn: Chào mừng đến với khách sạn The Grand Hotel! Tôi có thể giúp gì cho bạn? Bạn nhận phòng hôm nay đúng không?"
    },
    {
        id: 'chat',
        title: 'Trò chuyện phiếm',
        description: 'Giao tiếp hàng ngày, làm quen',
        difficulty: 'Dễ',
        icon: '💬',
        systemInstruction: "You are a friendly peer chatting casually with the user. Greet them and talk about hobbies or daily life. Keep responses friendly, casual and short. Correct grammar errors inside brackets like '[Correction: ...]'. Always add a line starting with 'vn: ' followed by the Vietnamese translation at the end.",
        firstMessage: "Hey there! How has your day been going so far? Doing anything fun?\nvn: Chào bạn! Ngày hôm nay của bạn thế nào rồi? Có làm gì vui không?"
    }
];

export default function ConversationPage() {
    const [activeScenario, setActiveScenario] = useState<Scenario | null>(null); // Tình huống đang chọn
    const [messages, setMessages] = useState<Message[]>([]); // Danh sách tin nhắn
    const [inputText, setInputText] = useState(''); // Ô nhập liệu
    const [isStreaming, setIsStreaming] = useState(false); // Trạng thái AI đang chạy chữ

    const token = useAuthStore(state => state.token); // Token để gọi API bảo mật
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref dùng để cuộn tự động

    // Tự động cuộn xuống tin nhắn cuối cùng
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Khởi tạo cuộc hội thoại mới khi chọn tình huống
    const handleStartConversation = (scenario: Scenario) => {
        setActiveScenario(scenario);

        // Tách tin nhắn đầu tiên của AI thành text tiếng Anh và dịch tiếng Việt
        const parts = scenario.firstMessage.split('\nvn: ');
        const firstMsg: Message = {
            id: 'first',
            sender: 'ai',
            text: parts[0],
            translation: parts[1] || ''
        };
        setMessages([firstMsg]);
    };

    // Phát âm câu nói (Text-To-Speech)
    const playAudio = (text: string) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        synth.speak(utterance);
    };

    // Gửi tin nhắn và gọi API Stream
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isStreaming || !activeScenario) return;

        const userText = inputText.trim();
        setInputText('');

        // TODO 1: Tạo đối tượng tin nhắn của user
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: userText
        };

        // TODO 2: Cập nhật nhanh tin nhắn của user vào state (Optimistic Update)
        // và tạo sẵn một tin nhắn rỗng của AI ở cuối để hứng chữ stream
        const aiPlaceholderId = (Date.now() + 1).toString();
        const aiPlaceholder: Message = {
            id: aiPlaceholderId,
            sender: 'ai',
            text: '',
            translation: ''
        };

        setMessages(prev => [...prev, userMsg, aiPlaceholder]);
        setIsStreaming(true);

        try {
            // TODO 3: Định dạng lịch sử trò chuyện (history) theo chuẩn Gemini gửi lên backend
            // - Nếu message.sender === 'user' -> role: 'user'
            // - Nếu message.sender === 'ai' -> role: 'model'
            // - text thì lấy toàn bộ text tiếng Anh (bỏ phần translation đi)
            const formattedHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            // TODO 4: Gọi fetch đến URL 'http://localhost:5000/api/chat/stream' bằng phương thức POST
            // - Headers gửi kèm: Content-Type và Authorization Bearer
            // - Body JSON gửi kèm: { systemInstruction: activeScenario.systemInstruction, history: formattedHistory, message: userText }
            const response = await fetch('http://localhost:5000/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    systemInstruction: activeScenario.systemInstruction,
                    history: formattedHistory,
                    message: userText
                })
            });

            if (!response.ok) throw new Error('Không thể kết nối stream');

            // TODO 5: Khởi tạo Reader và TextDecoder để đọc dòng chảy (chunks)
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    accumulatedText += chunk;

                    // TODO 6: Tách đoạn phản hồi của AI thành câu tiếng Anh và câu dịch tiếng Việt
                    // Hướng dẫn: Đoạn text trả về sẽ có dạng: "English text... \nvn: Câu dịch tiếng Việt..."
                    // - Hãy split đoạn accumulatedText theo ký tự '\nvn: ' hoặc 'vn: '
                    // - Update liên tục vào tin nhắn AI placeholder trong state messages
                    const parts = accumulatedText.split(/vn: |\\nvn: /);
                    const englishText = parts[0].trim();
                    const vietnameseText = parts[1] ? parts[1].trim() : '';

                    setMessages(prev => prev.map(msg =>
                        msg.id === aiPlaceholderId
                            ? { ...msg, text: englishText, translation: vietnameseText }
                            : msg
                    ));
                }
            }
        } catch (error) {
            console.error(error);
            // Xóa tin nhắn placeholder nếu gặp lỗi
            setMessages(prev => prev.filter(msg => msg.id !== aiPlaceholderId));
            alert('Đã xảy ra lỗi khi trò chuyện với AI.');
        } finally {
            setIsStreaming(false);
            useAuthStore.getState().getMe();
        }
    };

    // ==========================================
    // VIEW 1: MÀN HÌNH CHỌN TÌNH HUỐNG (LIST SCENARIOS)
    // ==========================================
    if (!activeScenario) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h2 className="text-foreground text-2xl font-bold tracking-tight">Hội thoại mô phỏng</h2>
                    <p className="text-muted-foreground text-sm">Thực hành giao tiếp với AI qua các tình huống thực tế</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((sc) => (
                        <div
                            key={sc.id}
                            className="bg-card/40 border border-border/80 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 relative group"
                        >
                            <span className="absolute top-6 right-6 text-xs px-2.5 py-1 rounded-lg font-bold bg-muted text-muted-foreground">
                                {sc.difficulty}
                            </span>
                            <div className="space-y-4">
                                <span className="text-4xl block">{sc.icon}</span>
                                <div>
                                    <h3 className="text-foreground font-bold text-base group-hover:text-primary transition-colors">{sc.title}</h3>
                                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{sc.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleStartConversation(sc)}
                                className="mt-6 w-full py-2.5 bg-accent text-accent-foreground rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs font-semibold tracking-wider cursor-pointer"
                            >
                                Bắt đầu →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW 2: KHUNG CHAT CHI TIẾT (CHAT INTERFACE)
    // ==========================================
    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-card/20 border border-border/80 rounded-3xl overflow-hidden shadow-xs">
            {/* HEADER KHUNG CHAT */}
            <div className="bg-card border-b border-border/80 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeScenario.icon}</span>
                    <div>
                        <h3 className="text-foreground font-bold text-sm">{activeScenario.title}</h3>
                        <p className="text-xs text-emerald-500 font-medium">AI đang mô phỏng • +8 XP/tin nhắn</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleStartConversation(activeScenario)}
                        title="Bắt đầu lại cuộc hội thoại"
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setActiveScenario(null); setMessages([]); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" /> Đóng
                    </button>
                </div>
            </div>

            {/* VÙNG CHAT CHỨA TIN NHẮN */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                            }`}
                    >
                        {/* Avatar Robot cho AI */}
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm shrink-0">
                                🤖
                            </div>
                        )}

                        {/* Bubble Tin nhắn */}
                        <div className="space-y-1">
                            <div
                                className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${msg.sender === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-card border border-border/80 text-foreground rounded-tl-none'
                                    }`}
                            >
                                {/* Text tiếng Anh */}
                                <p className="font-medium">{msg.text || (isStreaming && msg.id === messages[messages.length - 1].id ? '...' : '')}</p>

                                {/* Nút loa phát âm cho tin nhắn AI */}
                                {msg.sender === 'ai' && msg.text && (
                                    <button
                                        onClick={() => playAudio(msg.text)}
                                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Dịch nghĩa tiếng Việt cho câu của AI */}
                            {msg.sender === 'ai' && msg.translation && (
                                <p className="text-[11px] text-muted-foreground italic pl-1">
                                    {msg.translation}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {/* Điểm neo để tự động cuộn */}
                <div ref={messagesEndRef} />
            </div>

            {/* VÙNG Ô NHẬP TIN NHẮN */}
            <div className="p-4 bg-card border-t border-border/80 space-y-2">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nhập câu trả lời của bạn bằng tiếng Anh..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isStreaming}
                        className="flex-1 px-4 py-3 bg-muted/40 text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isStreaming}
                        className="p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all cursor-pointer flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" /> AI sẽ tự động sửa lỗi ngữ pháp nhẹ trực tiếp trong ngoặc [Correction: ...]
                </p>
            </div>
        </div>
    );
}
