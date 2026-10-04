import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BW, Header, fz } from './shell';
import { FONT, Palette } from './theme';
import { CONTENT_STATS as C } from './contentStats';

// Totals of what the app contains: worlds, lessons, the five lesson stages, the Quiz tab and the Practice tab.
// The numbers are generated from the web lesson data (web-editor: npm run generate:native-data), so they follow the content.
export function StatsScreen({ p, topInset, onBack, onToggleTheme }: { p: Palette; topInset: number; onBack: () => void; onToggleTheme: () => void }) {
  const dark = p.isDark;
  const title = dark ? '#F1F5F9' : '#2E3040';
  const muted = dark ? '#94A3B8' : '#64748B';
  const row = dark ? { backgroundColor: '#0F1422', borderColor: 'rgba(255,255,255,0.06)' } : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };
  const total = { title, muted };
  return <View style={{ flex: 1, backgroundColor: p.page }}>
    <Header p={p} title="Stats" onBack={onBack} onToggleTheme={onToggleTheme} topInset={topInset} showGap={false} />
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.grid}>
        <BigStat value={C.worlds} label="Worlds" row={row} {...total} />
        <BigStat value={C.lessons} label="Lessons" note={`${C.stages.learn.lessons} ready to play`} row={row} {...total} />
      </View>
      <Group label="The 5 stages of a lesson" muted={muted}>
        <View style={[s.list, row]}>
          <TotalRow name="Learn" value={C.stages.learn.items} unit="lessons" {...total} />
          <TotalRow name="Explore" value={C.stages.explore.items} unit="examples" {...total} />
          <TotalRow name="Predict" value={C.stages.predict.items} unit="questions" {...total} />
          <TotalRow name="Write & Run" value={C.stages.writeRun.items} unit="tasks" {...total} />
          <TotalRow name="Debug" value={C.stages.debug.items} unit="tasks" last {...total} />
        </View>
      </Group>
      <Group label="Quiz tab" muted={muted}>
        <View style={[s.list, row]}>
          <TotalRow name="Quiz questions" value={C.quizQuestions} unit="questions" last {...total} />
        </View>
      </Group>
      <Group label="Practice tab" muted={muted}>
        <View style={[s.list, row]}>
          <TotalRow name="Write & Run" value={C.practice.writeRun} unit="problems" {...total} />
          <TotalRow name="Debug" value={C.practice.debug} unit="problems" last {...total} />
        </View>
      </Group>
    </ScrollView>
  </View>;
}

function Group({ label, muted, children }: { label: string; muted: string; children: React.ReactNode }) {
  return <View style={{ gap: 8 }}><Text style={[s.groupTitle, { color: muted }]}>{label.toUpperCase()}</Text>{children}</View>;
}
function BigStat({ value, label, note, row, title, muted }: { value: number; label: string; note?: string; row: object; title: string; muted: string }) {
  return <View style={[s.big, row]}><Text style={[s.bigValue, { color: title }]}>{value}</Text><Text style={[s.rowTitle, { color: title }]}>{label}</Text>{note ? <Text style={[s.sub, { color: muted }]}>{note}</Text> : null}</View>;
}
function TotalRow({ name, value, unit, title, muted, last }: { name: string; value: number; unit: string; title: string; muted: string; last?: boolean }) {
  return <View style={[s.totalRow, !last && { borderBottomWidth: BW, borderBottomColor: 'rgba(148,163,184,0.25)' }]}><Text style={[s.rowTitle, { color: title, flex: 1 }]}>{name}</Text><Text style={[s.totalValue, { color: title }]}>{value.toLocaleString('en-US')}</Text><Text style={[s.sub, { color: muted, width: 62 }]}>{unit}</Text></View>;
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  grid: { flexDirection: 'row', gap: 8 },
  big: { flex: 1, borderWidth: BW, borderRadius: 12, padding: 14, gap: 2 },
  bigValue: { fontFamily: FONT.outfit.b, fontSize: fz(26) },
  groupTitle: { fontFamily: FONT.outfit.b, fontSize: fz(11), letterSpacing: 1 },
  list: { borderWidth: BW, borderRadius: 12, paddingHorizontal: 12 },
  totalRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalValue: { fontFamily: FONT.mono.b, fontSize: fz(14) },
  rowTitle: { fontFamily: FONT.outfit.b, fontSize: fz(12) },
  sub: { fontFamily: FONT.body, fontSize: fz(11), lineHeight: fz(16) },
});
