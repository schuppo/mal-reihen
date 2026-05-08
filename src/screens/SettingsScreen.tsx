import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Platform, ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

const LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30];
const TIMER_OPTIONS = [5, 8, 10, 15, 20, 30];

export default function SettingsScreen() {
  const { testLength, setTestLength, questionTimer, setQuestionTimer, showCorrectAnswer, setShowCorrectAnswer, language, setLanguage } = useSettings();
  const t = useTranslations(language);
  const { deleteAccount } = useUser();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { height } = useWindowDimensions();

  function handleDeleteAccount() {
    if (Platform.OS === 'web') {
      setConfirmDelete(true);
    } else {
      Alert.alert(t.deleteAccount, t.deleteAccountConfirm, [
        { text: 'Cancel', style: 'cancel' },
        { text: t.deleteAccount, style: 'destructive', onPress: deleteAccount },
      ]);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { height }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

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

        <View style={styles.separator} />

        {/* ── Delete Account ── */}
        {confirmDelete ? (
          <View style={styles.confirmBar}>
            <Text style={styles.confirmText}>{t.deleteAccountConfirm}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmDelete(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDelete} onPress={deleteAccount} testID="confirm-delete-account">
                <Text style={styles.confirmDeleteText}>{t.deleteAccount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} testID="delete-account-btn">
            <Text style={styles.deleteBtnTitle}>{t.deleteAccount}</Text>
            <Text style={styles.deleteBtnDesc}>{t.deleteAccountDesc}</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 48,
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
  deleteBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFD0D0',
    backgroundColor: '#FFF5F5',
    padding: 18,
  },
  deleteBtnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E74C3C',
    marginBottom: 4,
  },
  deleteBtnDesc: {
    fontSize: 13,
    color: '#E74C3C',
    opacity: 0.75,
  },
  confirmBar: {
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
  confirmActions: { flexDirection: 'row', gap: 10 },
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
});
