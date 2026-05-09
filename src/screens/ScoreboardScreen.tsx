import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { loadScores, clearScores, ScoreEntry } from '../utils/scoreboard';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

type Props = StackScreenProps<RootStackParamList, 'Scoreboard'>;

const RANK_COLORS = ['#E74C3C', '#E67E22', '#F1C40F', '#aaa', '#bbb'];
const TOP_N = 5;

/** Aggregate all wrong answers across entries → sorted top-N pairs. */
function buildTopMistakes(scores: ScoreEntry[]): { a: number; b: number; count: number }[] {
  const map: Record<string, number> = {};
  for (const entry of scores) {
    for (const { a, b } of entry.mistakes ?? []) {
      const key = `${a}x${b}`;
      map[key] = (map[key] ?? 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([key, count]) => {
      const [a, b] = key.split('x').map(Number);
      return { a, b, count };
    })
    .sort((x, y) => y.count - x.count)
    .slice(0, TOP_N);
}

function TroubleSpots({ scores, t }: { scores: ScoreEntry[]; t: ReturnType<typeof useTranslations> }) {
  const top = buildTopMistakes(scores);
  const maxCount = top[0]?.count ?? 1;

  return (
    <View style={tsStyles.container}>
      <Text style={tsStyles.title}>{t.scoreboardHeatmapTitle}</Text>
      {top.length === 0 ? (
        <Text style={tsStyles.empty}>{t.scoreboardHeatmapEmpty}</Text>
      ) : (
        top.map(({ a, b, count }, i) => {
          const barWidth = `${Math.round((count / maxCount) * 100)}%` as any;
          return (
            <View key={`${a}x${b}`} style={tsStyles.item}>
              <View style={[tsStyles.rankBadge, { backgroundColor: RANK_COLORS[i] }]}>
                <Text style={tsStyles.rankNumber}>{i + 1}</Text>
              </View>
              <Text style={tsStyles.question}>{a} × {b} = {a * b}</Text>
              <View style={tsStyles.barTrack}>
                <View style={[tsStyles.barFill, { width: barWidth }]} />
              </View>
              <View style={tsStyles.badge}>
                <Text style={tsStyles.badgeText}>×{count}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function calcTimingStats(timings: number[] | undefined): { min: number; max: number; median: number } | null {
  if (!timings || timings.length === 0) return null;
  const sorted = [...timings].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
  return { min: sorted[0], max: sorted[sorted.length - 1], median };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function gradeColor(pct: number) {
  if (pct === 100) return '#FFD700';
  if (pct >= 80) return '#6C63FF';
  if (pct >= 60) return '#FF9F43';
  return '#E74C3C';
}

export default function ScoreboardScreen({ navigation }: Props) {
  const { language } = useSettings();
  const t = useTranslations(language);
  const { currentUser } = useUser();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadScores(currentUser?.id).then(setScores);
    }, [currentUser?.id]),
  );

  function handleClear() {
    if (Platform.OS === 'web') {
      setConfirmClear(true);
    } else {
      Alert.alert(t.scoreboardClearAll, t.scoreboardClearConfirm, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t.scoreboardClearAll,
          style: 'destructive',
          onPress: async () => {
            await clearScores(currentUser?.id);
            setScores([]);
          },
        },
      ]);
    }
  }

  async function executeClear() {
    await clearScores(currentUser?.id);
    setScores([]);
    setConfirmClear(false);
  }

  function renderItem({ item, index }: { item: ScoreEntry; index: number }) {
    const pct = Math.round((item.correct / item.total) * 100);
    const timePerAnswer = (item.timeSeconds / item.total).toFixed(1);
    const color = gradeColor(pct);
    const ts = calcTimingStats(item.timings);
    return (
      <View style={styles.row}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={[styles.pct, { color }]}>{pct}%</Text>
            <Text style={styles.fraction}>{item.correct}/{item.total}</Text>
            <View style={[styles.modeBadge, item.mode === 'test' ? styles.modeBadgeTest : styles.modeBadgeTraining]}>
              <Text style={styles.modeBadgeText}>
                {item.mode === 'test' ? t.scoreboardModeTest : t.scoreboardModeTraining}
              </Text>
            </View>
            <View style={styles.tableBadge}>
              <Text style={styles.tableBadgeText}>
                {item.tableFilter === 'all' ? t.scoreboardTableAll : item.tableFilter.join(', ')}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.rowBottom}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatTime(item.timeSeconds)}</Text>
              <Text style={styles.statLabel}>{t.time}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{timePerAnswer}s</Text>
              <Text style={styles.statLabel}>{t.scoreboardTimePerAnswer}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.total - item.correct}</Text>
              <Text style={styles.statLabel}>{t.mistakes}</Text>
            </View>
          </View>
          {ts && (
            <View style={styles.rowBottom2}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{ts.min}s</Text>
                <Text style={styles.statLabel}>{t.statMin}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{ts.median}s</Text>
                <Text style={styles.statLabel}>{t.statMedian}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{ts.max}s</Text>
                <Text style={styles.statLabel}>{t.statMax}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {scores.length > 0 && !confirmClear && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>{t.scoreboardClearAll}</Text>
        </TouchableOpacity>
      )}
      {confirmClear && (
        <View style={styles.confirmBar}>
          <Text style={styles.confirmText}>{t.scoreboardClearConfirm}</Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmClear(false)}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDelete} onPress={executeClear}>
              <Text style={styles.confirmDeleteText}>{t.scoreboardClearAll}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={scores.length === 0 ? styles.emptyContainer : styles.listContent}>
        <TroubleSpots scores={scores} t={t} />

        {scores.length === 0 ? (
          <View style={styles.emptyInner}>
            <Text style={styles.emptyEmoji}>🏅</Text>
            <Text style={styles.emptyText}>{t.scoreboardEmpty}</Text>
          </View>
        ) : (
          scores.map((item, index) => (
            <View key={item.id}>{renderItem({ item, index })}</View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  clearBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFE8E8',
  },
  clearBtnText: { color: '#E74C3C', fontWeight: '700', fontSize: 13 },
  confirmBar: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD0D0',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmText: { fontSize: 14, color: '#555', marginBottom: 12, textAlign: 'center' },
  confirmActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  confirmCancel: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#f5f5f5', alignItems: 'center',
  },
  confirmCancelText: { fontWeight: '700', color: '#888' },
  confirmDelete: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#E74C3C', alignItems: 'center',
  },
  confirmDeleteText: { fontWeight: '700', color: '#fff' },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  emptyInner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center', lineHeight: 24 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  rank: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 13, fontWeight: '700', color: '#bbb' },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  pct: { fontSize: 22, fontWeight: '900', minWidth: 52 },
  fraction: { fontSize: 16, fontWeight: '700', color: '#555', flex: 1 },
  date: { fontSize: 11, color: '#bbb' },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  modeBadgeTest: { backgroundColor: '#EDE9FF' },
  modeBadgeTraining: { backgroundColor: '#E8FFF0' },
  modeBadgeText: { fontSize: 11, fontWeight: '700', color: '#555' },
  tableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  tableBadgeText: { fontSize: 11, fontWeight: '700', color: '#E67E22' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  rowBottom2: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
});

const tsStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#333',
    marginBottom: 12,
  },
  empty: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
  },
  question: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F0EFFF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 5,
  },
  badge: {
    backgroundColor: '#FFE8E8',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E74C3C',
  },
});
