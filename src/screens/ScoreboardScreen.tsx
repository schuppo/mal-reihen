import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform,
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
                {item.tableFilter === 'all' ? t.scoreboardTableAll : `${item.tableFilter}×`}
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
      <FlatList
        data={scores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={scores.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Text style={styles.emptyEmoji}>🏅</Text>
            <Text style={styles.emptyText}>{t.scoreboardEmpty}</Text>
          </View>
        }
      />
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
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#333' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
});
