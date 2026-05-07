import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';

const LENGTH_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function SettingsScreen() {
  const { testLength, setTestLength } = useSettings();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Test Length</Text>
        <Text style={styles.sectionDesc}>
          How many questions per test?
        </Text>

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
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>
          Currently set to <Text style={styles.hintBold}>{testLength} questions</Text>
        </Text>
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
    marginBottom: 28,
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
  chipSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  chipText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#555',
  },
  chipTextSelected: {
    color: '#fff',
  },
  hint: {
    marginTop: 32,
    fontSize: 14,
    color: '#999',
  },
  hintBold: {
    color: '#6C63FF',
    fontWeight: '800',
  },
});
