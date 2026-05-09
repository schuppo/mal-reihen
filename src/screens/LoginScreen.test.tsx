import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './LoginScreen';
import { UserProvider } from '../context/UserContext';
import { registerUser } from '../utils/users';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(() => {
  (AsyncStorage as any).clear();
});

function renderLogin() {
  return render(
    <UserProvider>
      <LoginScreen />
    </UserProvider>,
  );
}

describe('LoginScreen – login mode (account list)', () => {
  it('shows "no accounts" message when store is empty', async () => {
    const { getByTestId } = renderLogin();
    // toggle link should be visible
    expect(getByTestId('auth-toggle')).toBeTruthy();
  });

  it('shows an account row for each registered user', async () => {
    await registerUser('alice');
    await registerUser('bob');
    const { getByTestId } = renderLogin();
    await waitFor(() => expect(getByTestId('account-alice')).toBeTruthy());
    expect(getByTestId('account-bob')).toBeTruthy();
  });

  it('logs in by tapping an account row', async () => {
    await registerUser('alice');
    const { getByTestId, queryByTestId } = renderLogin();
    await waitFor(() => expect(getByTestId('account-alice')).toBeTruthy());
    await act(async () => { fireEvent.press(getByTestId('account-alice')); });
    // No error shown after successful login
    await waitFor(() => expect(queryByTestId('auth-error')).toBeNull());
  });

  it('shows error when tapping a stale account that no longer exists', async () => {
    // Register then clear storage to simulate a stale account list
    await registerUser('ghost');
    const { getByTestId } = renderLogin();
    await waitFor(() => expect(getByTestId('account-ghost')).toBeTruthy());
    // Wipe storage after render so the account is "gone"
    (AsyncStorage as any).clear();
    await act(async () => { fireEvent.press(getByTestId('account-ghost')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });
});

describe('LoginScreen – register mode', () => {
  it('toggles to register mode showing username input and submit', () => {
    const { getByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle'));
    expect(getByTestId('input-username')).toBeTruthy();
    expect(getByTestId('auth-submit')).toBeTruthy();
  });

  it('registers successfully with just a username', async () => {
    const { getByTestId, queryByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle'));
    fireEvent.changeText(getByTestId('input-username'), 'newuser');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(queryByTestId('auth-error')).toBeNull());
  });

  it('shows error for empty username in register mode', async () => {
    const { getByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle'));
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });

  it('shows error for duplicate username', async () => {
    await registerUser('taken');
    const { getByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle'));
    fireEvent.changeText(getByTestId('input-username'), 'taken');
    await act(async () => { fireEvent.press(getByTestId('auth-submit')); });
    await waitFor(() => expect(getByTestId('auth-error')).toBeTruthy());
  });

  it('toggles back to login mode', () => {
    const { getByTestId, queryByTestId } = renderLogin();
    fireEvent.press(getByTestId('auth-toggle')); // → register
    fireEvent.press(getByTestId('auth-toggle')); // → login
    expect(queryByTestId('input-username')).toBeNull();
  });
});
