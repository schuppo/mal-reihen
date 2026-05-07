import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useExercise } from '../hooks/useExercise';
import NumPad from '../components/NumPad';
import { useSettings } from '../context/SettingsContext';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Exercise'>;
  route: RouteProp<RootStackParamList, 'Exercise'>;
};

export default function ExerciseScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const { testLength: TEST_LENGTH, questionTimer } = useSettings();
  const {
    current, input, feedback, answered, done,
    correctCount, appendDigit, backspace, submit, submitTimeout, progress,
  } = useExercise(mode, TEST_LENGTH);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const startTime = useRef(Date.now());
  const hiddenInputRef = useRef<TextInput>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // Always-current ref so the timer setTimeout can call the latest submitTimeout
  const submitTimeoutRef = useRef(submitTimeout);
  useEffect(() => { submitTimeoutRef.current = submitTimeout; }, [submitTimeout]);

  // Keep hidden TextInput focused on native so hardware keyboard works
  useEffect(() => {
    if (Platform.OS !== 'web') {
      hiddenInputRef.current?.focus();
    }
  }, [feedback]);

  // Web keyboard handler
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const win = window;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Enter') {
        submit();
      }
    };
    win.addEventListener('keydown', handler);
    return () => win.removeEventListener('keydown', handler);
  }, [appendDigit, backspace, submit]);

  // Navigate to result screen when test is done
  useEffect(() => {
    if (done) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      navigation.replace('Result', {
        correct: correctCount,
        total: TEST_LENGTH,
        timeSeconds: elapsed,
      });
    }
  }, [done]);

  // Shake animation on wrong answer
  useEffect(() => {
    if (feedback === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
    if (feedback === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback]);

  // Question timer countdown
  useEffect(() => {
    if (questionTimer === null || feedback) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(questionTimer);
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: questionTimer * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      submitTimeoutRef.current();
    }, questionTimer * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      timerAnim.stopAnimation();
    };
  }, [current, feedback, questionTimer]);

  const bgColor = feedback === 'correct'
    ? '#E8FFF0'
    : feedback === 'wrong'
      ? '#FFE8E8'
      : '#F0EFFF';

  const timerDanger = timeLeft !== null && questionTimer !== null && timeLeft <= Math.ceil(questionTimer * 0.3);
  const timerColor = timerDanger ? '#E74C3C' : '#6C63FF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>

        {/* Progress bar (test mode) */}
        {mode === 'test' && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(progress ?? 0) * 100}%` as any }]} />
            <Text style={styles.progressText}>
              {answered.length} / {TEST_LENGTH}
            </Text>
          </View>
        )}

        {/* Training score */}
        {mode === 'training' && answered.length > 0 && (
          <Text style={styles.scoreText}>
            ✅ {correctCount} / {answered.length}
          </Text>
        )}

        {/* Question card */}
        <Animated.View style={[
          styles.questionCard,
          { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] },
        ]}>

          {/* Timer bar inside card */}
          {questionTimer !== null && (
            <View style={styles.timerTrack}>
              <Animated.View style={[
                styles.timerFill,
                {
                  width: timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  backgroundColor: timerColor,
                },
              ]} />
              {timeLeft !== null && !feedback && (
                <Text style={[styles.timerLabel, { color: timerColor }]}>{timeLeft}s</Text>
              )}
            </View>
          )}

          <Text style={styles.questionText}>
            {current.a} × {current.b} = ?
          </Text>
          <View style={styles.inputBox}>
            <Text
              testID="input-display"
              style={[
              styles.inputText,
              !input && styles.inputPlaceholder,
            ]}>
              {input || '…'}
            </Text>
          </View>

          {feedback && (
            <Text style={[
              styles.feedbackText,
              feedback === 'correct' ? styles.correctText : styles.wrongText,
            ]}>
              {feedback === 'correct'
                ? '🎉 Correct!'
                : `❌ ${current.a} × ${current.b} = ${current.answer}`}
            </Text>
          )}
        </Animated.View>

        {/* NumPad */}
        <NumPad
          onDigit={appendDigit}
          onBackspace={backspace}
          onConfirm={submit}
          disabled={!!feedback}
        />

        {/* Hidden TextInput to capture hardware keyboard on native */}
        {Platform.OS !== 'web' && (
          <TextInput
            ref={hiddenInputRef}
            testID="hidden-keyboard-input"
            style={styles.hiddenInput}
            keyboardType="number-pad"
            caretHidden
            showSoftInputOnFocus={false}
            onKeyPress={({ nativeEvent }) => {
              const { key } = nativeEvent;
              if (key >= '0' && key <= '9') appendDigit(key);
              else if (key === 'Backspace') backspace();
            }}
            onSubmitEditing={submit}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 16,
  },
  progressBar: {
    width: '100%',
    maxWidth: 360,
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 14,
    fontSize: 12,
    color: '#999',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C63FF',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    minHeight: 200,
    overflow: 'hidden',
  },
  timerTrack: {
    width: '120%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'stretch',
    marginHorizontal: -40,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerLabel: {
    position: 'absolute',
    right: 8,
    top: 9,
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputBox: {
    width: 120,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
  },
  inputText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#333',
  },
  inputPlaceholder: {
    color: '#ccc',
  },
  feedbackText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
  },
  correctText: { color: '#2ECC71' },
  wrongText: { color: '#E74C3C' },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
});
