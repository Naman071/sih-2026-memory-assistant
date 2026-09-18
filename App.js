import * as React from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Supabase difficulty_profiles save notice',
  'Could not find the table',
  'schema cache',
  'Supabase profile save error',
  'Supabase round insert notice',
]);

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { PatientProvider } from './src/context/PatientContext';
import { LanguageProvider } from './src/context/LanguageContext';
import NoklaiApp from './src/noklai/NoklaiApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <PatientProvider>
            <NoklaiApp />
          </PatientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
