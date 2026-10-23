import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, Icon, fz } from './shell';
import { FONT, Palette } from './theme';

// The free-style editor, opened by the tab bar's centre button: a blank Kotlin file to write anything in. The code is kept on the device.
// Running code needs the Kotlin runner, which the app does not have yet, so Run says so instead of pretending.

const STORAGE_KEY = 'codedo.freeEditor.code';
const STARTER = 'fun main() {\n    println("Hello, Kotlin!")\n}\n';
const LINE_H = 20;

export function FreeEditorScreen({ p, topInset, onBack }: { p: Palette; topInset: number; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const dark = p.isDark;
  const [code, setCode] = React.useState(STARTER);
  const [loaded, setLoaded] = React.useState(false);
  const [ran, setRan] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => { if (saved !== null) setCode(saved); }).catch(() => {}).finally(() => setLoaded(true));
  }, []);
  React.useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
  }, [code, loaded]);

  const lines = code.split('\n').length;
  const panel = dark ? '#0F1420' : '#1E2433';
  const gutter = '#64748B';
  const text = '#E2E8F0';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: p.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.toolbar, { paddingTop: topInset }]}>
        <BackButton p={p} onPress={onBack} />
        <Text style={[s.title, { color: p.pageText }]}>Code Editor</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Run code"
          onPress={() => setRan(true)}
          style={({ pressed }) => [s.run, { backgroundColor: pressed ? '#4338CA' : '#4F46E5' }]}
        >
          <Icon name="play_arrow" size={18} exact color="#FFFFFF" />
          <Text style={s.runText}>Run</Text>
        </Pressable>
      </View>

      <View style={[s.editor, { backgroundColor: panel }]}>
        <View style={s.fileBar}>
          <Icon name="code" size={14} exact color="#A5B4FC" />
          <Text style={s.fileName}>main.kt</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.codeRow} keyboardShouldPersistTaps="handled">
          <View style={s.gutter}>
            {Array.from({ length: lines }, (_, i) => <Text key={i} style={[s.code, { color: gutter, textAlign: 'right' }]}>{i + 1}</Text>)}
          </View>
          <TextInput
            value={code}
            onChangeText={(next) => { setCode(next); setRan(false); }}
            multiline
            scrollEnabled={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
            textAlignVertical="top"
            selectionColor="#818CF8"
            placeholder="Write some Kotlin…"
            placeholderTextColor="#64748B"
            style={[s.code, s.input, { color: text }]}
          />
        </ScrollView>
      </View>

      <View style={[s.output, { backgroundColor: dark ? '#151B28' : '#FFFFFF', borderColor: dark ? 'rgba(255,255,255,0.08)' : '#E6E8F0', marginBottom: 12 + insets.bottom }]}>
        <Text style={[s.outputLabel, { color: dark ? '#94A3B8' : '#64748B' }]}>OUTPUT</Text>
        <Text style={[s.outputText, { color: dark ? '#CBD5E1' : '#475569' }]}>
          {ran ? 'Running code is not available in the app yet. Your code is saved on this device.' : 'Press Run to see the output here.'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10 },
  title: { flex: 1, fontFamily: FONT.outfit.b, fontSize: fz(18), includeFontPadding: false },
  run: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 38, paddingHorizontal: 14, borderRadius: 12 },
  runText: { color: '#FFFFFF', fontFamily: FONT.outfit.sb, fontSize: fz(13), includeFontPadding: false },
  editor: { flex: 1, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  fileBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  fileName: { color: '#CBD5E1', fontFamily: FONT.mono.md, fontSize: fz(12), includeFontPadding: false },
  codeRow: { flexDirection: 'row', paddingVertical: 12, paddingRight: 12, minHeight: '100%' },
  gutter: { width: 36, paddingRight: 8 },
  code: { fontFamily: FONT.mono.r, fontSize: fz(13), lineHeight: LINE_H, includeFontPadding: false },
  input: { flex: 1, padding: 0, margin: 0, minHeight: LINE_H },
  output: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 6 },
  outputLabel: { fontFamily: FONT.mono.b, fontSize: fz(10), letterSpacing: 0.8, includeFontPadding: false },
  outputText: { fontFamily: FONT.mono.r, fontSize: fz(12), lineHeight: 18, includeFontPadding: false },
});
