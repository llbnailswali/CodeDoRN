# CodeDo Achievements & Badges — Product, Asset, and Engineering Specification

**Status:** Implementation proposal / source of truth to validate against existing app code  
**Scope:** React Native CodeDo app, Kotlin learning path, quizzes, practice, lessons, Worlds, bosses, streaks  
**Catalog:** 51 badges across 7 categories (39 previously planned + 12 quiz badges)  
**Important:** The 51 badge images are **required deliverables, not yet generated** by this specification. This file defines their production briefs and acceptance criteria.

## 1. Goals and non-goals

Build a simple, collectible **Achievements** screen: category filters, category-grouped 3-column badge grid, and a detail bottom sheet. Show earned, in-progress, and locked badges. Automatically unlock badges from verifiable learning events and preserve them across sessions/devices where accounts sync.

**Non-goals for v1:** leaderboards, social feeds, new currencies, XP farming, a legendary carousel, a trophy hero, weekly promotions, or creating new gameplay solely for badges.

**Existing features to confirm in code:** Quiz session model and topic IDs; definition of first attempt; lesson mastery; Write & Run / Fix Code unique task IDs; Explore/Predict stage tracking; World unlock/completion and boss results; Daily Challenge identity; streak algorithm; current account storage/backend and offline sync. Do not assume a feature or event exists just because a badge refers to it.

## 2. UI / UX specification

### Navigation

- Profile tab → **Achievements** screen; native back returns to Profile.
- Header: back, **Achievements**, earned count `18 / 51` (dynamic).
- Horizontally scrollable category chips: **All**, **First Steps**, **Coding & Debugging**, **Quiz Achievements**, **Consistency & Streaks**, **World & Lesson Mastery**, **Special Achievements**, **Long-Term Achievements**.
- **All** groups the grid under seven category headings, each with an icon and `earned / total` count; never a single undifferentiated 51-card grid.
- Selecting a category shows its heading and its badges only. Preserve category ordering and scroll position where feasible.
- Three-column badge cards, 2-line names, same heights, large image, no rarity paragraph on cards. Tapping opens the detail bottom sheet.
- Within each category, prefer fixed milestone order (e.g., 10→50→100) so tiles do not jump when earned; optionally sort unlocked first only if users explicitly prefer it.

### Card states

| State | Condition | Presentation |
|---|---|---|
| Unlocked | Earned record exists | Full-color artwork, small checkmark, no progress bar |
| In progress | Not earned; measurable progress > 0 | Colored or lightly muted artwork, thin purple bar and exact `current / target` |
| Locked | Not earned; no qualifying progress or prerequisite not available | Desaturated artwork, lock icon, no empty bar |

Some achievements are **binary** (e.g., perfect quiz session, comeback) or have **compound** requirements (CodeDo Legend): show a simple requirement or checklist rather than a misleading numerical bar. A streak achievement's progress should reflect the **current consecutive streak**, not all-time active days. The permanent unlocked state is never revoked when the streak breaks.

### Detail bottom sheet

Swipe-to-dismiss and close button; dim grid behind. Large hexagonal badge image (100–120dp), badge name, rarity pill, concise description, precise unlock criteria, progress or checklist if relevant, earned date when unlocked, and **one** contextual CTA only when meaningful (e.g., `Practice Quiz`, `Fix Code`, `Continue Learning`). Optional `Showcase on Profile` for earned badges only, maximum three favorites, if implemented. No redundant 'Accolade' or bonus panels; never promise XP unless an XP reward mechanism exists.

### Accessibility / states

44–48dp tap targets, VoiceOver/TalkBack labels with badge name/state/progress, text scaling, contrast not relying on color alone, loading/error/empty states, offline support, reduced-motion celebration, and stable screen on reopening. Screen reader should announce newly earned badges once, not repeatedly.

## 3. Canonical category IDs and catalog

Use stable IDs below as persisted identifiers. Display names can change later; IDs must not. Each badge belongs to exactly one category. `target` is an exact numerical milestone unless specified as a rule. **Rarity:** Common (silver), Uncommon (green), Rare (blue), Epic (purple), Legendary (gold).

### 3.1 First Steps — 4

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `hello_world` | Hello, World! | Common | Master first lesson | Rocket launching through `{}` |
| `code_initiate` | Code Initiate | Common | Complete 1 unique Write & Run exercise | Glowing coding keyboard |
| `bug_squasher` | Bug Squasher | Common | Complete 1 unique Fix Code exercise | Friendly robotic bug and wrench |
| `knowledge_seeker` | Knowledge Seeker | Common | Master 5 unique lessons | Open glowing book |

### 3.2 Coding & Debugging — 8

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `code_warrior` | Code Warrior | Uncommon | Complete 10 unique Write & Run exercises | Crossed code swords |
| `code_ninja` | Code Ninja | Rare | Complete 50 unique Write & Run exercises | Coding ninja mask |
| `code_master` | Code Master | Epic | Complete 100 unique Write & Run exercises | Ornate laptop and crown |
| `bug_hunter` | Bug Hunter | Uncommon | Complete 10 unique Fix Code exercises | Robotic bug and magnifier |
| `bug_exterminator` | Bug Exterminator | Rare | Complete 50 unique Fix Code exercises | Debug shield and tools |
| `debug_legend` | Debug Legend | Epic | Complete 100 unique Fix Code exercises | Golden debug wrench and shield |
| `perfect_run` | Perfect Run | Rare | Complete 5 unique exercises on first evaluated attempt | Bullseye and code brackets |
| `sharp_mind` | Sharp Mind | Epic | Complete 25 unique exercises on first evaluated attempt | Crystal brain and target |

### 3.3 Quiz Achievements — 12

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `quiz_rookie` | Quiz Rookie | Common | Answer 10 unique quiz questions correctly | Small brain and question mark |
| `quiz_explorer` | Quiz Explorer | Uncommon | Answer 50 unique quiz questions correctly | Quiz compass |
| `quiz_challenger` | Quiz Challenger | Uncommon | Answer 100 unique quiz questions correctly | Lightning quiz shield |
| `quiz_warrior` | Quiz Warrior | Rare | Answer 250 unique quiz questions correctly | Crossed quiz swords |
| `quiz_master` | Quiz Master | Epic | Answer 500 unique quiz questions correctly | Crown over quiz book |
| `quiz_legend` | Quiz Legend | Legendary | Answer 1,000 unique quiz questions correctly | Golden crowned brain |
| `first_strike` | First Strike | Uncommon | Answer 10 distinct questions correctly on their first evaluated attempt | Lightning bullseye |
| `perfect_score` | Perfect Score | Rare | Complete one eligible quiz session of ≥10 questions, all correct on first attempt | Gold perfect-score target |
| `sharp_thinker` | Sharp Thinker | Rare | Answer 50 unique questions correctly on first attempt | Precision brain |
| `flawless_mind` | Flawless Mind | Epic | Answer 100 unique questions correctly on first attempt | Purple crystal brain |
| `quiz_scholar` | Quiz Scholar | Epic | Correctly answer ≥20 unique questions in each of ≥5 distinct stable quiz topics | Graduation cap and quiz cards |
| `quiz_grandmaster` | Quiz Grandmaster | Legendary | Answer 2,000 unique quiz questions correctly | Ornate gold crown and brain |

**Quiz rules:** Count distinct canonical `questionId`s, not attempts or sessions. A question answered correctly at any time counts once toward total-correct milestones. First-attempt milestones require the **first evaluated submission ever for that user/question** to be correct; retries do not qualify. If the bank includes variants/duplicates, define canonical IDs before shipping. Topic badges require stable topic IDs; multi-topic questions need one designated primary topic or an explicit deterministic mapping. A perfect session requires ≥10 distinct questions, every question's first answer within that session correct, no resets/restarts that replace answers, and a completed valid session. For first-attempt global badges, use first ever submission across sessions, not first submission in a replay.

### 3.4 Consistency & Streaks — 6

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `spark_starter` | Spark Starter | Common | 3 consecutive qualifying learning days | Small spark |
| `on_fire` | On Fire | Uncommon | 7 consecutive qualifying learning days | Bright flame |
| `habit_builder` | Habit Builder | Rare | 14 consecutive qualifying learning days | Flame calendar |
| `unstoppable` | Unstoppable | Epic | 30 consecutive qualifying learning days | Phoenix flame |
| `century_coder` | Century Coder | Legendary | 100 consecutive qualifying learning days | Flame with 100-star motif |
| `coding_veteran` | Coding Veteran | Legendary | 365 distinct qualifying active learning days (not necessarily consecutive) | Veteran laurel and keyboard |

**Qualifying day:** At least one completed lesson stage, unique successful exercise, or eligible quiz answer/session (define centrally); simply launching the app does not qualify. Use user-selected learning timezone (or a stable persisted timezone policy) and a consistent local-day boundary; handle timezone changes, daylight saving, offline backfill, and device clock tampering. Count one active day maximum per calendar date.

### 3.5 World & Lesson Mastery — 9

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `first_conquest` | First Conquest | Uncommon | Master all lessons in World 1 | Flag over code landscape |
| `world_explorer` | World Explorer | Uncommon | Unlock 3 distinct Worlds | Adventure compass |
| `world_conqueror` | World Conqueror | Epic | Master 5 distinct Worlds | Crown and world map |
| `realm_master` | Realm Master | Legendary | Master all Worlds in a defined curriculum milestone set | Ornate realm crown |
| `lesson_collector` | Lesson Collector | Rare | Master 25 unique lessons | Stack of glowing books |
| `knowledge_champion` | Knowledge Champion | Epic | Master 100 unique lessons | Scholarly trophy |
| `boss_slayer` | Boss Slayer | Uncommon | Defeat first distinct World Boss | Sword and defeated dragon emblem |
| `boss_hunter` | Boss Hunter | Epic | Defeat 5 distinct World Bosses | Dragon hunter shield |
| `boss_legend` | Boss Legend | Legendary | Defeat all World Bosses in a defined milestone set | Legendary dragon trophy |

**Curriculum versioning:** For `realm_master` and `boss_legend`, freeze a versioned eligible World/Boss ID set when the milestone is published. Do not revoke earned badges when new content launches. `first_conquest` should use the actual World 1 ID, not a hardcoded display label. If a threshold exceeds released content, hide or mark as future achievement rather than imply it is currently achievable.

### 3.6 Special Achievements — 6

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `comeback_kid` | Comeback Kid | Rare | After ≥14 consecutive inactive local days, complete a qualifying lesson | Returning boomerang/rocket |
| `daily_challenger` | Daily Challenger | Rare | Complete 7 distinct Daily Challenges | Lightning calendar |
| `challenge_champion` | Challenge Champion | Epic | Complete 30 distinct Daily Challenges | Challenge trophy |
| `all_rounder` | All-Rounder | Rare | Complete ≥10 unique Write & Run AND ≥10 unique Fix Code exercises | Split code/debug shield |
| `perfectionist` | Perfectionist | Epic | Master 10 distinct lessons without a failed evaluated attempt in any applicable stage | Diamond check shield |
| `kotlin_champion` | Kotlin Champion | Legendary | Master all Kotlin lessons in a defined Kotlin curriculum milestone set | Faithful Kotlin symbol in ornate gold-purple frame |

**Clarifications:** Comeback uses the most recent qualifying activity date before the new qualifying lesson, not merely the last app-open timestamp. `perfectionist` needs immutable per-lesson first-attempt/failure history; if stage attempts are not currently recorded, ship only after instrumentation. Daily Challenges must have stable challenge instance IDs and validated completion criteria.

### 3.7 Long-Term Achievements — 6

| ID | Badge | Rarity | Unlock condition | Art subject |
|---|---|---|---|---|
| `problem_solver` | Problem Solver | Epic | Complete 200 unique practice exercises (Write & Run or Fix Code combined) | Interlocking code puzzle |
| `code_scientist` | Code Scientist | Rare | Successfully complete Explore stage in 50 distinct lessons | Code laboratory flask |
| `prediction_pro` | Prediction Pro | Rare | Correctly complete Predict stage first attempt in 25 distinct lessons | Crystal prediction orb |
| `debug_guardian` | Debug Guardian | Legendary | Complete 200 unique Fix Code exercises | Guardian shield and robotic bug |
| `challenge_ace` | Challenge Ace | Epic | Complete 10 distinct Daily Challenges on first evaluated attempt | Precision challenge arrow |
| `codedo_legend` | CodeDo Legend | Legendary | Master all Worlds in the defined milestone set, defeat all corresponding World Bosses, and complete 100 unique practice exercises | Signature CodeDo crown and coding shield |

**Note:** These are the previously agreed catalog requirements. Do not silently change CodeDo Legend to “earn the other 50 badges” or Kotlin Champion to “22 Worlds” unless product owners explicitly revise the catalog. The `debug_guardian` 200 target must be validated against released Fix Code content.

## 4. Badge image generation and asset pipeline — REQUIRED

**Deliverable:** Generate **51 distinct badge images**, one per catalog ID above, plus optional 7 category icons. Image generation is a separate production step; **no artwork is embedded in this Markdown file**.

### 4.1 Art direction

- **Style:** premium stylized 2.5D / 3D coding-adventure collectible, playful but mature, consistent with current CodeDo screenshot.
- **Silhouette:** common hexagonal medallion silhouette across all 51 assets; visually distinguish tiers via frame material, facets, trim, and ornamentation.
- **Rarity:** Common silver; Uncommon emerald; Rare sapphire; Epic amethyst; Legendary gold. Keep accessible differences beyond color.
- **Subjects:** use each row's **Art subject**; strong central icon and clean silhouette at 64–80dp; avoid tiny microdetails.
- **Background:** transparent RGBA; no background panel, text, user name, rarity word, numbers, or baked-in lock/checkmark/progress.
- **Kotlin:** only on Kotlin-specific badges; reproduce official symbol accurately from approved brand asset, subject to brand guidelines. Do not have image generation approximate a trademark when an official vector asset is available.
- **Consistency:** fixed frontal/isometric perspective, center placement, lighting direction, shadow softness, palette, stroke thickness, and frame proportions.
- **Locked state:** **derive in UI** by desaturation/opacity/overlay; do not generate another 51 locked images unless rendering limitations demand it.
- **User name:** dynamic UI text on badge detail/share artwork; never embedded in reusable image.

### 4.2 Asset outputs

- Source master: 1024×1024 transparent PNG (or editable source if available).
- Optimized runtime asset: WebP or PNG at appropriate pixel densities; target small enough for 51-image collection without visible artifacts (benchmark on actual devices rather than imposing a universal KB limit).
- Names: `assets/achievements/badges/<badge_id>.webp` and corresponding source master `artwork/source/<badge_id>.png`.
- Create `assets/achievements/badges/manifest.json` with ID, file path, dimensions, checksum, revision, and licensing/source notes.
- Generate 51 files and verify: all catalog IDs have exactly one asset, alpha channel, correct dimensions, no corrupt files, distinct silhouettes, consistent art direction, visual legibility at 64dp, and no text/logo errors.
- Build a contact sheet with all 51 assets and labels rendered **outside** artwork for art review; review each rarity tier and coding-theme cohesion.
- React Native Metro generally needs static asset paths for bundled images: generate a typed `badgeImages.ts` mapping badge IDs to literal `require('...')` calls; do not construct dynamic `require` paths.

### 4.3 Repeatable generation prompt template

> Create a single premium stylized 2.5D/3D achievement badge asset for the CodeDo Kotlin-learning mobile game. Centerpiece: **{ART_SUBJECT}**. Use the shared hexagonal medallion silhouette and **{RARITY_FRAME}** material. Friendly but mature game collectible, sharp silhouette readable at 64px, consistent front-facing three-quarter relief, top-left soft lighting, high-quality metallic bevels, subtle depth, saturated but controlled palette, transparent RGBA background. Exactly one badge. No words, letters, numerals, labels, usernames, locks, checkmarks, UI cards, borders outside the medallion, or watermarks. Preserve shared proportions and art direction with other CodeDo badges.

For Kotlin Champion, replace the AI-rendered Kotlin mark with the approved official logo in the artwork compositing workflow.

### 4.4 Image production batches

1. Produce **5 style anchors** first: `hello_world`, `bug_hunter`, `on_fire`, `quiz_master`, `kotlin_champion` (one per representative theme/rarity). Approve shared medallion template.
2. Produce 4 First Steps, 8 Coding & Debugging, 12 Quiz, 6 Streaks, 9 Worlds, 6 Special, 6 Long-Term images (51 total, including anchors).
3. Review contact sheet and revise outliers; optimize/export, verify static asset mapping and Android/iOS performance.

## 5. Technical architecture

### 5.1 Separate catalog, events, aggregates, and unlocks

```
Learning/Quiz/Practice/World action
       ↓ validated completion
Domain event (unique eventId, userId, occurredAt, stable content IDs)
       ↓ dedupe + persist
Achievement projection / aggregate counters and sets
       ↓ deterministic badge evaluator
Earned badge records + progress snapshot
       ↓
UI subscriptions → grid + detail sheet + optional unlock celebration
```

**Do not** calculate badges in React components. Build a domain service (`achievementEngine`) that accepts trusted normalized events or reconciled existing progress and returns deterministic results. For multi-device or competitive reward integrity, server should be authoritative; local optimistic UI may mirror results and reconcile on sync.

### 5.2 Suggested TypeScript models

```ts
type BadgeCategory =
  | 'first_steps' | 'coding_debugging' | 'quiz'
  | 'streaks' | 'world_mastery' | 'special' | 'long_term';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type BadgeStatus = 'locked' | 'in_progress' | 'unlocked';

type BadgeDefinition = {
  id: string; category: BadgeCategory; name: string;
  description: string; rarity: Rarity;
  rule: BadgeRule; artworkKey: string;
  curriculumSetVersion?: string;
  enabled: boolean;
};

type BadgeRule =
  | { type: 'counter'; metric: MetricKey; target: number }
  | { type: 'all_of'; rules: BadgeRule[] }
  | { type: 'milestone_set'; setId: string; metric: 'mastered_worlds' | 'mastered_lessons' | 'defeated_bosses' }
  | { type: 'boolean_event'; eventType: string };

type BadgeProgress = {
  badgeId: string; status: BadgeStatus;
  current?: number; target?: number;
  details?: Record<string, number | boolean | string>;
  unlockedAt?: string;
};

type AchievementEvent = {
  eventId: string; userId: string; type: string;
  occurredAt: string; schemaVersion: number;
  contentId?: string; sessionId?: string;
  questionId?: string; topicId?: string;
  attemptIndex?: number; isCorrect?: boolean;
  payload?: Record<string, unknown>;
};
```

**Important:** Generic `BadgeRule` examples do not fully encode compound session accuracy, comeback, or first-attempt predicates. Implement those as named, unit-tested evaluator functions; never fake them as plain counters. Persist event schema versions for migrations.

### 5.3 Canonical events to add or reuse

| Event | Required fields | Purpose |
|---|---|---|
| `lesson_stage_completed` | lessonId, stageId, attemptId, success, firstAttempt | Explore/Predict/perfectionist, qualifying day |
| `lesson_mastered` | lessonId, worldId, masteryVersion | Lesson/World/Kotlin milestones |
| `practice_exercise_completed` | exerciseId, mode (`write_run` / `fix_code`), firstAttempt, attemptId | Coding/debugging and mixed counts |
| `quiz_answer_evaluated` | canonical questionId, sessionId, topicId, attemptIndex, isCorrect | Unique correct, first-attempt quiz badges |
| `quiz_session_completed` | sessionId, uniqueQuestionIds, firstAttemptCorrectCount, validSession | Perfect Score |
| `daily_challenge_completed` | challengeInstanceId, firstAttempt | Daily Challenge milestones |
| `world_unlocked` | worldId | World Explorer |
| `world_mastered` | worldId, curriculumVersion | World mastery |
| `world_boss_defeated` | bossId, worldId, curriculumVersion | Boss milestones |
| `qualifying_learning_activity` | sourceEventId, localDate, timezonePolicy | Streaks and active-day count |

**Emit only after verified success**, not on button presses or merely running code. Repeated evaluation, retries, screen remounts, and API retries must not produce duplicate qualifying progress. Use deterministic event IDs where possible.

### 5.4 Aggregate data / storage

Maintain per-user aggregates plus exact ID sets (or deduplicated completion tables):

- Unique mastered lesson IDs; unique mastered/unlocked World IDs; defeated Boss IDs.
- Unique Write & Run and Fix Code completed exercise IDs; first-attempt success IDs.
- Unique quiz question IDs ever answered correctly; unique question IDs first-ever-attempt-correct; canonical first-attempt result by question ID.
- Per-topic distinct correctly answered question IDs (or deduped join table).
- Completed quiz session IDs and perfect eligible session IDs.
- Unique Daily Challenge instance IDs and first-attempt completed IDs.
- Qualifying local learning dates; current streak, longest streak, total distinct active days, last qualifying date.
- Explore and Predict stage completion/first-attempt results by lesson ID.
- Immutable earned badge records: `(userId, badgeId, unlockedAt, ruleVersion, triggeringEventId)` unique by `(userId, badgeId)`.
- Optional showcased badge IDs (max 3), validated as earned.

Avoid loading 2,100 question events every time the grid opens. Store deduplicated sets/rows and materialized counters; incrementally update on each new event. For accurate historical backfill, retain enough source records to recompute aggregates when logic changes.

### 5.5 Evaluation / idempotency pseudocode

```ts
async function handleVerifiedEvent(event: AchievementEvent) {
  await storage.transaction(async tx => {
    if (await tx.hasProcessedEvent(event.userId, event.eventId)) return;
    await tx.insertEvent(event);
    await projections.apply(tx, event); // upsert unique IDs and counters
    const changedMetrics = projections.metricsAffectedBy(event.type);
    for (const badge of catalog.forMetrics(changedMetrics)) {
      if (await tx.isEarned(event.userId, badge.id)) continue;
      const state = await evaluator.evaluate(tx, event.userId, badge);
      if (state.qualified) {
        await tx.insertEarnedBadgeIfAbsent({
          userId: event.userId, badgeId: badge.id,
          unlockedAt: event.occurredAt,
          triggeringEventId: event.eventId,
          ruleVersion: CURRENT_RULE_VERSION,
        });
      }
    }
    await tx.markProcessed(event.userId, event.eventId);
  });
}
```

**Atomicity:** Event insert, aggregate update, unlock insert, and processed marker must commit together. If backend event delivery is at-least-once, unique constraints guarantee idempotency. If local and server both evaluate, define one authoritative source and reconcile, rather than awarding twice.

### 5.6 Progress calculation examples

- `quiz_challenger`: `min(uniqueCorrectQuestionCount, 100) / 100`.
- `first_strike`: `min(uniqueFirstEverCorrectQuestionCount, 10) / 10`.
- `quiz_scholar`: show `topicsQualified / 5` plus per-topic details; count a topic only if its unique correct count ≥20.
- `all_rounder`: detail shows `Write & Run 7/10` and `Fix Code 8/10`; do not show one misleading overall `15/20` that hides the AND condition.
- `perfect_score`: binary; show criteria, not `0/1` progress unless a verified eligible perfect session exists.
- `code_warrior`: distinct successful Write & Run exercise IDs / 10.
- `on_fire`: current qualifying consecutive-day streak / 7; unlocked remains earned forever after the milestone.
- `realm_master`: mastered IDs intersect frozen milestone World set / frozen set size.
- `codedo_legend`: show three checks: World mastery, boss completion, and 100 unique exercises.

### 5.7 Backfill / migration

1. Audit existing persisted data and identify which badges can be derived reliably today.
2. Add schema/migrations, event instrumentation, canonical ID mapping, and a versioned catalog.
3. One-time backfill from historical lesson/practice/quiz completion records using dedupe; evaluate earned badges deterministically.
4. **Never fabricate first-attempt accuracy** when prior attempts were not recorded. Such badges can start tracking from feature launch or remain unavailable until history is sufficient; clearly communicate policy.
5. For historical streaks, backfill only if trustworthy dated learning activity exists; otherwise begin tracking on launch.
6. Reconcile counts against source data and keep an audit trail. Existing earned badges should not be removed by content additions or ordinary recalculation.

### 5.8 Offline, sync, and time correctness

- Persist verified offline actions locally with unique IDs and upload when online; dedupe server-side.
- Do not grant irreversible server rewards solely from untrusted client timestamps or client-reported correctness.
- Use server receipt time plus bounded offline-event validation where applicable; document timezone policy.
- If server is unavailable, show provisional progress only if clearly distinguishable; reconcile without duplicate unlock celebrations.
- Sync earned badges and progress on login/device change; account deletion should remove personal achievement records per product policy.

### 5.9 Performance

- Memoize catalog and progress selectors; avoid re-evaluating all 51 badges on each render.
- Use `FlatList`/`SectionList` with 3 columns or equivalent virtualized grouping; do not nest large unvirtualized scroll lists.
- Cache badge image assets and preload only visible/near-visible items.
- Derive progress from compact snapshots, not raw quiz attempt histories on screen load.
- Use stable keys (`badge.id`), fixed tile dimensions, image placeholders, and avoid expensive animated gradients across the entire grid.
- Benchmark cold load, filter switching, scroll FPS, and memory on a mid-range Android phone.

## 6. Suggested app modules / change checklist

**Paths below are illustrative; align to the existing CodeDo repository before creating files.**

```text
src/features/achievements/
  data/badgeCatalog.ts             # all 51 canonical definitions
  data/badgeImages.ts              # static require map, generated
  domain/achievementTypes.ts
  domain/achievementRules.ts       # pure evaluators
  domain/achievementEngine.ts      # event processing / unlocks
  domain/achievementSelectors.ts   # status, progress, category grouping
  services/achievementRepository.ts
  hooks/useAchievements.ts
  screens/AchievementsScreen.tsx
  components/BadgeCard.tsx
  components/BadgeCategoryHeader.tsx
  components/BadgeDetailSheet.tsx
  components/BadgeUnlockCelebration.tsx  # optional
  __tests__/...
assets/achievements/badges/        # 51 runtime images
artwork/source/                    # source masters and contact sheet
```

**Integration points to inspect and modify:**

1. **Profile tab:** Achievements navigation, dynamic unlocked count, optional showcase favorites.
2. **Lesson engine:** emit validated stage completion/mastery, attempt correctness and first-attempt status.
3. **Practice engine:** emit unique successful Write & Run/Fix Code completions; preserve first evaluated attempt.
4. **Quiz engine:** canonical IDs for 2,100+ questions; answer evaluations, topic mapping, session completion, first-attempt and perfect-session semantics.
5. **Daily Challenge:** stable instance IDs and successful/first-attempt completion events.
6. **World / boss progression:** distinct World/Boss IDs, versioned eligible sets, validated completions.
7. **Learning activity/streak:** shared qualifying-day service and timezone policy.
8. **Persistence/backend:** dedupe, aggregates, immutable earned records, migrations, sync, user-specific security rules.
9. **App navigation:** new screen and detail sheet; contextual CTAs route to existing feature screens.
10. **Analytics (optional):** badge_viewed, badge_unlocked, badge_cta_clicked, category_selected; never use analytics events as the authoritative badge source.

## 7. Badge catalog configuration and versioning

Keep user-facing copy and unlock rules in a **single typed catalog**, not duplicated in UI. Assign `ruleVersion` to each badge. When content counts change or rule semantics are intentionally modified, decide explicitly whether prior awards are grandfathered, migrated, or whether a new badge ID is required. For complete-the-curriculum badges, store frozen eligible content sets and their version IDs. Localization should translate names/descriptions but not IDs.

Suggested launch gates: hide unavailable achievements (e.g., 200 Fix Code tasks if fewer exist), or mark them as future content without misleading progress. Confirm actual number of Worlds and quizzes before finalizing dynamic labels.

## 8. Test plan / acceptance criteria

### Unit tests

- Every catalog ID unique; exactly 51 entries; category totals **4+8+12+6+9+6+6=51**.
- Exactly one valid artwork mapping per badge ID; rarity and category enum values valid.
- Threshold boundaries: 0, target−1, target, target+1.
- Duplicate exercise/question/event does not increase counts.
- First incorrect then correct counts for total quiz-correct, **not** first-attempt-correct.
- First correct counts for both appropriate quiz metrics.
- Perfect Score fails for 9 questions, one wrong answer, replay/reset exploits, duplicate question IDs.
- Quiz Scholar requires five distinct topics each meeting 20 distinct correct IDs.
- All-Rounder requires both mode-specific thresholds; CodeDo Legend requires all three conditions.
- Streak handles missed day, timezone, DST, offline replay; unlocked streak badges stay unlocked.
- Curriculum expansion does not revoke earned mastery badges.
- `insertEarnedBadgeIfAbsent` prevents duplicate unlocks on retries/races.

### Integration / E2E tests

- Lesson → event → progress → earned badge → Profile count update.
- Practice and quiz completions produce correct progress, with app restart persistence.
- Category `All` shows seven grouped sections and exactly 51 unique badges; filtered categories show correct counts.
- Bottom sheet shows correct locked, in-progress, and unlocked content and accessible close.
- Offline completion syncs once and does not double-award on a second device.
- Historical backfill preserves trustworthy completions without inventing first attempts.
- Locked artwork is visibly muted, in-progress has exact count, earned has check; no duplicate UI labels.
- Assets render crisply in light/dark modes on Android and iOS.

### Definition of done

- [ ] Final catalog/rules approved by product and matched to real content capacity.
- [ ] 51 final transparent badge images generated, reviewed, optimized, and mapped.
- [ ] Screen, grouping, category chips, and bottom sheet implemented.
- [ ] Domain event sources instrumented across all relevant app modules.
- [ ] Dedupe-safe aggregation and deterministic unlock engine implemented.
- [ ] Storage, migrations, offline/sync, and historical backfill policy implemented.
- [ ] Unit/integration/E2E tests pass and analytics verified.
- [ ] Accessibility and performance reviewed on real Android device.

## 9. Recommended delivery phases

**Phase 0 — Repository audit and rules freeze:** Inspect current code, data models, question bank IDs, actual content totals, persistence, and attempt history. Finalize eligibility, missing instrumentation, and backend authority.

**Phase 1 — Visual assets:** Approve five anchor badge images, generate remaining 46, produce contact sheet, optimize and map assets.

**Phase 2 — UI shell:** Implement Achievements screen, category-grouped grid, category chips, states, and detail sheet with fixture data.

**Phase 3 — Domain tracking:** Add missing lesson/practice/quiz/world/boss/daily-challenge events, unique IDs, and attempt history. Introduce durable aggregate tables and dedupe.

**Phase 4 — Badge engine:** Implement and test all 51 evaluators, versioned content sets, unlock persistence, and sync.

**Phase 5 — Migration and rollout:** Backfill historical trustworthy data, reconcile totals, run QA/performance/accessibility, and gradually release with telemetry.

## 10. Decisions required before coding

1. What is CodeDo's actual backend/local database and cross-device sync architecture?
2. Does the Quiz tab have stable `questionId`, `topicId`, and `sessionId`? Are quiz sessions ≥10 questions? Is first-ever attempt persisted?
3. How many Worlds, lessons, bosses, Write & Run tasks, and Fix Code tasks are currently released?
4. Are Explore/Predict stage attempts, lesson mastery, and Daily Challenge first attempts already recorded?
5. What counts as a qualifying learning day, and how should offline/timezone changes work?
6. Should unachievable long-term badges be hidden until content is released?
7. Are XP bonuses and Profile badge showcase actually in scope for v1?
8. Are Kotlin logo licensing/brand assets and CodeDo art style anchors approved?

**Guiding rule:** A badge should represent a real, auditable learner accomplishment. Never award one based solely on a screen visit, duplicate submission, or unverified client action.
