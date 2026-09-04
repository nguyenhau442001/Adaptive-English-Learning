'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDeck, getWord, type FlashcardWord } from '@/lib/flashcard-decks';
import {
  countDeck,
  EXAMPLE_SPEECH_RATES,
  filterByStatus,
  getFlashcardState,
  getStreak,
  markKnown,
  markUnknown,
  resetDeck,
  saveDeckOrder,
  setPref,
  shuffled,
  type FlashcardState,
  type StatusFilter,
} from '@/lib/flashcard-store';

interface DeckSummary {
  slug: string;
  name: string;
  blurb: string;
  count: number;
}

type Screen = { view: 'picker' } | { view: 'deck'; slug: string };

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unknown', label: 'Chưa nhớ' },
  { key: 'known', label: 'Đã nhớ' },
  { key: 'unseen', label: 'Chưa học' },
];

function speak(text: string, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = Math.min(2, Math.max(0.25, rate));
  window.speechSynthesis.speak(u);
}

export function FlashcardApp({ decks }: { decks: DeckSummary[] }) {
  const [state, setState] = useState<FlashcardState | null>(null);
  const [screen, setScreen] = useState<Screen>({ view: 'picker' });

  useEffect(() => {
    queueMicrotask(() => setState(getFlashcardState()));
  }, []);

  const refresh = useCallback(() => setState(getFlashcardState()), []);

  if (state === null) {
    return <p className="text-neutral-500">Đang đọc tiến độ trên trình duyệt…</p>;
  }

  if (screen.view === 'deck') {
    return (
      <DeckView
        slug={screen.slug}
        state={state}
        onBack={() => {
          setScreen({ view: 'picker' });
          refresh();
        }}
        onChange={refresh}
      />
    );
  }

  return (
    <DeckPicker
      decks={decks}
      state={state}
      onPick={(slug) => setScreen({ view: 'deck', slug })}
    />
  );
}

function DeckPicker({
  decks,
  state,
  onPick,
}: {
  decks: DeckSummary[];
  state: FlashcardState;
  onPick: (slug: string) => void;
}) {
  const streak = getStreak(state);
  const total = decks.find((d) => d.slug === 'all')?.count ?? 0;
  const known = getDeck('all') ? countDeck(getDeck('all')!.wordIds, state).known : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <span>
          Đã nhớ <strong>{known}</strong> / {total} từ
        </span>
        {streak > 0 && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            🔥 {streak} ngày liên tục
          </span>
        )}
      </div>

      <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
        Chọn bộ từ để học. Vuốt phải / bấm <b>Đã nhớ</b> nếu nhớ, vuốt trái / <b>Chưa nhớ</b> nếu chưa.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {decks.map((d) => {
          const counts = getDeck(d.slug)
            ? countDeck(getDeck(d.slug)!.wordIds, state)
            : { total: d.count, known: 0, unknown: 0, unseen: d.count };
          const pct = counts.total ? Math.round((counts.known / counts.total) * 100) : 0;
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => onPick(d.slug)}
              className="rounded-lg border border-neutral-200 p-4 text-left transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="font-medium">{d.name}</div>
              <div className="mt-0.5 text-xs text-neutral-500">{d.blurb}</div>
              <div className="mt-2 text-xs text-neutral-500">{d.count} từ</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <div className="h-full bg-green-600" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-xs text-neutral-500">Đã nhớ {counts.known} / {counts.total}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DeckView({
  slug,
  state,
  onBack,
  onChange,
}: {
  slug: string;
  state: FlashcardState;
  onBack: () => void;
  onChange: () => void;
}) {
  const deck = getDeck(slug);
  const [tab, setTab] = useState<'cards' | 'overview'>('cards');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [hideMeaning, setHideMeaning] = useState(state.prefs.hideMeaning);
  const [rate, setRate] = useState(state.prefs.exampleSpeechRate);
  const [jumpId, setJumpId] = useState<string | null>(null);

  const counts = deck ? countDeck(deck.wordIds, state) : { total: 0, known: 0, unknown: 0, unseen: 0 };

  if (!deck) {
    return (
      <div>
        <button type="button" onClick={onBack} className="text-sm text-blue-600 underline">
          ← Chọn bộ khác
        </button>
        <p className="mt-4">Không tìm thấy bộ từ.</p>
      </div>
    );
  }

  function toggleHide() {
    const v = !hideMeaning;
    setHideMeaning(v);
    setPref('hideMeaning', v);
  }

  function changeRate(v: number) {
    setRate(v);
    setPref('exampleSpeechRate', v);
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-blue-600 underline">
        ← Chọn bộ khác
      </button>
      <h2 className="mt-2 text-lg font-medium">{deck.name}</h2>

      <div className="mt-3 flex gap-1 border-b border-neutral-200 text-sm dark:border-neutral-800">
        <TabButton active={tab === 'cards'} onClick={() => setTab('cards')}>
          🗂 Học flashcard
        </TabButton>
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
          📋 Tổng quan
        </TabButton>
      </div>

      {tab === 'overview' ? (
        <Overview
          deck={deck}
          state={state}
          onOpenWord={(id) => {
            setJumpId(id);
            setFilter('all');
            setTab('cards');
          }}
        />
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <Stat n={counts.total} label="tổng" />
            <Stat n={counts.unknown} label="chưa nhớ" className="text-red-600" />
            <Stat n={counts.known} label="đã nhớ" className="text-green-600" />
            <Stat n={counts.unseen} label="chưa học" className="text-neutral-500" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setJumpId(null);
                  setFilter(f.key);
                }}
                className={`rounded-full border px-3 py-1 ${
                  filter === f.key && !jumpId
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-neutral-300 text-neutral-600 dark:border-neutral-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-neutral-500">Tốc độ đọc ví dụ</span>
            <select
              value={rate}
              onChange={(e) => changeRate(Number(e.target.value))}
              className="rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
            >
              {EXAMPLE_SPEECH_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}x
                </option>
              ))}
            </select>
          </div>

          <StudyPane
            key={`${slug}:${filter}:${jumpId ?? ''}`}
            deck={deck}
            slug={slug}
            state={state}
            filter={filter}
            jumpId={jumpId}
            hideMeaning={hideMeaning}
            rate={rate}
            onToggleHide={toggleHide}
            onChange={onChange}
            onClearJump={() => setJumpId(null)}
          />
        </div>
      )}
    </div>
  );
}

function StudyPane({
  deck,
  slug,
  state,
  filter,
  jumpId,
  hideMeaning,
  rate,
  onToggleHide,
  onChange,
  onClearJump,
}: {
  deck: { name: string; wordIds: string[] };
  slug: string;
  state: FlashcardState;
  filter: StatusFilter;
  jumpId: string | null;
  hideMeaning: boolean;
  rate: number;
  onToggleHide: () => void;
  onChange: () => void;
  onClearJump: () => void;
}) {
  const [order, setOrder] = useState<string[]>(() => {
    const idxOrder = state.order[slug];
    if (idxOrder && idxOrder.length === deck.wordIds.length) {
      return idxOrder.map((i) => deck.wordIds[i]).filter(Boolean);
    }
    return deck.wordIds.slice();
  });
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [showUnknown, setShowUnknown] = useState(false);

  const filteredOrder = jumpId ? [jumpId] : filterByStatus(order, filter, state);
  const current: FlashcardWord | undefined =
    filteredOrder.length > 0 ? getWord(filteredOrder[idx % filteredOrder.length]) : undefined;

  function advance() {
    setRevealed(false);
    if (jumpId) onClearJump();
    setIdx((i) => i + 1);
  }

  function grade(known: boolean) {
    const w = current;
    if (!w) return;
    const next = known ? markKnown(w.id) : markUnknown(w.id);
    onChange();
    if (known && countDeck(deck.wordIds, next).known === deck.wordIds.length) {
      setCelebrate(true);
    }
    advance();
  }

  function doShuffle() {
    const shuffledIds = shuffled(deck.wordIds);
    setOrder(shuffledIds);
    setIdx(0);
    setRevealed(false);
    const map = new Map(deck.wordIds.map((id, i) => [id, i]));
    saveDeckOrder(slug, shuffledIds.map((id) => map.get(id)!));
  }

  function doReset() {
    if (!confirm(`Học lại từ đầu bộ "${deck.name}"? Trạng thái đã nhớ/chưa nhớ của bộ này sẽ bị xoá.`)) return;
    resetDeck(deck.wordIds);
    setOrder(deck.wordIds.slice());
    setIdx(0);
    setRevealed(false);
    setCelebrate(false);
    onChange();
  }

  const pos = filteredOrder.length === 0 ? 0 : (idx % filteredOrder.length) + 1;

  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={doShuffle} className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700">
          🔀 Xáo trộn
        </button>
        <button
          type="button"
          onClick={onToggleHide}
          className={`rounded border px-3 py-1 ${
            hideMeaning ? 'border-orange-400 text-orange-600' : 'border-neutral-300 text-neutral-600 dark:border-neutral-700'
          }`}
        >
          {hideMeaning ? '🙈 Đang ẩn nghĩa' : '👁 Đang hiện nghĩa'}
        </button>
        <button type="button" onClick={doReset} className="rounded border border-neutral-300 px-3 py-1 dark:border-neutral-700">
          ↻ Học lại từ đầu
        </button>
      </div>

      {current ? (
        <>
          <p className="mt-4 text-xs text-neutral-500">
            {pos} / {filteredOrder.length}
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${filteredOrder.length ? (pos / filteredOrder.length) * 100 : 0}%` }}
            />
          </div>

          <Card
            word={current}
            revealed={revealed}
            hideMeaning={hideMeaning}
            rate={rate}
            onFlip={() => setRevealed((r) => !r)}
            onGrade={grade}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => grade(false)}
              className="rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              Chưa nhớ
            </button>
            <button
              type="button"
              onClick={() => grade(true)}
              className="rounded bg-green-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              Đã nhớ
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowUnknown((s) => !s)}
            className="mt-3 text-xs text-blue-600 underline"
          >
            {showUnknown ? 'Ẩn từ chưa nhớ' : 'Hiển thị từ chưa nhớ'}
          </button>
          {showUnknown && (
            <ol className="mt-2 list-decimal space-y-1 rounded border border-neutral-200 p-3 pl-7 text-sm dark:border-neutral-800">
              {deck.wordIds
                .filter((id) => state.status[id] === 'unknown')
                .map((id) => getWord(id))
                .filter((w): w is FlashcardWord => Boolean(w))
                .map((w) => (
                  <li key={w.id}>
                    <b>{w.term}</b>
                    {w.ipa && <span className="text-neutral-500"> {w.ipa}</span>} —{' '}
                    {w.meanings[0]?.translation || w.meanings[0]?.definition}
                  </li>
                ))}
              {deck.wordIds.filter((id) => state.status[id] === 'unknown').length === 0 && (
                <li className="list-none">Chưa có từ nào đánh dấu &quot;Chưa nhớ&quot;.</li>
              )}
            </ol>
          )}
        </>
      ) : (
        <div className="mt-6 rounded border border-neutral-200 p-6 text-center dark:border-neutral-800">
          <p className="font-medium">Không có từ trong bộ lọc này</p>
          <p className="mt-1 text-sm text-neutral-500">Đổi bộ lọc hoặc bấm &quot;Học lại từ đầu&quot;.</p>
        </div>
      )}

      {celebrate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setCelebrate(false)}
        >
          <div className="max-w-sm rounded-xl bg-white p-6 text-center dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">🏆</div>
            <p className="mt-2 text-lg font-semibold">Xuất sắc!</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Bạn đã nhớ toàn bộ <strong>{deck.wordIds.length}</strong> từ trong bộ <strong>{deck.name}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setCelebrate(false)}
              className="mt-4 rounded bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  word,
  revealed,
  hideMeaning,
  rate,
  onFlip,
  onGrade,
}: {
  word: FlashcardWord;
  revealed: boolean;
  hideMeaning: boolean;
  rate: number;
  onFlip: () => void;
  onGrade: (known: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; active: boolean; locked: 'h' | 'v' | null }>({ x: 0, active: false, locked: null });
  const [dx, setDx] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        onFlip();
      } else if (e.key === '1') onGrade(false);
      else if (e.key === '2') onGrade(true);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFlip, onGrade]);

  const showBack = revealed;

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button, select, details')) return;
    drag.current = { x: e.clientX, active: true, locked: null };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return;
    const delta = e.clientX - drag.current.x;
    if (!drag.current.locked && Math.abs(delta) > 8) drag.current.locked = 'h';
    if (drag.current.locked === 'h') {
      ref.current?.setPointerCapture(e.pointerId);
      setDx(delta);
    }
  }
  function onPointerUp() {
    const { locked } = drag.current;
    const delta = dx;
    drag.current.active = false;
    setDx(0);
    if (locked !== 'h') {
      onFlip();
      return;
    }
    if (Math.abs(delta) >= 90) onGrade(delta > 0);
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current.active = false;
        setDx(0);
      }}
      style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 20}deg)` : undefined }}
      className="mt-3 min-h-[15rem] cursor-pointer touch-pan-y select-none rounded-xl border border-neutral-200 p-6 transition-transform dark:border-neutral-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold">{word.term}</p>
          {word.ipa && !hideMeaning && <p className="mt-1 text-neutral-500">{word.ipa}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(word.term, 1);
            }}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
            aria-label="Nghe phát âm"
          >
            🔊
          </button>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {word.context}
          </span>
          <span className="text-[11px] text-neutral-400">độ khó {'●'.repeat(word.difficulty)}{'○'.repeat(5 - word.difficulty)}</span>
        </div>
      </div>

      {showBack ? (
        <div className="mt-4 space-y-3">
          {word.meanings.map((m, i) => (
            <div key={i}>
              <span className="text-sm italic text-neutral-500">{m.pos}</span>{' '}
              <span className="text-neutral-800 dark:text-neutral-200">{m.definition}</span>
              {m.translation && <div className="text-sm text-neutral-600 dark:text-neutral-400">{m.translation}</div>}
            </div>
          ))}
          {word.examples.map((ex, i) => (
            <div key={i} className="rounded bg-neutral-50 p-2 text-sm dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-700 dark:text-neutral-300">{ex.sentence}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(ex.sentence, rate);
                  }}
                  className="shrink-0 rounded-full border border-neutral-300 px-2 text-xs dark:border-neutral-700"
                  aria-label="Nghe câu ví dụ"
                >
                  🔊
                </button>
              </div>
              {ex.translation && <div className="mt-0.5 text-neutral-500">{ex.translation}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-400">Nhấn / phím Space để xem nghĩa · phím 1 = chưa nhớ · 2 = đã nhớ</p>
      )}
    </div>
  );
}

function Overview({
  deck,
  state,
  onOpenWord,
}: {
  deck: { wordIds: string[]; name: string };
  state: FlashcardState;
  onOpenWord: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const rows = deck.wordIds
    .map((id) => getWord(id))
    .filter((w): w is FlashcardWord => Boolean(w))
    .filter((w) => {
      const s = state.status[w.id];
      if (status === 'unseen' && s) return false;
      if ((status === 'known' || status === 'unknown') && s !== status) return false;
      if (!q) return true;
      const hay = `${w.term} ${w.ipa ?? ''} ${w.meanings.map((m) => m.definition + ' ' + (m.translation ?? '')).join(' ')}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm từ, IPA hoặc nghĩa…"
          className="flex-1 rounded border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unseen">Chưa học</option>
          <option value="unknown">Chưa nhớ</option>
          <option value="known">Đã nhớ</option>
        </select>
      </div>
      <p className="mt-2 text-xs text-neutral-500">{rows.length} từ</p>
      <ul className="mt-2 divide-y divide-neutral-200 rounded border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {rows.map((w) => {
          const s = state.status[w.id];
          return (
            <li key={w.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(w.term, 1);
                }}
                className="shrink-0 rounded-full border border-neutral-300 px-2 text-xs dark:border-neutral-700"
                aria-label="Nghe phát âm"
              >
                🔊
              </button>
              <button type="button" onClick={() => onOpenWord(w.id)} className="flex-1 text-left">
                <span className="font-medium">{w.term}</span>
                {w.ipa && <span className="ml-2 text-xs text-neutral-500">{w.ipa}</span>}
                <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                  {w.meanings[0]?.translation || w.meanings[0]?.definition}
                </span>
              </button>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                  s === 'known'
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : s === 'unknown'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                }`}
              >
                {s === 'known' ? 'Đã nhớ' : s === 'unknown' ? 'Chưa nhớ' : 'Chưa học'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 ${
        active ? 'border-blue-600 font-medium text-blue-700 dark:text-blue-300' : 'border-transparent text-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ n, label, className = '' }: { n: number; label: string; className?: string }) {
  return (
    <div className="rounded border border-neutral-200 p-2 dark:border-neutral-800">
      <div className={`text-lg font-semibold ${className}`}>{n}</div>
      <div className="text-[11px] text-neutral-500">{label}</div>
    </div>
  );
}
