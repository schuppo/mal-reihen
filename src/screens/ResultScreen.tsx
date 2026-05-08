import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';

type Props = StackScreenProps<RootStackParamList, 'Result'>;

function grade(pct: number, t: ReturnType<typeof useTranslations>) {
  if (pct === 100) return { emoji: '🥇', label: t.gradePerfect, color: '#FFD700' };
  if (pct >= 80) return { emoji: '🥈', label: t.gradeGreat, color: '#6C63FF' };
  if (pct >= 60) return { emoji: '🥉', label: t.gradeGood, color: '#FF9F43' };
  return { emoji: '📚', label: t.gradeKeep, color: '#E74C3C' };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function ResultScreen({ navigation, route }: Props) {
  const { correct, total, timeSeconds } = route.params;
  const { language } = useSettings();
  const t = useTranslations(language);
  const pct = Math.round((correct / total) * 100);
  const { emoji, label, color } = grade(pct, t);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color }]}>{label}</Text>

        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNum}>{correct}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.scoreTotal}>{total}</Text>
          </View>
          <Text style={styles.scoreSubtext}>{t.correctAnswers}</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{pct}%</Text>
              <Text style={styles.statLabel}>{t.score}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{formatTime(timeSeconds)}</Text>
              <Text style={styles.statLabel}>{t.time}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{total - correct}</Text>
              <Text style={styles.statLabel}>{t.mistakes}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: color }]}
          onPress={() => navigation.replace('Intro')}
        >
          <Text style={styles.btnText}>{t.tryAgain}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeBtnText}>{t.home}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F0EFFF',
  },
  emoji: { fontSize: 80, marginBottom: 8 },
  label: { fontSize: 28, fontWeight: '900', marginBottom: 32 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 32,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  scoreNum: { fontSize: 72, fontWeight: '900', color: '#6C63FF' },
  scoreDivider: { fontSize: 40, color: '#ccc', marginHorizontal: 8 },
  scoreTotal: { fontSize: 40, fontWeight: '700', color: '#ccc' },
  scoreSubtext: { fontSize: 14, color: '#aaa', marginBottom: 24 },
  divider: { width: '100%', height: 1, backgroundColor: '#f0f0f0', marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  btn: {
    width: '100%',
    maxWidth: 360,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  homeBtn: {
    width: '100%',
    maxWidth: 360,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  homeBtnText: { fontSize: 18, fontWeight: '700', color: '#888' },
});
