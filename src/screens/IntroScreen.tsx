import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useSettings } from '../context/SettingsContext';

type Props = StackScreenProps<RootStackParamList, 'Intro'>;

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function IntroScreen({ navigation }: Props) {
  const { testLength } = useSettings();
  const [selected, setSelected] = useState<number | 'all'>('all');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Choose a Table</Text>
        <Text style={styles.subtitle}>Practice one number or all at once</Text>

        {/* Number selector */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={[styles.chip, selected === 'all' && styles.chipSelected]}
            onPress={() => setSelected('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, selected === 'all' && styles.chipTextSelected]}>
              All
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
          <Text style={styles.preview}>
            {selected} × 1 … {selected} × 10
          </Text>
        )}

        {/* Mode cards */}
        <View style={styles.cards}>
          <TouchableOpacity
            style={[styles.card, styles.trainCard]}
            onPress={() => navigation.navigate('Exercise', { mode: 'training', tableFilter: selected })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>🎓</Text>
            <Text style={styles.cardTitle}>Training</Text>
            <Text style={styles.cardDesc}>
              Practice at your own pace.{'\n'}Instant right/wrong feedback.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.testCard]}
            onPress={() => navigation.navigate('Exercise', { mode: 'test', tableFilter: selected })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>🏆</Text>
            <Text style={[styles.cardTitle, styles.testCardTitle]}>Test</Text>
            <Text style={[styles.cardDesc, styles.testCardDesc]}>
              {testLength} questions, timed.{'\n'}Get your final score!
            </Text>
          </TouchableOpacity>
        </View>
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
    fontSize: Platform.OS === 'web' ? 42 : 34,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 400,
    marginBottom: 12,
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  chipSelected: {
    backgroundColor: '#6C63FF',
  },
  chipText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  preview: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  cards: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginTop: 28,
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
    fontSize: 24,
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
});
