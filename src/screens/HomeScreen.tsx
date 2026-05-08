import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../i18n/translations';
import { useUser } from '../context/UserContext';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function HomeScreen({ navigation }: Props) {
  const { testLength, language } = useSettings();
  const t = useTranslations(language);
  const { currentUser } = useUser();
  const [selected, setSelected] = useState<number | 'all'>('all');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t.appTitle}</Text>
        {currentUser && (
          <Text style={styles.userBadge}>{t.loggedInAs(currentUser.username)}</Text>
        )}
        <Text style={styles.subtitle}>{t.appSubtitle}</Text>

        {/* Table filter */}
        <Text style={styles.sectionTitle}>{t.chooseTable}</Text>
        <Text style={styles.sectionSubtitle}>{t.chooseTableSubtitle}</Text>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.chip, selected === 'all' && styles.chipSelected]}
            onPress={() => setSelected('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, selected === 'all' && styles.chipTextSelected]}>
              {t.all}
            </Text>
          </TouchableOpacity>
          {NUMBERS.map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, selected === n && styles.chipSelected]}
              onPress={() => setSelected(n)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selected === n && styles.chipTextSelected]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected !== 'all' && (
          <Text style={styles.preview}>{selected} × 1 … {selected} × 10</Text>
        )}

        {/* Mode cards */}
        <View style={styles.cards}>
          <TouchableOpacity
            style={[styles.card, styles.trainCard]}
            onPress={() => navigation.navigate('Exercise', { mode: 'training', tableFilter: selected })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>🎓</Text>
            <Text style={styles.cardTitle}>{t.trainingTitle}</Text>
            <Text style={styles.cardDesc}>{t.trainingDesc}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.testCard]}
            onPress={() => navigation.navigate('Exercise', { mode: 'test', tableFilter: selected })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>🏆</Text>
            <Text style={[styles.cardTitle, styles.testCardTitle]}>{t.testTitle}</Text>
            <Text style={[styles.cardDesc, styles.testCardDesc]}>{t.testDesc(testLength)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>{t.tapToBegin}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0EFFF' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 40,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 4,
  },
  userBadge: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 400,
    marginBottom: 8,
  },
  chip: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chipSelected: { backgroundColor: '#6C63FF' },
  chipText: { fontSize: 17, fontWeight: '700', color: '#333' },
  chipTextSelected: { color: '#fff' },
  preview: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  cards: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginTop: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  trainCard: { backgroundColor: '#fff' },
  testCard: { backgroundColor: '#6C63FF' },
  cardEmoji: { fontSize: 40, marginBottom: 6 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  testCardTitle: { color: '#fff' },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  testCardDesc: { color: 'rgba(255,255,255,0.85)' },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: '#aaa',
  },
});
