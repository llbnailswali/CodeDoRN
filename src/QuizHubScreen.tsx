import React from 'react';
import { BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BW, Icon, fz } from './shell';
import { lh } from './parts';
import { FONT, Palette } from './theme';
import { QuizQuestion } from './quizQuestions';
import { QuizBossWithQuestions, QuizPass, isMissedAnswer, QuizProgress, QuizSetWithQuestions, fullQuizQuestions, quizPassStatus, worldStats } from './quizData';

// One step of the path: a numbered circle, a line down to the next step, and the step's card.
function Step({ mark, done, current, last, dark, muted, track, children }: { mark: string; done: boolean; current: boolean; last: boolean; dark: boolean; muted: string; track: string; children: React.ReactNode }) {
  return (
    <View style={s.stepRow}>
      <View style={s.rail}>
        <View>
          <View style={[s.dot, done ? { backgroundColor: '#10B981', borderColor: '#10B981' } : current ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { borderColor: dark ? 'rgba(255,255,255,0.25)' : '#CBD5E1' }]}>
            <Text style={[s.dotText, { color: done || current ? '#FFFFFF' : muted }]}>{mark}</Text>
          </View>
        </View>
        {!last && <View style={[s.line, { backgroundColor: done ? '#10B981' : track }]} />}
      </View>
      <View style={{ flex: 1, paddingBottom: 12 }}>{children}</View>
    </View>
  );
}

// TEMPORARY (for reviewing questions): a difficulty filter above the steps. With Easy, Medium or Hard chosen, a set or the Boss plays only those
// questions, as practice (nothing is saved). Delete DIFFICULTY_FILTER, the `level` state and the chips row to remove it.
const DIFFICULTY_FILTER = true;
type Level = 'all' | 'easy' | 'medium' | 'hard';

// The quiz hub of one World, laid out as one path: the progress card with ONE main button (continue with the next unfinished step), then the
// sets as numbered steps joined by a line, and the Boss quiz as the final step. There is no separate "full quiz": the steps in order are it,
// and they share one record of answered questions. There is no per-lesson list.
export function QuizHubScreen({ p, world, questions, sets, boss, progress, pass, topInset, onBack, onStart, onExplore, onReview, onReviewSet, onResetWorld }: {
  p: Palette;
  world: { order: number; title: string };
  questions: QuizQuestion[];
  /** Quiz sets of this World: a few related lessons practised together. */
  sets: QuizSetWithQuestions[];
  /** The World's final challenge: the last step, locked until the sets are answered. */
  boss: QuizBossWithQuestions | null;
  progress: QuizProgress;
  /** Questions answered in the current pass: sets and the full quiz start where the learner left off. */
  pass: QuizPass;
  topInset: number;
  onBack: () => void;
  /** Play one set (or the boss quiz). */
  onStart: (questions: QuizQuestion[], title: string) => void;
  /** Play a finished set again as practice: nothing is saved, so it stays finished. */
  onExplore: (questions: QuizQuestion[], title: string) => void;
  /** Only the questions missed and not yet answered correctly. */
  onReview: () => void;
  /** The missed questions of one set (or the boss quiz): a set is finished only when none is left to review. */
  onReviewSet: (questions: QuizQuestion[], title: string) => void;
  /** Clears every answer, stat and pass mark of this World. */
  onResetWorld: () => void;
}) {
  const dark = p.isDark;
  const title = dark ? '#F8FAFC' : '#1C2033';
  const muted = dark ? '#94A3B8' : '#64748B';
  const indigo = dark ? '#A5B4FC' : '#4F46E5';
  const amber = dark ? '#FCD34D' : '#B45309';
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(79,70,229,0.15)';

  // Lesson names (an ordinary, non-set question carries its lesson's name as its topic).
  const lessonNames = React.useMemo(() => new Map(questions.filter((q) => !q.setId).map((q) => [q.lessonId, q.topic])), [questions]);
  // Resetting wipes the World's progress, so it asks first (a bottom sheet; Android Back closes it).
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [level, setLevel] = React.useState<Level>('all');
  const byLevel = (list: QuizQuestion[]) => (level === 'all' ? list : list.filter((q) => q.difficulty === level));
  React.useEffect(() => {
    if (!confirmReset) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setConfirmReset(false);
      return true;
    });
    return () => sub.remove();
  }, [confirmReset]);
  const stats = React.useMemo(() => worldStats({ order: world.order, title: world.title, questions }, progress), [world.order, world.title, questions, progress]);
  const tiles = [
    { label: 'Seen', value: stats.seen, color: indigo },
    { label: 'Correct', value: stats.correct, color: '#10B981' },
    { label: 'To review', value: stats.missed, color: '#F43F5E' },
    { label: 'Not tried', value: Math.max(0, stats.total - stats.seen), color: muted },
  ];
  // The count shown on the progress card covers EVERY question of the World: the sets and the Boss quiz.
  const full = React.useMemo(() => quizPassStatus([...fullQuizQuestions(sets), ...(boss?.questions ?? [])], pass, progress), [sets, boss, pass, progress]);
  const isMissed = (q: QuizQuestion) => isMissedAnswer(progress[q.id]);
  const answeredPercent = full.total ? Math.round((full.answered / full.total) * 100) : 0;
  const setStatuses = sets.map((set) => quizPassStatus(set.questions, pass, progress));
  const setsDone = setStatuses.every((status) => status.state === 'retake');
  const setsFinished = setStatuses.filter((status) => status.state === 'retake').length;
  const currentStep = setStatuses.findIndex((status) => status.state !== 'retake'); // the first set not yet finished
  const bossStatus = boss ? quizPassStatus(boss.questions, pass, progress) : null;
  const bossMastered = !!boss && boss.questions.every((q) => (progress[q.id]?.correct ?? 0) > 0);

  return (
    <View style={{ flex: 1, backgroundColor: p.page }}>
      <View style={[s.toolbar, { paddingTop: topInset, backgroundColor: p.page, borderBottomColor: p.headerBorder }]}>
        <View style={s.toolbarInner}>
          <Pressable onPress={onBack} style={[s.back, { backgroundColor: p.card, borderColor: p.cardBorder }]}><Icon name="arrow_back" size={21} color={title} /></Pressable>
          <View style={{ flex: 1 }}><Text style={[s.kicker, { color: indigo }]}>WORLD_{String(world.order).padStart(2, '0')} · QUIZ</Text><Text numberOfLines={1} style={[s.heading, { color: title }]}>{world.title}</Text></View>
          <Pressable onPress={() => setConfirmReset(true)} hitSlop={6} accessibilityLabel="Reset this World's quiz progress" style={[s.back, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
            <Icon name="refresh" size={20} color={muted} />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        ListHeaderComponent={
          <View style={{ gap: 14, paddingBottom: 6 }}>
            <View style={[s.stats, { backgroundColor: dark ? '#17163A' : '#EEF2FF', borderColor: dark ? 'rgba(129,140,248,0.35)' : '#C7D2FE' }]}>
              <Text style={[s.kicker, { color: indigo }]}>YOUR PROGRESS</Text>
              <View style={s.statsMain}>
                <Text style={[s.statsPercent, { color: indigo }]}>{full.answered}</Text>
                <Text style={[s.statsCaption, { color: muted }]}>
                  <Text style={{ color: title, fontFamily: FONT.outfit.b }}>of {full.total}</Text> answered
                </Text>
                <View style={[s.pctBadge, { backgroundColor: dark ? 'rgba(99,102,241,0.25)' : '#E0E7FF' }]}>
                  <Text style={[s.pctText, { color: dark ? '#C7D2FE' : '#4338CA' }]}>{answeredPercent}%</Text>
                </View>
              </View>
              <View style={[s.track, { backgroundColor: track }]}>
                <View style={[s.fill, { width: `${answeredPercent}%` }]} />
              </View>
              <View style={s.tiles}>
                {tiles.map((tile) => (
                  <View key={tile.label} style={[s.tile, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)' }]}>
                    <Text style={[s.tileValue, { color: tile.color }]}>{tile.value}</Text>
                    <Text style={[s.tileLabel, { color: muted }]}>{tile.label}</Text>
                  </View>
                ))}
              </View>
              <View style={s.hintRow}>
                <Text style={[s.hint, { color: muted, flex: 1 }]}>{setsFinished} of {sets.length} sets done</Text>
              </View>
            </View>
            {stats.missed > 0 && (
              <Pressable
                onPress={onReview}
                style={[s.reviewBtn, dark ? { backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.35)' } : { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}
              >
                <Icon name="replay" size={18} exact color={dark ? '#FECDD3' : '#BE123C'} />
                <Text style={[s.reviewBtnText, { color: dark ? '#FECDD3' : '#BE123C' }]}>Review mistakes · {stats.missed}</Text>
                <Icon name="arrow_forward" size={18} exact color={dark ? '#FECDD3' : '#BE123C'} />
              </Pressable>
            )}
            {DIFFICULTY_FILTER && (
              <View style={{ gap: 8 }}>
                <Text style={[s.section, { color: muted }]}>FILTER BY LEVEL (TEMPORARY · PLAYS AS PRACTICE)</Text>
                <View style={s.levelRow}>
                  {(['all', 'easy', 'medium', 'hard'] as Level[]).map((l) => {
                    const count = l === 'all' ? null : [...sets.flatMap((set) => set.questions), ...(boss?.questions ?? [])].filter((q) => q.difficulty === l).length;
                    const on = level === l;
                    return (
                      <Pressable key={l} onPress={() => setLevel(l)} style={[s.levelChip, on ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { borderColor: dark ? 'rgba(255,255,255,0.18)' : '#CBD5E1' }]}>
                        <Text style={[s.levelText, { color: on ? '#FFFFFF' : muted }]}>{l === 'all' ? 'All' : `${l[0].toUpperCase()}${l.slice(1)} · ${count}`}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            <Text style={[s.section, { color: muted, marginTop: 6 }]}>STEP BY STEP</Text>
          </View>
        }
        renderItem={({ item: set, index }) => {
          const status = setStatuses[index];
          const names = set.lessonIds.map((id) => lessonNames.get(id)).filter(Boolean).join(' · ');
          const levelQuestions = byLevel(set.questions);
          const done = status.state === 'retake';
          const action = status.state === 'start' ? 'Start' : status.state === 'continue' ? 'Continue' : status.state === 'review' ? `Review ${status.missed}` : 'Retake';
          return (
            <Step mark={String(index + 1)} done={done} current={index === currentStep} last={index === sets.length - 1 && !boss} dark={dark} muted={muted} track={track}>
              <Pressable
                onPress={() =>
                  level !== 'all'
                    ? levelQuestions.length > 0 && onExplore(levelQuestions, `${set.title} · ${level[0].toUpperCase()}${level.slice(1)}`)
                    : status.state === 'review'
                    ? onReviewSet(set.questions.filter(isMissed), set.title)
                    : done
                    ? onExplore(set.questions, set.title)
                    : onStart(set.questions, set.title)
                }
                style={[s.card, { backgroundColor: dark ? '#121826' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.10)' : '#E2E8F0' }]}
              >
                <View style={s.cardTop}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.cardTitle, { color: title }]}>{set.title}</Text>
                    <Text style={[s.meta, { color: muted }]}>
                      {level !== 'all' ? `${levelQuestions.length} ${level} questions` : status.state === 'continue' ? `${status.answered}/${status.total} answered` : `${status.total} questions`}
                      {status.missed > 0 && <Text style={{ color: dark ? '#FDA4AF' : '#BE123C', fontFamily: FONT.outfit.b }}> · {status.missed} to review</Text>}
                    </Text>
                  </View>
                  {done ? (
                    <View style={s.doneTick}>
                      <Icon name="check" size={16} exact color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[s.pill, { backgroundColor: status.state === 'review' ? '#E11D48' : '#6366F1' }]}>
                      <Text style={[s.pillText, { color: '#FFFFFF' }]}>{action}</Text>
                    </View>
                  )}
                </View>
                {names !== '' && <Text numberOfLines={2} style={[s.names, { color: muted }]}>{names}</Text>}
              </Pressable>
            </Step>
          );
        }}
        ListFooterComponent={
          boss && bossStatus ? (
            <Step mark="★" done={bossMastered} current={false} last dark={dark} muted={muted} track={track}>
              <Pressable
                onPress={() =>
                  level !== 'all'
                    ? byLevel(boss.questions).length > 0 && onExplore(byLevel(boss.questions), `Boss quiz · ${level[0].toUpperCase()}${level.slice(1)}`)
                    : bossStatus.state === 'review'
                    ? onReviewSet(boss.questions.filter(isMissed), 'Boss quiz')
                    : bossStatus.state === 'retake'
                    ? onExplore(boss.questions, 'Boss quiz')
                    : onStart(boss.questions, 'Boss quiz')
                }
                disabled={level === 'all' && !setsDone}
                style={[s.card, !setsDone && { opacity: 0.6 }, dark ? { backgroundColor: '#2A1D08', borderColor: 'rgba(251,191,36,0.45)' } : { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}
              >
                <View style={s.cardTop}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.kicker, { color: amber }]}>BOSS QUIZ · FINAL CHALLENGE</Text>
                    <Text style={[s.cardTitle, { color: title }]}>{boss.title}</Text>
                    <Text style={[s.meta, { color: muted }]}>{!setsDone ? 'Finish all the sets to unlock.' : `${bossStatus.total} questions that combine everything.`}</Text>
                  </View>
                  {!setsDone ? (
                    <View style={[s.pill, s.pillRow, { backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)' }]}>
                      <Icon name="lock" size={13} exact color={muted} />
                      <Text style={[s.pillText, { color: muted }]}>Locked</Text>
                    </View>
                  ) : bossMastered ? (
                    <View style={[s.pill, s.pillRow, { backgroundColor: dark ? 'rgba(16,185,129,0.22)' : '#D1FAE5' }]}>
                      <Icon name="check" size={14} exact color={dark ? '#6EE7B7' : '#047857'} />
                      <Text style={[s.pillText, { color: dark ? '#6EE7B7' : '#047857' }]}>Mastered</Text>
                    </View>
                  ) : (
                    bossStatus.state === 'retake' ? (
                      <View style={s.doneTick}>
                        <Icon name="check" size={16} exact color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={[s.pill, { backgroundColor: bossStatus.state === 'review' ? '#E11D48' : '#F59E0B' }]}>
                        <Text style={[s.pillText, { color: '#FFFFFF' }]}>{bossStatus.state === 'start' ? 'Start' : bossStatus.state === 'continue' ? 'Continue' : `Review ${bossStatus.missed}`}</Text>
                      </View>
                    )
                  )}
                </View>
              </Pressable>
            </Step>
          ) : null
        }
      />
      {confirmReset && (
        <Pressable style={s.sheetBackdrop} onPress={() => setConfirmReset(false)}>
          <Pressable
            onPress={() => {}}
            style={[s.sheet, dark ? { backgroundColor: '#121826', borderColor: 'rgba(255,255,255,0.10)' } : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}
          >
            <View style={[s.sheetHandle, { backgroundColor: dark ? '#475569' : '#CBD5E1' }]} />
            <Text style={[s.cardTitle, { color: title }]}>Reset {world.title} quiz progress?</Text>
            <Text style={[s.sheetText, { color: muted }]}>
              This clears every answer, your stats and your progress in all the sets and the Boss quiz of this World. It cannot be undone.
            </Text>
            <Pressable onPress={() => setConfirmReset(false)} style={[s.sheetBtn, { backgroundColor: '#6366F1' }]}>
              <Text style={[s.sheetBtnText, { color: '#FFFFFF' }]}>Keep my progress</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setConfirmReset(false);
                onResetWorld();
              }}
              style={[s.sheetBtn, { borderWidth: BW, borderColor: dark ? 'rgba(244,63,94,0.5)' : '#FDA4AF' }]}
            >
              <Text style={[s.sheetBtnText, { color: dark ? '#FDA4AF' : '#BE123C' }]}>Reset</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  toolbar: { borderBottomWidth: BW, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 3 },
  toolbarInner: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 12, borderWidth: BW, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  heading: { fontFamily: FONT.outfit.b, fontSize: fz(18), lineHeight: lh(18, 1.35), includeFontPadding: false },
  stats: { borderRadius: 20, borderWidth: BW, padding: 18, gap: 12 },
  statsMain: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  statsPercent: { fontFamily: FONT.outfit.b, fontSize: fz(44), lineHeight: lh(44, 1.05), includeFontPadding: false },
  statsCaption: { flex: 1, fontFamily: FONT.body, fontSize: fz(13), lineHeight: lh(13, 1.4), paddingBottom: 6, includeFontPadding: false },
  pctBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  pctText: { fontFamily: FONT.mono.b, fontSize: fz(14), lineHeight: lh(14, 1.2), includeFontPadding: false },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', zIndex: 20 },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: BW, borderBottomWidth: 0, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 12 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 4 },
  sheetText: { fontFamily: FONT.body, fontSize: fz(13), lineHeight: lh(13, 1.45), includeFontPadding: false },
  sheetBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetBtnText: { fontFamily: FONT.outfit.b, fontSize: fz(15), lineHeight: lh(15, 1.3), includeFontPadding: false },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 2 },
  tileValue: { fontFamily: FONT.mono.b, fontSize: fz(18), lineHeight: lh(18, 1.2), includeFontPadding: false },
  tileLabel: { fontFamily: FONT.body, fontSize: fz(11), lineHeight: lh(11, 1.3), includeFontPadding: false },
  reviewBtn: { minHeight: 48, borderRadius: 14, borderWidth: BW, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewBtnText: { flex: 1, fontFamily: FONT.outfit.b, fontSize: fz(14), lineHeight: lh(14, 1.3), includeFontPadding: false },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  hint: { fontFamily: FONT.body, fontSize: fz(12), lineHeight: lh(12, 1.4), includeFontPadding: false },
  levelRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelChip: { borderRadius: 999, borderWidth: BW, paddingHorizontal: 12, paddingVertical: 6 },
  levelText: { fontFamily: FONT.mono.b, fontSize: fz(11), includeFontPadding: false },
  section: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  stepRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 28, alignItems: 'center' },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: FONT.mono.b, fontSize: fz(12), lineHeight: lh(12, 1.2), includeFontPadding: false },
  line: { flex: 1, width: 3, borderRadius: 2, marginTop: 4, marginBottom: 4 },
  card: { borderRadius: 16, borderWidth: BW, padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: FONT.outfit.b, fontSize: fz(16), lineHeight: lh(16, 1.3), includeFontPadding: false },
  names: { fontFamily: FONT.body, fontSize: fz(12), lineHeight: lh(12, 1.4), includeFontPadding: false },
  meta: { fontFamily: FONT.body, fontSize: fz(12), lineHeight: lh(12, 1.4), includeFontPadding: false },
  doneTick: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillText: { fontFamily: FONT.outfit.b, fontSize: fz(12), lineHeight: lh(12, 1.2), includeFontPadding: false },
});
