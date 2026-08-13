'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ADVANCED_LESSONS,
  TRACK_LABELS,
  type LessonTrack,
} from '@/lib/advanced-lessons';
import styles from './learn.module.css';

type Phase = 'learn' | 'model' | 'practice' | 'results';
type SavedLessonProgress = {
  studied: boolean;
  completed: boolean;
  bestScore: number;
  attempts: number;
};
type ProgressMap = Record<string, SavedLessonProgress>;

const STORAGE_KEY = 'vu-dai-advanced-learning-progress';
const TRACKS: Array<{ value: 'all' | LessonTrack; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  ...Object.entries(TRACK_LABELS).map(([value, label]) => ({ value: value as LessonTrack, label })),
];

export function LearningHub() {
  const [activeTrack, setActiveTrack] = useState<'all' | LessonTrack>('all');
  const [selectedId, setSelectedId] = useState(ADVANCED_LESSONS[0].id);
  const [phase, setPhase] = useState<Phase>('learn');
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);
  const [exerciseOrder, setExerciseOrder] = useState<number[]>([]);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<number[]>([]);

  const lesson = ADVANCED_LESSONS.find((item) => item.id === selectedId) ?? ADVANCED_LESSONS[0];
  const lessonProgress = progress[lesson.id];
  const filteredLessons = useMemo(
    () => ADVANCED_LESSONS.filter((item) => activeTrack === 'all' || item.track === activeTrack),
    [activeTrack],
  );
  const completedCount = ADVANCED_LESSONS.filter((item) => progress[item.id]?.completed).length;
  const studiedCount = ADVANCED_LESSONS.filter((item) => progress[item.id]?.studied).length;
  const overallPercent = Math.round((completedCount / ADVANCED_LESSONS.length) * 100);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    queueMicrotask(() => {
      if (raw) {
        try {
          setProgress(JSON.parse(raw) as ProgressMap);
        } catch {
          // Dữ liệu cũ hoặc hỏng: bắt đầu lại an toàn với ngân hàng bài học còn nguyên.
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [loaded, progress]);

  function chooseLesson(id: string) {
    setSelectedId(id);
    setPhase('learn');
    resetExerciseState();
    window.setTimeout(() => {
      document.getElementById('advanced-lesson-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  function chooseTrack(track: 'all' | LessonTrack) {
    setActiveTrack(track);
    if (track !== 'all' && lesson.track !== track) {
      const firstMatch = ADVANCED_LESSONS.find((item) => item.track === track);
      if (firstMatch) chooseLesson(firstMatch.id);
    }
  }

  function markStudiedAndPractice() {
    setProgress((current) => ({
      ...current,
      [lesson.id]: {
        studied: true,
        completed: current[lesson.id]?.completed ?? false,
        bestScore: current[lesson.id]?.bestScore ?? 0,
        attempts: current[lesson.id]?.attempts ?? 0,
      },
    }));
    startPractice(lesson.exercises.map((_, index) => index));
  }

  function startPractice(order = lesson.exercises.map((_, index) => index)) {
    setExerciseOrder(order);
    setExerciseStep(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setMissed([]);
    setPhase('practice');
  }

  function resetExerciseState() {
    setExerciseOrder([]);
    setExerciseStep(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setMissed([]);
  }

  function chooseAnswer(answer: number) {
    if (selectedAnswer !== null) return;
    const questionIndex = exerciseOrder[exerciseStep];
    const isCorrect = answer === lesson.exercises[questionIndex].answer;
    setSelectedAnswer(answer);
    if (isCorrect) setCorrectCount((current) => current + 1);
    else setMissed((current) => [...current, questionIndex]);
  }

  function nextExercise() {
    if (exerciseStep < exerciseOrder.length - 1) {
      setExerciseStep((current) => current + 1);
      setSelectedAnswer(null);
      return;
    }

    const score = Math.round((correctCount / exerciseOrder.length) * 100);
    setProgress((current) => {
      const previous = current[lesson.id];
      return {
        ...current,
        [lesson.id]: {
          studied: true,
          completed: true,
          bestScore: Math.max(previous?.bestScore ?? 0, score),
          attempts: (previous?.attempts ?? 0) + 1,
        },
      };
    });
    setPhase('results');
  }

  function openPhase(nextPhase: Phase) {
    if ((nextPhase === 'practice' || nextPhase === 'results') && !lessonProgress?.studied) return;
    if (nextPhase === 'practice') startPractice();
    else setPhase(nextPhase);
  }

  const activeQuestionIndex = exerciseOrder[exerciseStep] ?? 0;
  const activeQuestion = lesson.exercises[activeQuestionIndex];
  const isCorrect = selectedAnswer === activeQuestion?.answer;

  return (
    <main className={styles.lab}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Vũ Đài TOEIC — trang chủ">
          <BrandMark />
          <span><strong>VŨ ĐÀI</strong><small>EXECUTIVE LAB</small></span>
        </Link>
        <nav aria-label="Điều hướng chính">
          <Link href="/">Đấu trường</Link>
          <span>Học nâng cao</span>
        </nav>
        <Link href="/" className={styles.backLink}><ArrowLeft /> Về dashboard</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>EXECUTIVE ENGLISH · C1–C2</p>
          <h1>Học để dùng được.<br /><span>Luyện để nhớ lâu.</span></h1>
          <p>Tiếng Anh công sở cấp cao cho môi trường tập đoàn châu Âu — tập trung vào sắc thái, quyết định và tình huống thật thay vì mẹo làm bài thi.</p>
          <div className={styles.heroStats}>
            <div><strong>{ADVANCED_LESSONS.length}</strong><span>BÀI CHUYÊN SÂU</span></div>
            <div><strong>{ADVANCED_LESSONS.reduce((sum, item) => sum + item.exercises.length, 0)}</strong><span>BÀI TẬP NHỚ LÂU</span></div>
            <div><strong>{completedCount}</strong><span>ĐÃ HOÀN THÀNH</span></div>
          </div>
        </div>
        <div className={styles.progressOrb} aria-label={`Tiến độ tổng ${overallPercent}%`}>
          <div style={{ '--progress': `${overallPercent * 3.6}deg` } as React.CSSProperties}>
            <span>{overallPercent}%</span>
            <small>TIẾN ĐỘ</small>
          </div>
          <p>{studiedCount}/{ADVANCED_LESSONS.length} bài đã học</p>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.catalogue}>
          <div className={styles.catalogueHeading}>
            <div><p className={styles.eyebrow}>LESSON BANK</p><h2>Ngân hàng bài học</h2></div>
            <span>{filteredLessons.length} bài</span>
          </div>
          <div className={styles.filters} role="group" aria-label="Lọc chủ đề">
            {TRACKS.map((track) => (
              <button
                type="button"
                key={track.value}
                className={activeTrack === track.value ? styles.filterActive : ''}
                onClick={() => chooseTrack(track.value)}
              >
                {track.label}
              </button>
            ))}
          </div>
          <div className={styles.lessonList}>
            {filteredLessons.map((item, index) => {
              const itemProgress = progress[item.id];
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`${styles.lessonCard} ${item.id === lesson.id ? styles.lessonActive : ''}`}
                  onClick={() => chooseLesson(item.id)}
                  aria-pressed={item.id === lesson.id}
                >
                  <span className={styles.lessonNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.lessonCardCopy}>
                    <small>{TRACK_LABELS[item.track]} · {item.level}</small>
                    <strong>{item.title}</strong>
                    <em>{item.duration} phút · {item.skills.join(' + ')}</em>
                  </span>
                  <span className={`${styles.lessonStatus} ${itemProgress?.completed ? styles.statusDone : ''}`}>
                    {itemProgress?.completed ? <Check /> : <Chevron />}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className={styles.lessonPanel} id="advanced-lesson-panel">
          <header className={styles.lessonHeader}>
            <div>
              <p className={styles.eyebrow}>{lesson.eyebrow}</p>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
            </div>
            <div className={styles.levelBadge}><strong>{lesson.level}</strong><span>ADVANCED</span></div>
          </header>

          <div className={styles.phaseTabs} role="tablist" aria-label="Các bước học">
            <button type="button" role="tab" aria-selected={phase === 'learn'} className={phase === 'learn' ? styles.phaseActive : ''} onClick={() => openPhase('learn')}><b>1</b><span>Học trọng tâm</span></button>
            <button type="button" role="tab" aria-selected={phase === 'model'} className={phase === 'model' ? styles.phaseActive : ''} onClick={() => openPhase('model')}><b>2</b><span>Quan sát mẫu</span></button>
            <button type="button" role="tab" aria-selected={phase === 'practice' || phase === 'results'} aria-disabled={!lessonProgress?.studied} className={phase === 'practice' || phase === 'results' ? styles.phaseActive : ''} onClick={() => openPhase('practice')}><b>{lessonProgress?.completed ? <Check /> : '3'}</b><span>Luyện để nhớ</span></button>
          </div>

          {phase === 'learn' && (
            <div className={styles.contentSection} role="tabpanel">
              <section className={styles.scenarioCard}>
                <span><Briefcase /></span>
                <div><small>TÌNH HUỐNG</small><p>{lesson.scenario}</p></div>
              </section>
              <section className={styles.objectives}>
                <p className={styles.sectionLabel}>SAU BÀI NÀY, BẠN SẼ</p>
                <ul>{lesson.objectives.map((objective) => <li key={objective}><Check /> {objective}</li>)}</ul>
              </section>
              <section className={styles.principleCard}>
                <div className={styles.principleHeading}><span>CORE PRINCIPLE</span><h3>{lesson.principle.title}</h3></div>
                <p>{lesson.principle.body}</p>
                <div className={styles.beforeAfter}>
                  <div><small>THAY VÌ</small><p>{lesson.principle.before}</p></div>
                  <span><Chevron /></span>
                  <div><small>HÃY NÓI</small><p>{lesson.principle.after}</p></div>
                </div>
              </section>
              <section>
                <p className={styles.sectionLabel}>CỤM TỪ CẤP CAO CẦN NHỚ</p>
                <div className={styles.phraseGrid}>
                  {lesson.phrases.map((item, index) => (
                    <div className={styles.phraseCard} key={item.phrase}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div><h4>{item.phrase}</h4><p>{item.meaning}</p><small>{item.usage}</small></div>
                    </div>
                  ))}
                </div>
              </section>
              <button type="button" className={styles.nextButton} onClick={() => setPhase('model')}>XEM TÌNH HUỐNG MẪU <Chevron /></button>
            </div>
          )}

          {phase === 'model' && (
            <div className={styles.contentSection} role="tabpanel">
              <div className={styles.modelIntro}>
                <div><p className={styles.sectionLabel}>MODEL IN ACTION</p><h3>Quan sát cách một người nói giàu kinh nghiệm xử lý</h3></div>
                <button type="button" onClick={() => speakDialogue(lesson.dialogue.map((line) => `${line.speaker}. ${line.text}`).join(' '))}><Sound /> NGHE HỘI THOẠI</button>
              </div>
              <div className={styles.dialogue}>
                {lesson.dialogue.map((line, index) => (
                  <div key={`${line.speaker}-${index}`} className={line.speaker === 'You' ? styles.yourLine : ''}>
                    <span>{line.speaker.slice(0, 1)}</span>
                    <section><small>{line.speaker}</small><p>{line.text}</p>{line.note && <aside><Lightbulb /> {line.note}</aside>}</section>
                  </div>
                ))}
              </div>
              <div className={styles.recallPrompt}>
                <span><Brain /></span>
                <div><small>ACTIVE RECALL</small><p>Trước khi làm bài tập, hãy đóng nội dung lại và tự nói thành tiếng 2 cụm từ bạn vừa học. Việc cố nhớ chủ động tạo dấu vết trí nhớ mạnh hơn chỉ đọc lại.</p></div>
              </div>
              <button type="button" className={styles.nextButton} onClick={markStudiedAndPractice}>{lessonProgress?.studied ? 'LUYỆN LẠI BÀI TẬP' : 'TÔI ĐÃ HỌC XONG — LUYỆN NGAY'} <ArrowRight /></button>
            </div>
          )}

          {phase === 'practice' && activeQuestion && (
            <div className={styles.practiceSection} role="tabpanel">
              <div className={styles.practiceTopline}>
                <span>CÂU {exerciseStep + 1}/{exerciseOrder.length}</span>
                <div>{exerciseOrder.map((_, index) => <i key={index} className={index <= exerciseStep ? styles.stepReached : ''} />)}</div>
                <strong>{correctCount} đúng</strong>
              </div>
              <p className={styles.questionLabel}>CHỌN PHƯƠNG ÁN TỐT NHẤT</p>
              <h3 className={styles.question}>{activeQuestion.prompt}</h3>
              <div className={styles.answers}>
                {activeQuestion.options.map((option, index) => {
                  const answered = selectedAnswer !== null;
                  const className = !answered ? '' : index === activeQuestion.answer ? styles.answerCorrect : index === selectedAnswer ? styles.answerWrong : styles.answerDim;
                  return <button type="button" key={option} disabled={answered} className={className} onClick={() => chooseAnswer(index)}><span>{String.fromCharCode(65 + index)}</span><p>{option}</p>{answered && index === activeQuestion.answer && <Check />}</button>;
                })}
              </div>
              {selectedAnswer !== null && (
                <div className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                  <div><strong>{isCorrect ? 'Chính xác — bạn đã hiểu sắc thái.' : 'Chưa đúng — đây là điểm cần nhớ.'}</strong><p>{activeQuestion.explanation}</p></div>
                  <button type="button" onClick={nextExercise}>{exerciseStep === exerciseOrder.length - 1 ? 'XEM KẾT QUẢ' : 'CÂU TIẾP'} <ArrowRight /></button>
                </div>
              )}
            </div>
          )}

          {phase === 'results' && (
            <div className={styles.resultSection} role="tabpanel">
              <div className={styles.resultMark}><Trophy /></div>
              <p className={styles.eyebrow}>SESSION COMPLETE</p>
              <h3>{correctCount}/{exerciseOrder.length} câu chính xác</h3>
              <p>{missed.length === 0 ? 'Rất tốt — bạn đã nắm được cả ngôn ngữ lẫn chiến lược của bài này.' : `Bạn đã hoàn thành lượt học. Ôn lại ${missed.length} câu sai ngay bây giờ sẽ giúp kiến thức bám lâu hơn.`}</p>
              <div className={styles.resultStats}>
                <div><span>ĐIỂM LƯỢT NÀY</span><strong>{Math.round((correctCount / exerciseOrder.length) * 100)}%</strong></div>
                <div><span>ĐIỂM TỐT NHẤT</span><strong>{progress[lesson.id]?.bestScore ?? 0}%</strong></div>
                <div><span>SỐ LƯỢT LUYỆN</span><strong>{progress[lesson.id]?.attempts ?? 0}</strong></div>
              </div>
              <div className={styles.resultActions}>
                {missed.length > 0 && <button type="button" className={styles.nextButton} onClick={() => startPractice(missed)}>LUYỆN LẠI CÂU SAI <Brain /></button>}
                <button type="button" className={styles.secondaryButton} onClick={() => startPractice()}>LÀM LẠI TOÀN BỘ</button>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function speakDialogue(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function BrandMark() {
  return <svg className={styles.brandMark} viewBox="0 0 46 52" aria-hidden="true"><path d="M23 2 42 9v15c0 12-8 21-19 26C12 45 4 36 4 24V9L23 2Z" fill="currentColor" opacity=".2"/><path d="M23 5 39 11v13c0 10-6.5 18-16 22.7C13.5 42 7 34 7 24V11L23 5Z" fill="none" stroke="currentColor" strokeWidth="2.3"/><path d="m14 15 9 5 9-5-3 10 3 3H14l3-3-3-10Z" fill="currentColor"/></svg>;
}

function Svg({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}
const Check = () => <Svg><path d="m5 12 4 4L19 6" /></Svg>;
const Chevron = () => <Svg><path d="m9 5 7 7-7 7" /></Svg>;
const ArrowRight = () => <Svg><path d="M5 12h14M14 7l5 5-5 5" /></Svg>;
const ArrowLeft = () => <Svg><path d="M19 12H5m5 5-5-5 5-5" /></Svg>;
const Briefcase = () => <Svg><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></Svg>;
const Sound = () => <Svg><path d="M5 9v6h4l5 4V5L9 9H5Zm12 0c1.5 1.5 1.5 4.5 0 6m2-9c3 3 3 9 0 12"/></Svg>;
const Lightbulb = () => <Svg><path d="M9 18h6m-5 3h4m3-11a5 5 0 1 0-8 4c.7.6 1 1.4 1 2h4c0-.6.3-1.4 1-2a5 5 0 0 0 2-4Z"/></Svg>;
const Brain = () => <Svg><path d="M9.5 4A3 3 0 0 0 5 6.6 3.5 3.5 0 0 0 4 13a3 3 0 0 0 4 4.5A3 3 0 0 0 12 20V5a3 3 0 0 0-2.5-1Zm5 0A3 3 0 0 1 19 6.6a3.5 3.5 0 0 1 1 6.4 3 3 0 0 1-4 4.5A3 3 0 0 1 12 20V5a3 3 0 0 1 2.5-1Z"/><path d="M8 9c2 0 3 1 4 3m4-3c-2 0-3 1-4 3"/></Svg>;
const Trophy = () => <Svg><path d="M8 4h8v5c0 4-2 6-4 6s-4-2-4-6V4Z"/><path d="M8 7H4v2c0 3 2 4 5 4m7-6h4v2c0 3-2 4-5 4M12 15v4m-4 2h8"/></Svg>;
