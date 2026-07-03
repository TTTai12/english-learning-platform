import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronRight, Zap, ArrowRight, Star, Target, Map } from 'lucide-react';
import { useAppStore } from '../store/useAppStore'; // Store quản lý XP toàn cục
import { useAuthStore } from '../store/useAuthStore'; // Store quản lý Token đăng nhập
import { useNavigate } from 'react-router-dom'; // Hook điều hướng React Router
import { useQuery } from '@tanstack/react-query'; // Hook gọi API và caching
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  label: string;
  desc: string;
  section?: string; // Tên route chuyển trang
  xpReward: number;
  tag?: string;
}

interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  duration: string;
  icon: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  lineColor: string;
  tasks: Task[];
  unlockAfter?: number; // số lượng task tối thiểu cần hoàn thành ở giai đoạn trước
}

// Giữ nguyên 100% danh sách Phase & Task từ thiết kế của em
const phases: Phase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'Nền tảng',
    subtitle: 'Xây dựng vốn từ và phát âm cơ bản',
    duration: 'Tuần 1–2',
    icon: '🌱',
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-700/50',
    badgeColor: 'bg-emerald-500',
    lineColor: 'bg-emerald-400',
    tasks: [
      { id: 't1-1', label: 'Từ vựng giao tiếp hàng ngày', desc: '20 từ thiết yếu nhất khi gặp người lạ, chào hỏi, giới thiệu bản thân', section: 'vocabulary', xpReward: 50, tag: 'Từ vựng' },
      { id: 't1-2', label: 'Phát âm 5 nguyên âm cơ bản', desc: 'Âm /æ/, /ɑː/, /ɔː/, /uː/, /ɜː/ — nền tảng để đọc bất kỳ từ nào', section: 'speaking', xpReward: 40, tag: 'Phát âm' },
      { id: 't1-3', label: 'Mẫu câu chào hỏi & giới thiệu', desc: '"Hello, I\'m..." / "Nice to meet you" / "How are you doing?"', section: 'grammar', xpReward: 45, tag: 'Ngữ pháp' },
      { id: 't1-4', label: 'Luyện nói 3 câu cơ bản với AI', desc: 'Thực hành ngay với AI để kiểm tra phát âm và sửa lỗi sớm', section: 'speaking', xpReward: 60, tag: 'Nói' },
      { id: 't1-5', label: 'Tạo bộ Flashcards tuần 1', desc: 'Lưu các từ mới học được vào flashcard để ôn tập mỗi ngày', section: 'flashcards', xpReward: 30, tag: 'Flashcards' },
    ],
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Xây dựng câu',
    subtitle: 'Ghép từ thành câu hoàn chỉnh trong thực tế',
    duration: 'Tuần 3–4',
    icon: '🌿',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/50',
    badgeColor: 'bg-blue-500',
    lineColor: 'bg-blue-400',
    unlockAfter: 3,
    tasks: [
      { id: 't2-1', label: 'Hiện tại đơn & Hiện tại tiếp diễn', desc: 'Hai thì quan trọng nhất — dùng mỗi ngày để nói về thói quen và hiện tại', section: 'grammar', xpReward: 55, tag: 'Ngữ pháp' },
      { id: 't2-2', label: 'Từ vựng chủ đề Công việc', desc: 'Từ dùng trong văn phòng, email, họp hành — thực dụng ngay', section: 'vocabulary', xpReward: 50, tag: 'Từ vựng' },
      { id: 't2-3', label: 'Hội thoại mua sắm', desc: 'Tình huống thực tế: hỏi giá, chọn size, trả tiền — dễ bắt đầu', section: 'conversation', xpReward: 65, tag: 'Hội thoại' },
      { id: 't2-4', label: 'Luyện nói câu trung cấp với AI', desc: '"Could you please..." / "I would like to..." — lịch sự và tự nhiên hơn', section: 'speaking', xpReward: 70, tag: 'Nói' },
      { id: 't2-5', label: 'Flashcards từ bài báo tiếng Anh', desc: 'Dán đoạn tin tức đơn giản — AI trích từ mới và tạo thẻ tự động', section: 'flashcards', xpReward: 40, tag: 'Flashcards' },
    ],
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Hội thoại thực chiến',
    subtitle: 'Đối thoại liên tục và xử lý tình huống bất ngờ',
    duration: 'Tuần 5–8',
    icon: '🌳',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700/50',
    badgeColor: 'bg-purple-500',
    lineColor: 'bg-purple-400',
    unlockAfter: 4,
    tasks: [
      { id: 't3-1', label: 'Hội thoại nhà hàng & sân bay', desc: 'Tình huống du lịch thực tế: đặt bàn, check-in, hỏi thông tin chuyến bay', section: 'conversation', xpReward: 75, tag: 'Hội thoại' },
      { id: 't3-2', label: 'Thì quá khứ & Hiện tại hoàn thành', desc: 'Kể chuyện, chia sẻ kinh nghiệm — mở rộng khả năng diễn đạt', section: 'grammar', xpReward: 60, tag: 'Ngữ pháp' },
      { id: 't3-3', label: 'Hội thoại họp công việc', desc: 'Trình bày ý kiến, đặt câu hỏi, phản hồi chuyên nghiệp trong môi trường công sở', section: 'conversation', xpReward: 85, tag: 'Hội thoại' },
      { id: 't3-4', label: 'Nâng cấp phát âm: âm nối', desc: 'Linking sounds — bí kíp nghe tự nhiên như người bản ngữ thật sự', section: 'speaking', xpReward: 80, tag: 'Nói' },
      { id: 't3-5', label: 'Từ vựng IT & Công nghệ', desc: '20 thuật ngữ kỹ thuật thiết yếu: algorithm, deployment, repository...', section: 'vocabulary', xpReward: 55, tag: 'Từ vựng' },
    ],
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'Lưu loát',
    subtitle: 'Phản xạ tức thì, không cần chuẩn bị',
    duration: 'Tuần 9+ · Liên tục',
    icon: '🏆',
    color: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-700/50',
    badgeColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
    lineColor: 'bg-amber-400',
    unlockAfter: 4,
    tasks: [
      { id: 't4-1', label: 'Hội thoại tự do không chuẩn bị', desc: 'Nói về bất kỳ chủ đề nào AI đưa ra — không có kịch bản, phản xạ tự nhiên', section: 'conversation', xpReward: 100, tag: 'Tự do' },
      { id: 't4-2', label: 'Thì tương lai & điều kiện', desc: '"If I were you..." / "I will have finished by..." — diễn đạt phức tạp', section: 'grammar', xpReward: 70, tag: 'Ngữ pháp' },
      { id: 't4-3', label: 'Phân tích lỗi sai cá nhân', desc: 'Xem lại sổ tay từ vựng — ôn đúng những từ bạn hay quên nhất', section: 'vocab-notebook', xpReward: 60, tag: 'Ôn tập' },
      { id: 't4-4', label: 'Nói nâng cao: thuyết phục & tranh luận', desc: '"On the other hand..." / "I strongly believe that..." — cấp độ học thuật', section: 'speaking', xpReward: 120, tag: 'Nói' },
      { id: 't4-5', label: 'Duy trì streak 30 ngày', desc: 'Học đều đặn mỗi ngày — thói quen là chìa khóa duy nhất để thành thạo', xpReward: 200, tag: '🔥 Thử thách' },
    ],
  },
];

const tagColors: Record<string, string> = {
  'Từ vựng': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Phát âm': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Ngữ pháp': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Nói': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Flashcards': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Hội thoại': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Ôn tập': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Tự do': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  '🔥 Thử thách': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function RoadmapPage() {
  const { xp } = useAppStore(); // Đồng bộ điểm XP từ store toàn cục
  const token = useAuthStore(state => state.token); // Lấy token đăng nhập
  const navigate = useNavigate(); // Hook chuyển trang React Router

  // Gọi API lấy danh sách nhiệm vụ đã hoàn thành thực tế từ Database
  const { data, isLoading } = useQuery<{ completedTaskIds: string[] }>({
    queryKey: ['roadmap-progress'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/roadmap', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Không thể tải tiến độ lộ trình');
      return res.json();
    },
    enabled: !!token
  });

  // Chuyển đổi mảng hoàn thành nhận từ DB thành cấu trúc Set để tra cứu nhanh O(1)
  const completedTasks = new Set<string>(data?.completedTaskIds || []);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    () => new Set(['phase-1'])
  );

  // Hiệu ứng pháo hoa khi hoàn thành cột mốc số lượng chặng bay
  useEffect(() => {
    if (data?.completedTaskIds && data.completedTaskIds.length > 0 && data.completedTaskIds.length % 5 === 0) {
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.5 } });
    }
  }, [data?.completedTaskIds]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) { next.delete(phaseId); } else { next.add(phaseId); }
      return next;
    });
  };

  const getPhaseProgress = (phase: Phase) => {
    const done = phase.tasks.filter((t) => completedTasks.has(t.id)).length;
    return { done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
  };

  const getPrevPhaseCompleted = (phaseIndex: number) => {
    if (phaseIndex === 0) return 999;
    const prev = phases[phaseIndex - 1];
    return prev.tasks.filter((t) => completedTasks.has(t.id)).length;
  };

  const isPhaseUnlocked = (phase: Phase, idx: number) => {
    if (idx === 0) return true;
    const required = phase.unlockAfter ?? 3;
    return getPrevPhaseCompleted(idx) >= required;
  };

  const totalTasks = phases.reduce((s, p) => s + p.tasks.length, 0);
  const totalDone = completedTasks.size;
  const overallPct = Math.round((totalDone / totalTasks) * 100);

  const currentPhaseIdx = phases.findIndex((p, idx) => {
    const { done, total } = getPhaseProgress(p);
    return done < total && isPhaseUnlocked(p, idx);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        Đang tải lộ trình học tập từ Database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight mb-1">Lộ trình học tập</h2>
          <p className="text-muted-foreground text-sm">
            Hành trình từ người mới bắt đầu đến giao tiếp lưu loát — đồng bộ tiến độ thực tế từ Database
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 shrink-0">
          <Map className="w-4 h-4 text-primary" />
          <span className="text-primary" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            {totalDone}/{totalTasks} hoàn thành
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-foreground text-sm font-semibold">
              Tiến độ tổng thể
            </span>
          </div>
          <span className="text-primary text-sm font-bold">{overallPct}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${overallPct}%` }}
          />
        </div>

        {/* Phase mini indicators */}
        <div className="grid grid-cols-4 gap-2">
          {phases.map((phase, idx) => {
            const { pct } = getPhaseProgress(phase);
            const unlocked = isPhaseUnlocked(phase, idx);
            return (
              <div key={phase.id} className="text-center">
                <div className="text-base mb-1">{phase.icon}</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${unlocked ? phase.lineColor : 'bg-muted-foreground/20'}`}
                    style={{ width: unlocked ? `${pct}%` : '0%' }}
                  />
                </div>
                <span className="text-muted-foreground" style={{ fontSize: '0.6rem' }}>
                  {unlocked ? `${pct}%` : '🔒 Khóa'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 via-purple-300 to-amber-300 opacity-30 hidden md:block" />

        <div className="space-y-4">
          {phases.map((phase, phaseIdx) => {
            const { done, total, pct } = getPhaseProgress(phase);
            const isExpanded = expandedPhases.has(phase.id);
            const unlocked = isPhaseUnlocked(phase, phaseIdx);
            const isCurrent = phaseIdx === currentPhaseIdx;
            const isComplete = done === total;

            return (
              <div key={phase.id} className="relative">
                {/* Phase Header Card */}
                <button
                  onClick={() => unlocked && togglePhase(phase.id)}
                  disabled={!unlocked}
                  className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 ${
                    unlocked
                      ? `${phase.color} ${phase.borderColor} hover:shadow-md hover:-translate-y-0.5 cursor-pointer`
                      : 'bg-muted/30 border-border opacity-60 cursor-not-allowed'
                  } ${isCurrent && unlocked ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Phase Icon + Number */}
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${unlocked ? 'bg-white dark:bg-card shadow-sm border border-border' : 'bg-muted'}`} style={{ fontSize: '1.75rem' }}>
                        {unlocked ? phase.icon : '🔒'}
                      </div>
                      <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${isComplete ? 'bg-emerald-500' : unlocked ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ fontSize: '0.55rem', fontWeight: 700 }}>
                        {isComplete ? '✓' : phase.number}
                      </div>
                    </div>

                    {/* Phase Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-foreground text-base font-semibold">
                          Giai đoạn {phase.number} — {phase.title}
                        </h3>
                        {isCurrent && unlocked && (
                          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                            ĐANG HỌC
                          </span>
                        )}
                        {isComplete && (
                          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                            ✓ HOÀN THÀNH
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs mb-2">{phase.subtitle}</p>

                      {/* Progress */}
                      {unlocked && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${phase.lineColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {done}/{total} nhiệm vụ
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-muted-foreground text-xs">{phase.duration}</span>
                      {unlocked && (
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                      {!unlocked && (
                        <div className="text-center">
                          <Lock className="w-4 h-4 text-muted-foreground mx-auto" />
                          <span className="text-muted-foreground" style={{ fontSize: '0.6rem' }}>
                            Cần {phase.unlockAfter} nhiệm vụ GĐ{phaseIdx}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                {/* Tasks */}
                {isExpanded && unlocked && (
                  <div className="mt-2 ml-0 md:ml-8 space-y-2">
                    {phase.tasks.map((task) => {
                      const isDone = completedTasks.has(task.id);
                      return (
                        <div
                          key={task.id}
                          className={`bg-card border rounded-xl p-4 transition-all duration-200 group ${
                            isDone
                              ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10'
                              : 'border-border hover:border-primary/30 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox Icon (Chỉ hiển thị trạng thái đã hoàn thành) */}
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                                <p
                                  className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                                >
                                  {task.label}
                                </p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {task.tag && (
                                    <span className={`px-2 py-0.5 rounded-full ${tagColors[task.tag] ?? 'bg-muted text-muted-foreground'}`} style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                      {task.tag}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                                    <Zap className="w-2.5 h-2.5" />
                                    {task.xpReward} XP
                                  </span>
                                </div>
                              </div>
                              <p className="text-muted-foreground text-xs">{task.desc}</p>
                            </div>

                            {/* Nút chuyển đến phân hệ để học */}
                            {task.section && !isDone && (
                              <button
                                onClick={() => navigate('/' + task.section)}
                                className="shrink-0 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 text-xs font-semibold cursor-pointer"
                              >
                                Bắt đầu
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Phase XP Summary */}
                    <div className={`${phase.color} ${phase.borderColor} border rounded-xl px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-foreground text-xs font-medium">
                          Tổng XP giai đoạn {phase.number}
                        </span>
                      </div>
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">
                        {phase.tasks.reduce((s, t) => s + t.xpReward, 0)} XP
                      </span>
                    </div>

                    {/* Unlock next hint */}
                    {phaseIdx < phases.length - 1 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs">
                          Hoàn thành <strong>{phases[phaseIdx + 1].unlockAfter ?? 3} nhiệm vụ</strong> để mở khóa Giai đoạn {phase.number + 1} — {phases[phaseIdx + 1].title}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {totalDone === totalTasks && (
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-white mb-1 font-bold">Bạn đã hoàn thành toàn bộ lộ trình!</h3>
          <p className="text-amber-100 text-sm">
            Thành tích xuất sắc! Bạn đã đi được cả hành trình từ người mới đến lưu loát.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-5">
        <h3 className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          💡 Mẹo học hiệu quả theo lộ trình
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: '⏰', tip: 'Học 20–30 phút mỗi ngày hiệu quả hơn học 3 tiếng một lần vào cuối tuần' },
            { icon: '🔁', tip: 'Ôn lại Flashcards buổi sáng — não hấp thụ tốt nhất sau khi ngủ dậy' },
            { icon: '🗣️', tip: 'Nói to khi luyện, dù một mình — âm thanh giúp ghi nhớ sâu hơn đọc thầm' },
            { icon: '📌', tip: 'Không cần hoàn hảo — cứ nói sai rồi sửa, AI sẽ chỉ bạn đúng chỗ' },
          ].map((item) => (
            <div key={item.tip} className="flex items-start gap-2">
              <span className="text-sm">{item.icon}</span>
              <p className="text-muted-foreground text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
