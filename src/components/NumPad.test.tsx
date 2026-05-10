import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import NumPad from './NumPad';

function makeProps(overrides = {}) {
  return { onDigit: vi.fn(), onBackspace: vi.fn(), onConfirm: vi.fn(), ...overrides };
}

describe('NumPad', () => {
  it('calls onDigit with the pressed digit', () => {
    const props = makeProps();
    render(<NumPad {...props} />);
    fireEvent.click(screen.getByText('5'));
    expect(props.onDigit).toHaveBeenCalledWith('5');
  });

  it('calls onBackspace when ⌫ is pressed', () => {
    const props = makeProps();
    render(<NumPad {...props} />);
    fireEvent.click(screen.getByText('⌫'));
    expect(props.onBackspace).toHaveBeenCalled();
  });

  it('calls onConfirm when ✓ is pressed', () => {
    const props = makeProps();
    render(<NumPad {...props} />);
    fireEvent.click(screen.getByText('✓'));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it('ignores all presses when disabled', () => {
    const props = makeProps({ disabled: true });
    render(<NumPad {...props} />);
    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('⌫'));
    fireEvent.click(screen.getByText('✓'));
    expect(props.onDigit).not.toHaveBeenCalled();
    expect(props.onBackspace).not.toHaveBeenCalled();
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it('renders all 12 keys (0-9, ⌫, ✓)', () => {
    const props = makeProps();
    render(<NumPad {...props} />);
    ['0','1','2','3','4','5','6','7','8','9','⌫','✓'].forEach(k => {
      expect(screen.getByText(k)).toBeTruthy();
    });
  });
});
