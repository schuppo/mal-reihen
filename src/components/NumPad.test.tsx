import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NumPad from './NumPad';

function makeProps(overrides = {}) {
  return {
    onDigit: jest.fn(),
    onBackspace: jest.fn(),
    onConfirm: jest.fn(),
    ...overrides,
  };
}

describe('NumPad', () => {
  it('calls onDigit with the pressed digit', () => {
    const props = makeProps();
    const { getByText } = render(<NumPad {...props} />);
    fireEvent.press(getByText('5'));
    expect(props.onDigit).toHaveBeenCalledWith('5');
  });

  it('calls onBackspace when ⌫ is pressed', () => {
    const props = makeProps();
    const { getByText } = render(<NumPad {...props} />);
    fireEvent.press(getByText('⌫'));
    expect(props.onBackspace).toHaveBeenCalled();
  });

  it('calls onConfirm when ✓ is pressed', () => {
    const props = makeProps();
    const { getByText } = render(<NumPad {...props} />);
    fireEvent.press(getByText('✓'));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it('ignores all presses when disabled', () => {
    const props = makeProps({ disabled: true });
    const { getByText } = render(<NumPad {...props} />);
    fireEvent.press(getByText('7'));
    fireEvent.press(getByText('⌫'));
    fireEvent.press(getByText('✓'));
    expect(props.onDigit).not.toHaveBeenCalled();
    expect(props.onBackspace).not.toHaveBeenCalled();
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it('renders all 12 keys (0-9, ⌫, ✓)', () => {
    const props = makeProps();
    const { getByText } = render(<NumPad {...props} />);
    ['0','1','2','3','4','5','6','7','8','9','⌫','✓'].forEach(k => {
      expect(getByText(k)).toBeTruthy();
    });
  });
});
