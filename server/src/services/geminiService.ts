import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// 1. Khởi tạo SDK bằng API Key trong biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 2. Định nghĩa cấu trúc dữ liệu JSON mong muốn trả về
const vocabularySchema = {
    type: SchemaType.OBJECT,
    properties: {
        words: {
            type: SchemaType.ARRAY,
            description: "Danh sách các từ vựng mới, quan trọng hoặc chuyên ngành được trích xuất từ đoạn văn",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    english: {
                        type: SchemaType.STRING,
                        description: "Từ vựng tiếng Anh nguyên mẫu"
                    },
                    vietnamese: {
                        type: SchemaType.STRING,
                        description: "Nghĩa dịch tiếng Việt chuẩn xác nhất theo ngữ cảnh của đoạn văn"
                    },
                    phonetic: {
                        type: SchemaType.STRING,
                        description: "Phiên âm quốc tế IPA, ví dụ: /ˈentərpraɪz/"
                    },
                    example: {
                        type: SchemaType.STRING,
                        description: "Một câu ví dụ bằng tiếng Anh chứa từ vựng đó"
                    },
                    difficulty: {
                        type: SchemaType.STRING,
                        enum: ["easy", "medium", "hard"],
                        description: "Mức độ khó của từ vựng"
                    },
                    topic: {
                        type: SchemaType.STRING,
                        enum: ["daily", "business", "travel", "food", "health", "technology"],
                        description: "Phân loại chủ đề phù hợp nhất cho từ vựng từ danh sách chủ đề được cung cấp."
                    }
                },
                required: ["english", "vietnamese", "phonetic", "example", "difficulty", "topic"]
            }
        }
    },
    required: ["words"]
};

// 3. Cấu hình Model với Structured Outputs
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: vocabularySchema as any,
    }
});

// 4. Hàm chính trích xuất từ vựng từ văn bản
export const extractWordsFromText = async (text: string) => {
    const prompt = `Analyze the following English text. Identify and extract new, important, or technical vocabulary words that are useful for learners to build flashcards. For each word, provide its IPA phonetic transcription, Vietnamese translation based on the context, a clear English example sentence using the word, and its difficulty level ('easy', 'medium', 'hard').
    
    Text to analyze:
    "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON an toàn vì dữ liệu trả về chắc chắn khớp 100% với Schema
    const data = JSON.parse(responseText);
    return data.words; // Trả về mảng các từ vựng
};
// 5. Định nghĩa Schema cho kết quả chấm điểm nói
const speakingAnalysisSchema = {
    type: "object",
    properties: {
        score: {
            type: "integer",
            description: "Điểm số phát âm và hoàn thành câu của người dùng, thang điểm từ 0 đến 100."
        },
        words: {
            type: "array",
            description: "Danh sách so sánh chi tiết từng từ trong câu của người dùng so với câu mẫu",
            items: {
                type: "object",
                properties: {
                    word: {
                        type: "string",
                        description: "Từ vựng cụ thể"
                    },
                    status: {
                        type: "string",
                        enum: ["correct", "incorrect", "missing"],
                        description: "Trạng thái của từ: 'correct' (đúng), 'incorrect' (nói sai từ này hoặc nhận diện sai), 'missing' (bị thiếu so với câu mẫu)"
                    }
                },
                required: ["word", "status"]
            }
        },
        grammarFeedback: {
            type: "string",
            description: "Nhận xét ngắn gọn bằng tiếng Việt về ngữ pháp, cách phát âm hoặc từ vựng của người dùng."
        },
        suggestion: {
            type: "string",
            description: "Mẫu câu gợi ý diễn đạt tự nhiên hơn theo phong cách người bản xứ dựa trên ý của người dùng."
        }
    },
    required: ["score", "words", "grammarFeedback", "suggestion"]
};

// Khởi tạo model riêng cho chấm điểm nói
const speakingModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: speakingAnalysisSchema as any,
    }
});

// Hàm gọi AI so sánh và chấm điểm phát âm
export const analyzeSpeech = async (targetPhrase: string, userSpeech: string) => {
    const prompt = `Compare the user's spoken text with the target suggested phrase.
    
    Target suggested phrase: "${targetPhrase}"
    User's spoken text: "${userSpeech}"
    
    Analyze the differences:
    1. Calculate a pronunciation and completeness score (0-100) based on how well the user's speech matches the target phrase (phonetically and semantically).
    2. Check word-by-word:
       - Which words are correctly spoken ('correct')?
       - Which words are spoken incorrectly or mispronounced ('incorrect')?
       - Which words from the target phrase are completely omitted/missing in the user's speech ('missing')?
    3. Provide a brief feedback in Vietnamese ('grammarFeedback') about their pronunciation or minor grammar issues.
    4. Provide a more natural, native-like alternative suggestion ('suggestion') if the user's expression is awkward, or reinforce the current one if it's already good.`;

    const result = await speakingModel.generateContent(prompt);
    const responseText = result.response.text();

    return JSON.parse(responseText);
};
