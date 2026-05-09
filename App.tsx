import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, Platform } from 'react-native';

// Fix web scrolling: Expo's #root div has no height by default, which breaks
// flex: 1 cascading and makes ScrollView unable to scroll.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    root.style.height = '100vh';
    root.style.overflow = 'hidden';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
  }
}
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ScoreboardScreen from './src/screens/ScoreboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import { SettingsProvider } from './src/context/SettingsContext';
import { UserProvider, useUser } from './src/context/UserContext';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Exercise: { mode: 'training' | 'test'; tableFilter: number | 'all' };
  Result: { correct: number; total: number; timeSeconds: number; mode: 'training' | 'test'; tableFilter: number | 'all' };
  Settings: undefined;
  Scoreboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const stackOptions = {
  headerStyle: { backgroundColor: '#6C63FF' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
  cardStyle: { backgroundColor: '#F0EFFF' },
} as const;

function headerIcons(navigation: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 8 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Scoreboard')}>
        <Text style={{ fontSize: 24 }}>🏅</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={{ fontSize: 24 }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Inner navigator — rendered only when a user is logged in. */
function AppNavigator() {
  const { currentUser, logout, saveSettings } = useUser();

  return (
    <SettingsProvider
      key={currentUser?.id ?? 'guest'}
      initialTestLength={currentUser?.settings.testLength}
      initialQuestionTimer={currentUser?.settings.questionTimer}
      initialShowCorrectAnswer={currentUser?.settings.showCorrectAnswer}
      initialLanguage={currentUser?.settings.language}
      onSave={saveSettings}
    >
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '✖️ Times Rows',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 8 }}>
                {headerIcons(navigation)}
                <TouchableOpacity onPress={logout}>
                  <Text style={{ fontSize: 24 }}>🚪</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen name="Exercise" component={ExerciseScreen} options={({ route }) => ({
          title: route.params.mode === 'training' ? '🎓 Training' : '🏆 Test',
        })} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: '🏆 Results', headerLeft: () => null }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '⚙️ Settings' }} />
        <Stack.Screen name="Scoreboard" component={ScoreboardScreen} options={{ title: '🏅 Scoreboard' }} />
      </Stack.Navigator>
    </SettingsProvider>
  );
}

/** Auth navigator — rendered when no user is logged in. */
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ ...stackOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0EFFF' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return currentUser ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, ...(Platform.OS === 'web' ? { height: '100vh' } as any : {}) }}>
      <SafeAreaProvider>
        <UserProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
