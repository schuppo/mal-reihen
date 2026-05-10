import React from 'react';

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

const base: React.CSSProperties = {
  width: 90, height: 80, margin: '0 6px',
  background: '#fff', borderRadius: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 28, fontWeight: 700, color: '#333',
  boxShadow: '0 3px 8px rgba(108,99,255,0.15)',
  userSelect: 'none', transition: 'opacity 0.2s',
  border: 'none',
};

export default function NumPad({ onDigit, onBackspace, onConfirm, disabled }: Props) {
  function handlePress(key: string) {
    if (disabled) return;
    if (key === '⌫') onBackspace();
    else if (key === '✓') onConfirm();
    else onDigit(key);
  }

  return (
    <div style={{ width: '100%', maxWidth: 360, padding: '0 8px' }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          {row.map(key => {
            const isConfirm = key === '✓';
            const isBack = key === '⌫';
            return (
              <button
                key={key}
                style={{
                  ...base,
                  background: isConfirm ? '#6C63FF' : isBack ? '#FFE4E4' : '#fff',
                  color: isConfirm ? '#fff' : '#333',
                  opacity: disabled ? 0.4 : 1,
                  cursor: disabled ? 'default' : 'pointer',
                }}
                onClick={() => handlePress(key)}
                tabIndex={-1}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
