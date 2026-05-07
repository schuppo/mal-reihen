import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import IntroScreen from './src/screens/IntroScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/context/SettingsContext';

export type RootStackParamList = {
  Home: undefined;
  Intro: undefined;
  Exercise: { mode: 'training' | 'test'; tableFilter: number | 'all' };
  Result: { correct: number; total: number; timeSeconds: number };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: '#6C63FF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
                cardStyle: { backgroundColor: '#F0EFFF' },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                  title: '✖️ Times Rows',
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Settings')}
                      style={{ marginRight: 16 }}
                    >
                      <Text style={{ fontSize: 24 }}>⚙️</Text>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="Intro"
                component={IntroScreen}
                options={({ navigation }) => ({
                  title: '✖️ Times Rows',
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Settings')}
                      style={{ marginRight: 16 }}
                    >
                      <Text style={{ fontSize: 24 }}>⚙️</Text>
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen name="Exercise" component={ExerciseScreen} options={({ route }) => ({
                title: route.params.mode === 'training' ? '🎓 Training' : '🏆 Test',
              })} />
              <Stack.Screen name="Result" component={ResultScreen} options={{ title: '🏆 Results', headerLeft: () => null }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '⚙️ Settings' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
