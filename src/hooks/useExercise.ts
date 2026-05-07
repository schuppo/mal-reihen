import { useState, useCallback } from 'react';

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

function generateQuestion(): Question {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  return { a, b, answer: a * b };
}

export function useExercise(mode: 'training' | 'test', testLength = 20) {
  const [current, setCurrent] = useState<Question>(generateQuestion());
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [done, setDone] = useState(false);

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
      setFeedback(correct ? 'correct' : 'wrong');
      setAnswered(prev => [...prev, record]);
      setTimeout(() => {
        setFeedback(null);
        setInput('');
        setCurrent(generateQuestion());
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
          setCurrent(generateQuestion());
        }
      }, 800);
    }
  }, [input, feedback, current, mode, answered, testLength]);

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
    progress: mode === 'test' ? answered.length / testLength : null,
  };
}
