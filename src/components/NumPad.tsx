import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['⌫', '0', '✓'],
];

export default function NumPad({ onDigit, onBackspace, onConfirm, disabled }: Props) {
  const handlePress = (key: string) => {
    if (disabled) return;
    if (key === '⌫') onBackspace();
    else if (key === '✓') onConfirm();
    else onDigit(key);
  };

  return (
    <View style={styles.container}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map(key => {
            const isConfirm = key === '✓';
            const isBack = key === '⌫';
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  isConfirm && styles.confirmKey,
                  isBack && styles.backKey,
                  disabled && styles.disabledKey,
                ]}
                onPress={() => handlePress(key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, isConfirm && styles.confirmText]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  key: {
    width: 90,
    height: 80,
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmKey: {
    backgroundColor: '#6C63FF',
  },
  backKey: {
    backgroundColor: '#FFE4E4',
  },
  disabledKey: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  confirmText: {
    color: '#fff',
  },
});
