import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';

const LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30];
const TIMER_OPTIONS = [5, 8, 10, 15, 20, 30];

export default function SettingsScreen() {
  const { testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer, language, setLanguage } = useSettings();
  const t = useTranslations(language);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Test Length ── */}
        <Text style={styles.sectionTitle}>{t.settingsTestLength}</Text>
        <Text style={styles.sectionDesc}>{t.settingsTestLengthDesc}</Text>
        <View style={styles.grid}>
          {LENGTH_OPTIONS.map(n => {
            const selected = n === testLength;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setTestLength(n)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.hint}>
          {t.settingsTestLengthHint(testLength)}
        </Text>

        <View style={styles.separator} />

        {/* ── Question Timer ── */}
        <Text style={styles.sectionTitle}>{t.settingsTimer}</Text>
        <Text style={styles.sectionDesc}>
          {t.settingsTimerDesc}
        </Text>

        {/* Off chip */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.chip, styles.chipWide, questionTimer === null && styles.chipSelected]}
            onPress={() => setQuestionTimer(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, questionTimer === null && styles.chipTextSelected]}>
              {t.settingsTimerOff}
            </Text>
          </TouchableOpacity>

          {TIMER_OPTIONS.map(s => {
            const selected = s === questionTimer;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setQuestionTimer(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{s}s</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          {questionTimer === null
            ? <Text style={styles.hintBold}>{t.settingsTimerHintOff}</Text>
            : <Text style={styles.hintBold}>{t.settingsTimerHint(questionTimer)}</Text>}
        </Text>

        <View style={styles.separator} />

        {/* ── Show Correct Answer ── */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <Text style={styles.sectionTitle}>{t.settingsShowCorrect}</Text>
            <Text style={styles.sectionDesc}>
              {t.settingsShowCorrectDesc}
            </Text>
          </View>
          <Switch
            value={showCorrectAnswer}
            onValueChange={setShowCorrectAnswer}
            trackColor={{ false: '#ddd', true: '#6C63FF' }}
            thumbColor="#fff"
            testID="show-correct-answer-switch"
          />
        </View>

        <View style={styles.separator} />

        {/* ── Language ── */}
        <Text style={styles.sectionTitle}>{t.settingsLanguage}</Text>
        <Text style={styles.sectionDesc}>{t.settingsLanguageDesc}</Text>
        <View style={styles.grid}>
          {(['en', 'de'] as const).map(lang => {
            const selected = lang === language;
            const label = lang === 'en' ? t.settingsLangEn : t.settingsLangDe;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.chip, styles.chipLang, selected && styles.chipSelected]}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.8}
                testID={`language-chip-${lang}`}
              >
                <Text style={[styles.chipText, styles.chipTextLang, selected && styles.chipTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F0EFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  sectionDesc: {
    fontSize: 15,
    color: '#777',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  chip: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  chipWide: {
    width: 100,
  },
  chipLang: {
    width: 140,
    height: 56,
  },
  chipTextLang: {
    fontSize: 16,
  },
  chipSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  chipText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#555',
  },
  chipTextSelected: {
    color: '#fff',
  },
  hint: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 14,
    color: '#999',
  },
  hintBold: {
    color: '#6C63FF',
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 28,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleLabel: {
    flex: 1,
  },
});
