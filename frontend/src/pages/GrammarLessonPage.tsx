import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { grammarApi } from '../services/grammarApi';
import { CommonMistakesCard, CommonMistakeItem } from '../components/grammar/CommonMistakesCard';
import { GrammarExamplesSection, GrammarExampleItem } from '../components/grammar/GrammarExamplesSection';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { QuizQuestion, QuizResultData } from '../types/quiz';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Languages,
  Sparkles,
  Clock,
} from 'lucide-react';

// Predefined curriculum common mistakes based on grammar topic slug
const LESSON_MISTAKES: Record<string, CommonMistakeItem[]> = {
  'present-simple-tense': [
    {
      incorrect: 'He go to school by bus every day.',
      correct: 'He goes to school by bus every day.',
      reason: 'With third-person singular subjects (he, she, it), the verb must take -s or -es.',
      reasonVi: 'Chủ ngữ ngôi thứ ba số ít (he, she, it) yêu cầu động từ thêm đuôi -s hoặc -es.',
    },
    {
      incorrect: "She don't like drinking hot tea.",
      correct: "She doesn't like drinking hot tea.",
      reason: "The negative auxiliary for he/she/it is 'does not' (doesn't), not 'don't'.",
      reasonVi: 'Trợ động từ phủ định cho ngôi thứ ba số ít là "doesn\'t", không được dùng "don\'t".',
    },
  ],
  'present-continuous-tense': [
    {
      incorrect: 'I am knowing the answer right now.',
      correct: 'I know the answer right now.',
      reason: 'Stative verbs expressing mental states (know, understand, believe, love) are not used in continuous tenses.',
      reasonVi: 'Động từ chỉ trạng thái tâm lý / nhận thức (know, understand) không dùng ở thì tiếp diễn.',
    },
  ],
  'past-simple-tense': [
    {
      incorrect: "We didn't went to the concert last night.",
      correct: "We didn't go to the concert last night.",
      reason: "After auxiliary 'did' or 'didn't', the main verb must remain in bare infinitive form.",
      reasonVi: 'Sau trợ động từ "did/didn\'t", động từ chính phải trở về dạng nguyên thể không chia.',
    },
  ],
  'articles-a-an-the': [
    {
      incorrect: 'She wants to study at an university in Europe.',
      correct: 'She wants to study at a university in Europe.',
      reason: "'University' begins with a consonant sound /j/ (you), so it takes 'a', not 'an'.",
      reasonVi: '"University" bắt đầu bằng phụ âm /juː/, do đó dùng "a", không dùng "an".',
    },
    {
      incorrect: 'I usually have the breakfast at 7:00 AM.',
      correct: 'I usually have breakfast at 7:00 AM.',
      reason: 'Regular meals (breakfast, lunch, dinner) take zero article.',
      reasonVi: 'Tên các bữa ăn thông thường không dùng mạo từ "the".',
    },
  ],
  'prepositions-time-place-in-on-at': [
    {
      incorrect: 'She was born at May 1998.',
      correct: 'She was born in May 1998.',
      reason: "Months and years take preposition 'in', whereas exact dates take 'on'.",
      reasonVi: 'Tháng và năm đi với giới từ "in", chỉ khi có ngày cụ thể mới dùng "on".',
    },
  ],
  'modal-verbs': [
    {
      incorrect: 'You should to see a doctor soon.',
      correct: 'You should see a doctor soon.',
      reason: 'Modal verbs like can, could, must, should are followed by bare infinitive without to.',
      reasonVi: 'Động từ khuyết thiếu đi kèm động từ nguyên thể không có "to".',
    },
  ],
  'conditionals-type-1-2': [
    {
      incorrect: 'If it will rain tomorrow, we will stay at home.',
      correct: 'If it rains tomorrow, we will stay at home.',
      reason: 'In First Conditional, the IF clause must be in Present Simple, not future with will.',
      reasonVi: 'Trong mệnh đề IF của câu điều kiện loại 1, động từ chia ở hiện tại đơn, không dùng "will".',
    },
  ],
  'passive-voice': [
    {
      incorrect: 'The letter was wrote by our manager.',
      correct: 'The letter was written by our manager.',
      reason: 'Passive voice requires the past participle (V3: written), not past simple (V2: wrote).',
      reasonVi: 'Câu bị động bắt buộc dùng phân từ hai (V3: written), không dùng quá khứ đơn (V2: wrote).',
    },
  ],
  'reported-speech': [
    {
      incorrect: 'He said that he can speak Spanish fluently.',
      correct: 'He said that he could speak Spanish fluently.',
      reason: "When the reporting verb is past ('said'), modal 'can' must backshift to 'could'.",
      reasonVi: 'Động từ dẫn ở quá khứ "said" đòi hỏi lùi thì của "can" thành "could".',
    },
  ],
};

// Predefined curriculum examples
const LESSON_EXAMPLES: Record<string, GrammarExampleItem[]> = {
  'present-simple-tense': [
    {
      english: 'Water boils at 100 degrees Celsius.',
      vietnamese: 'Nước sôi ở 100 độ C. (Chân lý tự nhiên hiển nhiên)',
      note: 'General truth',
    },
    {
      english: 'I always drink hot green tea after breakfast.',
      vietnamese: 'Tôi luôn uống trà xanh nóng sau bữa sáng. (Thói quen lặp lại hàng ngày)',
      note: 'Habitual action',
    },
    {
      english: 'The direct train to Da Nang leaves at 6:30 AM tomorrow.',
      vietnamese: 'Chuyến tàu thẳng đi Đà Nẵng khởi hành lúc 6:30 sáng mai. (Lịch trình cố định)',
      note: 'Fixed timetable',
    },
  ],
  'articles-a-an-the': [
    {
      english: 'I bought an honest review from an independent journalist.',
      vietnamese: 'Tôi đã mua một bài đánh giá chân thực từ một nhà báo độc lập.',
      note: 'Silent "h" in honest',
    },
    {
      english: 'The sun rises in the east and sets in the west.',
      vietnamese: 'Mặt trời mọc ở đằng Đông và lặn ở đằng Tây.',
      note: 'Unique celestial objects',
    },
  ],
  'prepositions-time-place-in-on-at': [
    {
      english: 'We arrived in Hanoi at 8:00 AM on Sunday morning.',
      vietnamese: 'Chúng tôi đến Hà Nội (in Hanoi) lúc 8:00 sáng (at 8:00 AM) vào sáng Chủ nhật (on Sunday).',
      note: 'City (in), Time (at), Day (on)',
    },
  ],
};

export const GrammarLessonPage: React.FC = () => {
  const { id: slugOrId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<
    'EXPLANATION' | 'EXAMPLES' | 'MISTAKES' | 'VIETNAMESE' | 'EXERCISES'
  >('EXPLANATION');

  // Fetch lesson details
  const {
    data: lesson,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['grammar-lesson', slugOrId],
    queryFn: () => grammarApi.getLesson(slugOrId || ''),
    enabled: !!slugOrId,
  });

  // Transform exercises into normalized QuizQuestion format for reusable QuizRunner
  const quizQuestions: QuizQuestion[] = useMemo(() => {
    if (!lesson?.exercises) return [];
    return lesson.exercises.map((ex) => ({
      id: ex.id,
      prompt: ex.question,
      instruction: ex.instruction,
      questionType: ex.questionType,
      options: ex.options,
      correctAnswer: ex.correctAnswer,
      explanation: ex.explanation,
      explanationVi: ex.explanationVi,
      points: 25,
      order: ex.order,
    }));
  }, [lesson]);

  // Mistakes for this lesson
  const commonMistakes = useMemo(() => {
    if (!lesson) return [];
    return (
      LESSON_MISTAKES[lesson.slug] || [
        {
          incorrect: 'Incorrect sentence structure sample.',
          correct: 'Correct grammatical sentence structure.',
          reason: 'Make sure to check subject-verb agreement and tense markers.',
          reasonVi: 'Hãy luôn chú ý sự hòa hợp giữa chủ ngữ và động từ cũng như dấu hiệu nhận biết thì.',
        },
      ]
    );
  }, [lesson]);

  // Examples for this lesson
  const examplesList = useMemo(() => {
    if (!lesson) return [];
    return (
      LESSON_EXAMPLES[lesson.slug] || [
        {
          english: 'She practices English speaking skills every single evening.',
          vietnamese: 'Cô ấy luyện tập kỹ năng nói tiếng Anh vào mỗi buổi tối.',
          note: 'Contextual sentence',
        },
        {
          english: 'Consistent practice brings tremendous improvement over time.',
          vietnamese: 'Sự kiên trì luyện tập đem lại sự tiến bộ vượt bậc theo thời gian.',
          note: 'General principle',
        },
      ]
    );
  }, [lesson]);

  const handleExerciseSubmit = async (
    submissionAnswers: Array<{ questionId: string; answer: string }>,
    timeSpentSeconds: number
  ): Promise<QuizResultData> => {
    if (!lesson) throw new Error('Lesson not found');
    const result = await grammarApi.submitExercises(
      lesson.slug,
      submissionAnswers.map((a) => ({ exerciseId: a.questionId, answer: a.answer }))
    );

    return {
      quizTitle: `${lesson.title} - Practice Exercises`,
      score: result.correctCount * 25,
      maxScore: result.totalQuestions * 25,
      percentage: result.percentage,
      passed: result.passed,
      passingScore: 70,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      timeSpentSeconds,
      xpAwarded: result.xpAwarded,
      breakdown: result.breakdown.map((b) => {
        const matchingEx = quizQuestions.find((q) => q.id === b.exerciseId);
        return {
          questionId: b.exerciseId,
          prompt: b.question,
          instruction: b.instruction || matchingEx?.instruction,
          questionType: b.questionType || matchingEx?.questionType,
          options: matchingEx?.options,
          submittedAnswer: b.submittedAnswer,
          correctAnswer: b.correctAnswer,
          isCorrect: b.isCorrect,
          points: 25,
          pointsEarned: b.isCorrect ? 25 : 0,
          explanation: b.explanation,
          explanationVi: b.explanationVi,
        };
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-4xl flex-1 px-4 py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading grammar lesson...</p>
        </div>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-2xl flex-1 px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Lesson Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't retrieve the requested grammar lesson.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold hover:bg-accent"
            >
              Retry
            </button>
            <Link
              to="/grammar"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              Back to Grammar Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/grammar" className="hover:text-foreground">
            Grammar
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">{lesson.category}</span>
          <span>/</span>
          <span className="truncate">{lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {lesson.category}
              </span>
              <span className="rounded-lg border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {lesson.level}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>~10 mins study</span>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-primary sm:text-base">
            {lesson.titleVi}
          </p>

          {lesson.summary && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {lesson.summary}
            </p>
          )}

          {/* Quick Stats bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{lesson.exercises.length} Interactive Exercises</span>
            </div>
            {lesson.quiz && (
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Full Assessment Quiz Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Tabs Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('EXPLANATION')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              activeTab === 'EXPLANATION'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Explanation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXAMPLES')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              activeTab === 'EXAMPLES'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Examples ({examplesList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MISTAKES')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              activeTab === 'MISTAKES'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Common Mistakes ({commonMistakes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VIETNAMESE')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              activeTab === 'VIETNAMESE'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Languages className="h-4 w-4" />
            <span>Vietnamese Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXERCISES')}
            id="tab-exercises-button"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              activeTab === 'EXERCISES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Practice Exercises ({quizQuestions.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* 1. Explanation Tab */}
          {activeTab === 'EXPLANATION' && (
            <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {lesson.content}
              </div>

              <div className="mt-8 flex justify-end border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXERCISES')}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 sm:text-sm"
                >
                  <span>Practice Exercises Now</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Examples Tab */}
          {activeTab === 'EXAMPLES' && (
            <div className="space-y-6">
              <GrammarExamplesSection examples={examplesList} />
              <div className="flex justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXPLANATION')}
                  className="text-xs font-semibold text-muted-foreground hover:underline"
                >
                  ← Back to Explanation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('MISTAKES')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View Common Mistakes →
                </button>
              </div>
            </div>
          )}

          {/* 3. Common Mistakes Tab */}
          {activeTab === 'MISTAKES' && (
            <div className="space-y-6">
              <CommonMistakesCard mistakes={commonMistakes} />
              <div className="flex justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXAMPLES')}
                  className="text-xs font-semibold text-muted-foreground hover:underline"
                >
                  ← Back to Examples
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('EXERCISES')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Go to Interactive Exercises →
                </button>
              </div>
            </div>
          )}

          {/* 4. Vietnamese Guide Tab */}
          {activeTab === 'VIETNAMESE' && (
            <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Languages className="h-5 w-5" />
                <span>Hướng Dẫn & Lưu Ý Ngữ Pháp Cho Người Việt</span>
              </div>

              <div className="mt-4 space-y-4 text-sm text-foreground leading-relaxed">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h4 className="font-bold text-primary">1. Điểm Khác Biệt Giữa Tiếng Việt và Tiếng Anh:</h4>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Trong tiếng Việt, động từ không biến đổi theo thì hoặc ngôi (chỉ cần thêm từ như "đã", "đang", "sẽ").
                    Tuy nhiên trong tiếng Anh, động từ bắt buộc phải chia đuôi (-s, -es, -ed, -ing) hoặc dùng trợ động từ phù hợp.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <h4 className="font-bold text-foreground">2. Mẹo Ghi Nhớ Nhanh:</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs text-muted-foreground sm:text-sm">
                    <li>Nhìn vào các từ chỉ thời gian (time markers) để xác định thì trước khi chia động từ.</li>
                    <li>Luôn xác định chủ ngữ là số ít hay số nhiều trước khi quyết định thêm đuôi động từ.</li>
                    <li>Thực hành lặp lại câu hoàn chỉnh thay vì chỉ nhớ công thức rời rạc.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXERCISES')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 sm:text-sm"
                >
                  <span>Start Practice Exercises</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* 5. Interactive Practice Exercises Tab (Reuses QuizRunner) */}
          {activeTab === 'EXERCISES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Practice Mode: Instant explanation and answer checks are enabled!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('EXPLANATION')}
                  className="text-emerald-700 underline dark:text-emerald-300"
                >
                  Review lesson rules
                </button>
              </div>

              {/* Reusable Quiz Engine */}
              <QuizRunner
                quizId={lesson.id}
                title={`${lesson.title} - Practice`}
                questions={quizQuestions}
                mode="PRACTICE"
                onSubmit={handleExerciseSubmit}
                onComplete={() => {}}
                onBack={() => setActiveTab('EXPLANATION')}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
