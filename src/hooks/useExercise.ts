import { useState, useCallback, useRef } from 'react';

export interface Question {
  a: number;
  b: number;
  answer: number;
}

export interface AnsweredQuestion extends Question {
  userAnswer: number;
  correct: boolean;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(tableFilter: number[] | 'all' = 'all'): Question {
  const aValues = tableFilter === 'all' ? Array.from({ length: 10 }, (_, i) => i + 1) : tableFilter;
  const a = aValues[Math.floor(Math.random() * aValues.length)];
  const b = randomInt(1, 10);
  return { a, b, answer: a * b };
}

/** Build the initial weight map: all questions start at weight 1. */
function buildInitialWeights(tableFilter: number[] | 'all'): Record<string, number> {
  const weights: Record<string, number> = {};
  const aValues = tableFilter === 'all' ? Array.from({ length: 10 }, (_, i) => i + 1) : tableFilter;
  for (const a of aValues) {
    for (let b = 1; b <= 10; b++) {
      weights[`${a}x${b}`] = 1;
    }
  }
  return weights;
}

const WEIGHT_ON_CORRECT = 0.5;  // multiply weight by this on correct answer (min 0.25)
const WEIGHT_ON_WRONG = 3;       // multiply weight by this on wrong answer (max 10)
const MIN_WEIGHT = 0.25;
const MAX_WEIGHT = 10;

function pickWeightedQuestion(weights: Record<string, number>, tableFilter: number[] | 'all'): Question {
  const aValues = tableFilter === 'all' ? Array.from({ length: 10 }, (_, i) => i + 1) : tableFilter;
  const keys: string[] = [];
  const w: number[] = [];
  for (const a of aValues) {
    for (let b = 1; b <= 10; b++) {
      keys.push(`${a}x${b}`);
      w.push(weights[`${a}x${b}`] ?? 1);
    }
  }
  const total = w.reduce((s, x) => s + x, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < keys.length; i++) {
    rand -= w[i];
    if (rand <= 0) {
      const [a, b] = keys[i].split('x').map(Number);
      return { a, b, answer: a * b };
    }
  }
  // fallback
  const [a, b] = keys[keys.length - 1].split('x').map(Number);
  return { a, b, answer: a * b };
}

export function useExercise(mode: 'training' | 'test', testLength = 20, tableFilter: number[] | 'all' = 'all') {
  const weights = useRef<Record<string, number>>(buildInitialWeights(tableFilter));

  const nextQuestion = useCallback(() => {
    if (mode === 'training') {
      return pickWeightedQuestion(weights.current, tableFilter);
    }
    return generateQuestion(tableFilter);
  }, [mode, tableFilter]);

  const [current, setCurrent] = useState<Question>(() => nextQuestion());
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [done, setDone] = useState(false);

  const updateWeight = useCallback((a: number, b: number, correct: boolean) => {
    if (mode !== 'training') return;
    const key = `${a}x${b}`;
    const prev = weights.current[key] ?? 1;
    const updated = correct
      ? Math.max(MIN_WEIGHT, prev * WEIGHT_ON_CORRECT)
      : Math.min(MAX_WEIGHT, prev * WEIGHT_ON_WRONG);
    weights.current = { ...weights.current, [key]: updated };
  }, [mode]);

  const appendDigit = useCallback((digit: string) => {
    if (feedback) return;
    setInput(prev => (prev.length >= 3 ? prev : prev + digit));
  }, [feedback]);

  const backspace = useCallback(() => {
    if (feedback) return;
    setInput(prev => prev.slice(0, -1));
  }, [feedback]);

  const submit = useCallback(() => {
    if (!input || feedback) return;
    const userAnswer = parseInt(input, 10);
    const correct = userAnswer === current.answer;
    const record: AnsweredQuestion = { ...current, userAnswer, correct };

    if (mode === 'training') {
      updateWeight(current.a, current.b, correct);
      setFeedback(correct ? 'correct' : 'wrong');
      setAnswered(prev => [...prev, record]);
      setTimeout(() => {
        setFeedback(null);
        setInput('');
        setCurrent(nextQuestion());
      }, 1200);
    } else {
      const next = [...answered, record];
      setAnswered(next);
      setFeedback(correct ? 'correct' : 'wrong');
      setTimeout(() => {
        if (next.length >= testLength) {
          setDone(true);
        } else {
          setFeedback(null);
          setInput('');
          setCurrent(generateQuestion(tableFilter));
        }
      }, 800);
    }
  }, [input, feedback, current, mode, answered, testLength, tableFilter, updateWeight, nextQuestion]);

  /** Called by the question timer when time runs out — always records as wrong. */
  const submitTimeout = useCallback(() => {
    if (feedback) return;
    const record: AnsweredQuestion = { ...current, userAnswer: -1, correct: false };

    if (mode === 'training') {
      updateWeight(current.a, current.b, false);
      setFeedback('wrong');
      setAnswered(prev => [...prev, record]);
      setTimeout(() => {
        setFeedback(null);
        setInput('');
        setCurrent(nextQuestion());
      }, 1200);
    } else {
      const next = [...answered, record];
      setAnswered(next);
      setFeedback('wrong');
      setTimeout(() => {
        if (next.length >= testLength) {
          setDone(true);
        } else {
          setFeedback(null);
          setInput('');
          setCurrent(generateQuestion(tableFilter));
        }
      }, 800);
    }
  }, [feedback, current, mode, answered, testLength, tableFilter, updateWeight, nextQuestion]);

  const correctCount = answered.filter(q => q.correct).length;

  return {
    current,
    input,
    feedback,
    answered,
    done,
    correctCount,
    appendDigit,
    backspace,
    submit,
    submitTimeout,
    progress: mode === 'test' ? answered.length / testLength : null,
  };
}
