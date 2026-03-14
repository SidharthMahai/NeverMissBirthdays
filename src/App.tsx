import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AccessGate } from './components/AccessGate';
import { AboutPage } from './components/AboutPage';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './components/Dashboard';

const ACCESS_KEY = 'nevermissbirthdays_access_id_v1';
const THEME_KEY = 'nevermissbirthdays_theme_v1';

const readStoredAccessId = () => localStorage.getItem(ACCESS_KEY)?.trim() || '';

const readInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function App() {
  const [accessId, setAccessId] = useState<string>(() => readStoredAccessId());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <Routes>
      <Route
        element={<AppLayout theme={theme} onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))} />}
      >
        <Route
          path="/"
          element={
            accessId ? (
              <Dashboard
                accessId={accessId}
                onChangeUser={() => {
                  localStorage.removeItem(ACCESS_KEY);
                  setAccessId('');
                }}
              />
            ) : (
              <AccessGate
                onAccessGranted={(nextId) => {
                  localStorage.setItem(ACCESS_KEY, nextId);
                  setAccessId(nextId);
                }}
              />
            )
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
