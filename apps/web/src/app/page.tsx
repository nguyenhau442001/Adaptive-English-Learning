'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import questionBank, { type ToeicQuestion } from '@/lib/question-bank';
import styles from './page.module.css';

const SKILL_ZONES = [
  {
    name: 'Thính Giác',
    english: 'LISTENING',
    href: '/practice?part=1',
    icon: 'headphones',
    color: 'cyan',
    description: 'Bắt tín hiệu, phá bẫy âm thanh',
  },
  {
    name: 'Tốc Đọc',
    english: 'READING',
    href: '/practice?part=5',
    icon: 'book',
    color: 'violet',
    description: 'Đọc nhanh, hạ gục từ khóa',
  },
  {
    name: 'Hùng Biện',
    english: 'SPEAKING',
    href: '/speaking',
    icon: 'mic',
    color: 'orange',
    description: 'Phản xạ chuẩn, nói đầy uy lực',
  },
  {
    name: 'Bút Lực',
    english: 'WRITING',
    href: '/writing',
    icon: 'pen',
    color: 'green',
    description: 'Triển khai ý, tung đòn thuyết phục',
  },
] as const;

const QUESTIONS = questionBank as ToeicQuestion[][];

type GearLoadout = { helmet: boolean; sword: boolean; shield: boolean };
type GameSave = { xp: number; gems: number; wins: number; correct: number; skillProgress: number[]; gear: GearLoadout };
type Battle = { zone: number; step: number; hp: number; selected: number | null; finished: boolean };

const DEFAULT_SAVE: GameSave = {
  xp: 0,
  gems: 50,
  wins: 0,
  correct: 0,
  skillProgress: [0, 0, 0, 0],
  gear: { helmet: true, sword: true, shield: true },
};
const RANKS = [
  { name: 'TÂN BINH', minXp: 0, color: '#8fa4aa' },
  { name: 'ĐỒNG', minXp: 1000, color: '#c87a4a' },
  { name: 'BẠC', minXp: 2500, color: '#b8ced4' },
  { name: 'VÀNG', minXp: 4500, color: '#f2c14e' },
  { name: 'BẠCH KIM', minXp: 7000, color: '#54d5ca' },
  { name: 'KIM CƯƠNG', minXp: 10000, color: '#63b8ff' },
  { name: 'CAO THỦ', minXp: 14000, color: '#d58cff' },
] as const;

function getRank(totalXp: number) {
  let index = 0;
  for (let rankIndex = RANKS.length - 1; rankIndex >= 0; rankIndex -= 1) {
    if (totalXp >= RANKS[rankIndex].minXp) {
      index = rankIndex;
      break;
    }
  }
  const current = RANKS[index];
  const next = RANKS[index + 1];
  const progress = next
    ? Math.round(((totalXp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;
  return { current, next, progress, remaining: next ? next.minXp - totalXp : 0 };
}

export default function ArenaPage() {
  const [save, setSave] = useState<GameSave>(DEFAULT_SAVE);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [rankUp, setRankUp] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem('vu-dai-toeic-save');
    queueMicrotask(() => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<GameSave>;
          setSave({
            ...DEFAULT_SAVE,
            ...parsed,
            skillProgress: parsed.skillProgress ?? DEFAULT_SAVE.skillProgress,
            gear: { ...DEFAULT_SAVE.gear, ...parsed.gear },
          });
        } catch { /* dùng dữ liệu mặc định */ }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem('vu-dai-toeic-save', JSON.stringify(save));
  }, [save, loaded]);

  const level = Math.floor(save.xp / 1000) + 1;
  const xp = save.xp % 1000;
  const xpPercent = xp / 10;
  const mastery = Math.min(100, Math.round(save.skillProgress.reduce((sum, value) => sum + value, 0) / 4));
  const rank = getRank(save.xp);

  function startBattle(zone = 1) {
    const firstQuestion = Math.floor(Math.random() * QUESTIONS[zone].length);
    setBattle({ zone, step: firstQuestion, hp: 100, selected: null, finished: false });
    if (zone === 0 && 'speechSynthesis' in window) {
      window.setTimeout(() => speak(QUESTIONS[0][firstQuestion].prompt), 250);
    }
  }

  function chooseAnswer(index: number) {
    if (!battle || battle.selected !== null) return;
    const question = QUESTIONS[battle.zone][battle.step];
    const correct = index === question.answer;
    const nextHp = correct ? Math.max(0, battle.hp - 34) : battle.hp;
    setBattle({ ...battle, selected: index, hp: nextHp, finished: correct && nextHp === 0 });
    if (correct) {
      setSave((current) => ({
        ...(() => {
          const nextXp = current.xp + 120;
          const previousRank = getRank(current.xp).current.name;
          const promotedRank = getRank(nextXp).current.name;
          if (previousRank !== promotedRank) queueMicrotask(() => setRankUp(promotedRank));
          return {
            ...current,
            xp: nextXp,
            gems: current.gems + 5,
            correct: current.correct + 1,
            wins: nextHp === 0 ? current.wins + 1 : current.wins,
            skillProgress: current.skillProgress.map((value, zone) => zone === battle.zone ? Math.min(100, value + 4) : value),
          };
        })(),
      }));
    }
  }

  function nextStrike() {
    if (!battle) return;
    const nextStep = (battle.step + 1) % QUESTIONS[battle.zone].length;
    setBattle({ ...battle, step: nextStep, selected: null });
    if (battle.zone === 0) window.setTimeout(() => speak(QUESTIONS[0][nextStep].prompt), 100);
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = .88;
    window.speechSynthesis.speak(utterance);
  }

  function toggleGear(slot: keyof GearLoadout) {
    setSave((current) => ({
      ...current,
      gear: { ...current.gear, [slot]: !current.gear[slot] },
    }));
  }

  return (
    <main className={styles.arena}>
      <div className={styles.ambientGlow} />
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Vũ Đài TOEIC — trang chủ">
          <BrandMark />
          <span>
            <strong>VŨ ĐÀI</strong>
            <small>TOEIC</small>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          <Link className={styles.activeNav} href="/">Đấu trường</Link>
          <a href="#zones">Bản đồ</a>
          <a href="#profile">Kho đồ</a>
          <a href="#quests">Xếp hạng</a>
        </nav>

        <div className={styles.resources}>
          <span title="Năng lượng"><Icon name="bolt" /> 12/12</span>
          <span title="Tinh thạch"><Icon name="gem" /> {save.gems}</span>
          <div className={styles.miniAvatar} aria-hidden="true">K</div>
        </div>
      </header>

      <div className={styles.shell}>
        <section className={styles.welcomeRow}>
          <div>
            <p className={styles.eyebrow}>MÙA 01 · CON ĐƯỜNG 990</p>
            <h1>Chào mừng trở lại, <span>Đấu sĩ!</span></h1>
            <p>Một trận đấu mới đang chờ. Sẵn sàng nâng hạng chứ?</p>
          </div>
          <button type="button" onClick={() => startBattle(3)} className={styles.seasonBadge}>
            <span>MỤC TIÊU MÙA</span>
            <strong>900+</strong>
            <Icon name="chevron" />
          </button>
        </section>

        <div className={styles.dashboardGrid}>
          <div className={styles.mainColumn}>
            <section className={styles.battleCard}>
              <div className={styles.battleCopy}>
                <div className={styles.liveLabel}><i /> TRẬN ĐẤU ĐANG MỞ</div>
                <p className={styles.battleStage}>CHƯƠNG 4 · ẢI 12</p>
                <h2>Cuộc vây hãm<br /><span>Thành Phố Ngữ Pháp</span></h2>
                <p className={styles.battleDescription}>Vượt qua 20 câu hỏi Part 5 để phá lớp giáp cuối cùng của Chúa Tể Mệnh Đề.</p>

                <div className={styles.enemyHealth}>
                  <span>CHÚA TỂ MỆNH ĐỀ</span>
                  <b>{battle?.hp ?? 100}%</b>
                  <div><i style={{ width: `${battle?.hp ?? 100}%` }} /></div>
                </div>

                <div className={styles.battleActions}>
                  <button type="button" onClick={() => startBattle(1)} className={styles.primaryAction}>
                    <Icon name="swords" /> VÀO TRẬN
                  </button>
                  <span><Icon name="clock" /> 12–15 PHÚT</span>
                  <span><Icon name="star" /> +350 XP</span>
                </div>
              </div>
              <div className={styles.heroArt} aria-hidden="true">
                <div className={styles.heroAura} />
                <KnightLoadout gear={save.gear} />
                <span className={styles.damageOne}>+XP</span>
                <span className={styles.damageTwo}>990</span>
              </div>
            </section>

            <section className={styles.zonesSection} id="zones">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>CHỌN PHONG CÁCH CHIẾN ĐẤU</p>
                  <h2>Bốn khu vực kỹ năng</h2>
                </div>
                <span className={styles.localBadge}>LƯU TRÊN TRÌNH DUYỆT</span>
              </div>

              <div className={styles.zoneGrid}>
                {SKILL_ZONES.map((zone, index) => (
                  <button type="button" key={zone.english} onClick={() => startBattle(index)} className={`${styles.zoneCard} ${styles[zone.color]}`}>
                    <div className={styles.zoneIcon}><Icon name={zone.icon} /></div>
                    <div className={styles.zoneInfo}>
                      <small>{zone.english}</small>
                      <h3>{zone.name}</h3>
                      <p>{zone.description}</p>
                      <div className={styles.zoneProgress}>
                        <i style={{ width: `${save.skillProgress[index]}%` }} />
                      </div>
                    </div>
                    <div className={styles.zoneLevel}>LV.{Math.max(1, Math.ceil(save.skillProgress[index] / 10))}</div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.sideColumn}>
            <section className={styles.playerCard} id="profile">
              <div className={styles.cardTopline}>
                <span>HỒ SƠ ĐẤU SĨ</span>
                <button aria-label="Tùy chọn hồ sơ">•••</button>
              </div>
              <div className={styles.playerIdentity}>
                <div className={styles.avatarFrame}><span>K</span><b>{level}</b></div>
                <div>
                  <h2>Knight Learner</h2>
                  <p style={{ color: rank.current.color }}><Icon name="shield" /> {rank.current.name}</p>
                </div>
              </div>
              <div className={styles.rankJourney}>
                <span>{rank.next ? `${rank.remaining} XP ĐẾN HẠNG ${rank.next.name}` : 'ĐÃ ĐẠT HẠNG CAO NHẤT'}</span>
                <strong>{rank.progress}%</strong>
                <div><i style={{ width: `${rank.progress}%`, background: rank.current.color }} /></div>
              </div>
              <div className={styles.xpRow}>
                <span>LEVEL {level}</span><span>{xp} / 1000 XP</span>
                <div><i style={{ width: `${xpPercent}%` }} /></div>
              </div>
              <div className={styles.playerStats}>
                <div><strong>{save.correct}</strong><span>ĐÒN CHÍ MẠNG</span></div>
                <div><strong>{mastery}%</strong><span>THÔNG THẠO</span></div>
                <div><strong>04</strong><span>KỸ NĂNG</span></div>
              </div>
              <div className={styles.gearPanel}>
                <div><span>TRANG BỊ</span><small>CHẠM ĐỂ THÁO / GẮN</small></div>
                <div className={styles.gearGrid}>
                  <GearButton label="MŨ ARC" src="/characters/knight/helmet-arc.png" equipped={save.gear.helmet} onClick={() => toggleGear('helmet')} />
                  <GearButton label="KIẾM" src="/characters/knight/sword-cyan.png" equipped={save.gear.sword} onClick={() => toggleGear('sword')} />
                  <GearButton label="KHIÊN" src="/characters/knight/shield-cyan.png" equipped={save.gear.shield} onClick={() => toggleGear('shield')} />
                </div>
              </div>
              <button type="button" onClick={() => startBattle(0)} className={styles.secondaryAction}>LUYỆN PHẢN XẠ NGHE <Icon name="arrow" /></button>
            </section>

            <section className={styles.questCard} id="quests">
              <div className={styles.sectionHeading}>
                <div><p className={styles.eyebrow}>NHIỆM VỤ HÔM NAY</p><h2>Nhận thưởng</h2></div>
                <span className={styles.questCount}>{Math.min(3, save.wins)}/3</span>
              </div>
              <Quest onClick={() => startBattle(0)} icon="flame" title="Phá ải Thính Giác" reward="+360 XP" done={save.skillProgress[0] >= 30} />
              <Quest onClick={() => startBattle(1)} icon="target" title="Thắng 1 trận Tốc Đọc" reward="+360 XP" done={save.wins >= 1} />
              <Quest onClick={() => startBattle(2)} icon="mic" title="Hạ boss Hùng Biện" reward="RƯƠNG BẠC" done={save.skillProgress[2] >= 30} />
            </section>

            <button type="button" onClick={() => startBattle(save.wins % 4)} className={styles.rankBanner}>
              <div><Icon name="trophy" /></div>
              <span><small>ĐẤU TRƯỜNG XẾP HẠNG</small><strong>Thi thử 4 kỹ năng</strong></span>
              <Icon name="arrow" />
            </button>
          </aside>
        </div>
      </div>

      {battle && (
        <div className={styles.battleOverlay} role="dialog" aria-modal="true" aria-label="Trận đấu TOEIC">
          <div className={styles.battleModal}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>{SKILL_ZONES[battle.zone].english} · ĐÒN {battle.step + 1}</p>
                <h2>{SKILL_ZONES[battle.zone].name}</h2>
              </div>
              <button type="button" onClick={() => setBattle(null)} aria-label="Rời trận">×</button>
            </div>

            <div className={styles.modalBossRow}>
              <span>CHÚA TỂ MỆNH ĐỀ</span><b>{battle.hp} HP</b>
              <div><i style={{ width: `${battle.hp}%` }} /></div>
            </div>

            {battle.finished ? (
              <div className={styles.victoryPanel}>
                <div><Icon name="trophy" /></div>
                <p className={styles.eyebrow}>VICTORY</p>
                <h3>Boss đã bị hạ!</h3>
                <p>Bạn nhận được <strong>+360 XP</strong> và <strong>+15 tinh thạch</strong>.</p>
                <button type="button" className={styles.primaryAction} onClick={() => setBattle(null)}>NHẬN CHIẾN LỢI PHẨM</button>
              </div>
            ) : (
              <>
                {battle.zone === 0 && (
                  <button type="button" className={styles.listenButton} onClick={() => speak(QUESTIONS[0][battle.step].prompt)}>
                    <Icon name="headphones" /> PHÁT TÍN HIỆU
                  </button>
                )}
                <div className={styles.questionMeta}>
                  <span>{QUESTIONS[battle.zone][battle.step].focus}</span>
                  <span>{QUESTIONS[battle.zone][battle.step].difficulty}</span>
                </div>
                <p className={`${styles.questionPrompt} ${battle.zone === 0 ? styles.listeningPrompt : ''}`}>
                  {battle.zone === 0 ? 'Chọn ý nghĩa chính xác nhất của câu bạn vừa nghe.' : QUESTIONS[battle.zone][battle.step].prompt}
                </p>
                <div className={styles.answerGrid}>
                  {QUESTIONS[battle.zone][battle.step].options.map((option, index) => {
                    const isAnswer = index === QUESTIONS[battle.zone][battle.step].answer;
                    const stateClass = battle.selected === null ? '' : isAnswer ? styles.correctAnswer : battle.selected === index ? styles.wrongAnswer : styles.dimAnswer;
                    return (
                      <button type="button" key={option} className={stateClass} onClick={() => chooseAnswer(index)} disabled={battle.selected !== null}>
                        <span>{String.fromCharCode(65 + index)}</span>{option}
                      </button>
                    );
                  })}
                </div>
                {battle.selected !== null && (
                  <div className={battle.selected === QUESTIONS[battle.zone][battle.step].answer ? styles.correctFeedback : styles.wrongFeedback}>
                    <strong>{battle.selected === QUESTIONS[battle.zone][battle.step].answer ? 'CHÍ MẠNG! +120 XP' : 'BOSS ĐÃ CHẶN ĐÒN'}</strong>
                    <p className={styles.mainExplanation}>{QUESTIONS[battle.zone][battle.step].explanation}</p>
                    <div className={styles.explanationGrid}>
                      <section>
                        <small>BẢN DỊCH</small>
                        <p>{QUESTIONS[battle.zone][battle.step].translation}</p>
                      </section>
                      <section>
                        <small>CHÌA KHÓA GIẢI NHANH</small>
                        <p>{QUESTIONS[battle.zone][battle.step].rule}</p>
                      </section>
                      <section className={styles.trapNote}>
                        <small>BẪY TOEIC</small>
                        <p>{QUESTIONS[battle.zone][battle.step].trap}</p>
                      </section>
                    </div>
                    <details className={styles.choiceAnalysis}>
                      <summary>Phân tích từng phương án</summary>
                      <ol>
                        {QUESTIONS[battle.zone][battle.step].choiceNotes.map((note, index) => (
                          <li key={note} className={index === QUESTIONS[battle.zone][battle.step].answer ? styles.correctChoiceNote : ''}>
                            <b>{String.fromCharCode(65 + index)}</b><span>{note}</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                    <button className={styles.nextStrike} type="button" onClick={nextStrike}>{battle.selected === QUESTIONS[battle.zone][battle.step].answer ? 'TUNG ĐÒN TIẾP' : 'THỬ CÂU KHÁC'} <Icon name="arrow" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {rankUp && (
        <div className={styles.rankUp} role="status">
          <div><Icon name="shield" /></div>
          <span><small>THĂNG HẠNG!</small><strong>{rankUp}</strong></span>
          <button type="button" onClick={() => setRankUp(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <nav className={styles.mobileNav} aria-label="Điều hướng di động">
        <Link href="/"><Icon name="swords" /><span>Đấu trường</span></Link>
        <a href="#zones"><Icon name="map" /><span>Bản đồ</span></a>
        <a href="#profile"><Icon name="gem" /><span>Kho đồ</span></a>
        <a href="#quests"><Icon name="trophy" /><span>Xếp hạng</span></a>
      </nav>
    </main>
  );
}

function Quest({ onClick, icon, title, reward, done = false }: { onClick: () => void; icon: IconName; title: string; reward: string; done?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={styles.questItem}>
      <div className={done ? styles.questDone : ''}><Icon name={done ? 'check' : icon} /></div>
      <span><strong>{title}</strong><small>{reward}</small></span>
      <Icon name="chevron" />
    </button>
  );
}

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 46 52" aria-hidden="true">
      <path d="M23 2 42 9v15c0 12-8 21-19 26C12 45 4 36 4 24V9L23 2Z" fill="currentColor" opacity=".22" />
      <path d="M23 5 39 11v13c0 10-6.5 18-16 22.7C13.5 42 7 34 7 24V11L23 5Z" fill="none" stroke="currentColor" strokeWidth="2.3" />
      <path d="m14 15 9 5 9-5-3 10 3 3H14l3-3-3-10Z" fill="currentColor" />
      <path d="M17 32h12M19 36h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function KnightLoadout({ gear }: { gear: GearLoadout }) {
  return (
    <div className={styles.characterStage}>
      {gear.sword && <Image className={styles.characterSword} src="/characters/knight/sword-cyan.png" alt="" width={233} height={1183} priority />}
      <Image className={styles.characterBase} src="/characters/knight/base.png" alt="" width={1254} height={1254} priority />
      {gear.helmet && <Image className={styles.characterHelmet} src="/characters/knight/helmet-arc.png" alt="" width={407} height={611} priority />}
      {gear.shield && <Image className={styles.characterShield} src="/characters/knight/shield-cyan.png" alt="" width={571} height={1161} priority />}
    </div>
  );
}

function GearButton({ label, src, equipped, onClick }: { label: string; src: string; equipped: boolean; onClick: () => void }) {
  return (
    <button type="button" className={equipped ? styles.gearEquipped : ''} onClick={onClick} aria-pressed={equipped}>
      <span><Image src={src} alt="" width={44} height={44} /></span>
      <small>{label}</small>
      <b>{equipped ? 'ĐANG GẮN' : 'ĐÃ THÁO'}</b>
    </button>
  );
}

type IconName = 'bolt' | 'gem' | 'chevron' | 'swords' | 'clock' | 'star' | 'arrow' | 'headphones' | 'book' | 'mic' | 'pen' | 'shield' | 'flame' | 'target' | 'trophy' | 'check' | 'map';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    bolt: <path d="m13 2-7 11h6l-1 9 7-12h-6l1-8Z" />,
    gem: <><path d="m4 8 4-5h8l4 5-8 13L4 8Z"/><path d="M4 8h16M8 3l4 5 4-5M12 8v13"/></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    swords: <><path d="m14 4 6-2-2 6L7 19l-3 1 1-3L16 6M5 4l15 15M5 19l-2 2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    headphones: <><path d="M4 13V11a8 8 0 0 1 16 0v2"/><path d="M7 12H4v7h4v-7Zm13 0h-4v7h4v-7Z"/></>,
    book: <><path d="M4 5c4-1 6 0 8 2v13c-2-2-4-3-8-2V5Z"/><path d="M20 5c-4-1-6 0-8 2v13c2-2 4-3 8-2V5Z"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></>,
    pen: <><path d="m4 20 4-1L19 8l-3-3L5 16l-1 4Z"/><path d="m13 8 3 3M14 4l2-2 4 4-2 2"/></>,
    shield: <path d="M12 3 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z" />,
    flame: <path d="M13 2c1 5-4 6-1 10 1-2 3-3 4-5 3 3 4 6 2 10-2 5-10 6-13 1-3-5 1-9 4-12 0 3 1 4 2 5-1-5 2-6 2-9Z" />,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m12 12 8-8M16 4h4v4"/></>,
    trophy: <><path d="M8 4h8v5c0 4-2 6-4 6s-4-2-4-6V4Z"/><path d="M8 7H4v2c0 3 2 4 5 4m7-6h4v2c0 3-2 4-5 4M12 15v4m-4 2h8"/></>,
    check: <path d="m5 12 4 4L19 6" />,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
