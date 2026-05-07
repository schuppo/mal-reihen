import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useSettings } from '../context/SettingsContext';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { testLength } = useSettings();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>✖️ Times Rows</Text>
        <Text style={styles.subtitle}>Master the multiplication tables{'\n'}from 1 × 1 to 10 × 10</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={[styles.card, styles.trainCard]}
            onPress={() => navigation.navigate('Exercise', { mode: 'training' })}
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
            onPress={() => navigation.navigate('Exercise', { mode: 'test' })}
            activeOpacity={0.85}
          >
            <Text style={styles.cardEmoji}>🏆</Text>
            <Text style={styles.cardTitle}>Test</Text>
            <Text style={styles.cardDesc}>
              {testLength} questions, timed.{'\n'}Get your final score!
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Tap a card to begin</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#6C63FF' },
  container: {
    flex: 1,
    backgroundColor: '#F0EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 40,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  cards: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  trainCard: { backgroundColor: '#fff' },
  testCard: { backgroundColor: '#6C63FF' },
  cardEmoji: { fontSize: 48, marginBottom: 8 },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    marginTop: 32,
    fontSize: 13,
    color: '#aaa',
  },
});
