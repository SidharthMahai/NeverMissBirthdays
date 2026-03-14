import { FormEvent, useState } from 'react';
import { ReminderSettings } from '../types/birthday';

interface ReminderSettingsModalProps {
  initial?: ReminderSettings;
  saving: boolean;
  onClose: () => void;
  onSave: (settings: Pick<ReminderSettings, 'reminderEnabled' | 'reminderEmail'>) => Promise<void>;
}

export const ReminderSettingsModal = ({ initial, saving, onClose, onSave }: ReminderSettingsModalProps) => {
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(initial?.reminderEnabled));
  const [reminderEmail, setReminderEmail] = useState(initial?.reminderEmail ?? '');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    const email = reminderEmail.trim();
    if (reminderEnabled && !email) {
      setError('Please enter an email to enable reminders.');
      return;
    }

    try {
      setError('');
      await onSave({
        reminderEnabled,
        reminderEmail: reminderEnabled ? email : undefined,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update reminder settings.';
      setError(message);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3>Email Reminder Settings</h3>
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>

        <p className="settings-copy">
          One setting for this Access ID. If enabled, reminder emails are sent for all saved birthdays.
        </p>

        <fieldset>
          <legend>Email reminders</legend>
          <div className="inline-options">
            <label>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => setReminderEnabled(event.target.checked)}
                disabled={saving}
              />
              Enable email reminders for this account
            </label>
          </div>
        </fieldset>

        {reminderEnabled ? (
          <label>
            Reminder email
            <input
              type="email"
              placeholder="you@example.com"
              value={reminderEmail}
              onChange={(event) => setReminderEmail(event.target.value)}
              disabled={saving}
            />
          </label>
        ) : (
          <small>Email reminders are currently disabled for this account.</small>
        )}

        <div className="actions-row">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>

        {error ? <small>{error}</small> : null}
      </form>
    </div>
  );
};
