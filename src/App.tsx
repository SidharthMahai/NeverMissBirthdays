import { useState } from 'react';
import { AccessGate } from './components/AccessGate';
import { Dashboard } from './components/Dashboard';

const ACCESS_KEY = 'nevermissbirthdays_access_id_v1';

const readStoredAccessId = () => localStorage.getItem(ACCESS_KEY)?.trim() || '';

function App() {
  const [accessId, setAccessId] = useState<string>(() => readStoredAccessId());

  if (!accessId) {
    return (
      <AccessGate
        onAccessGranted={(nextId) => {
          localStorage.setItem(ACCESS_KEY, nextId);
          setAccessId(nextId);
        }}
      />
    );
  }

  return (
    <Dashboard
      accessId={accessId}
      onChangeUser={() => {
        localStorage.removeItem(ACCESS_KEY);
        setAccessId('');
      }}
    />
  );
}

export default App;
