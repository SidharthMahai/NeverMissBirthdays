import { FormEvent, useState } from 'react';

interface AccessGateProps {
  onAccessGranted: (accessId: string) => void;
}

export const AccessGate = ({ onAccessGranted }: AccessGateProps) => {
  const [accessId, setAccessId] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = accessId.trim();
    if (!normalized) {
      return;
    }
    onAccessGranted(normalized);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <span className="badge">NeverMissBirthdays</span>
        <h1>Remember birthdays like someone who has their life together.</h1>
        <p>
          Use your private access ID to unlock your birthday vault. Add dates once, and future-you gets
          timely email reminders before social disaster strikes.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="access-id">Private Access ID</label>
          <input
            id="access-id"
            value={accessId}
            onChange={(event) => setAccessId(event.target.value)}
            placeholder="e.g. sidharth-personal"
            autoComplete="off"
          />
          <button type="submit">Enter NeverMissBirthdays</button>
        </form>
        <small>
          No passwords. No OTP drama. Just your private ID, and eventually a very useful reminder email when
          birthdays are due.
        </small>
      </div>
    </div>
  );
};
