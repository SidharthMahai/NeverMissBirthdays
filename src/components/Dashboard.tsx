import { useEffect, useMemo, useState } from 'react';
import { useBirthdays } from '../hooks/useBirthdays';
import { birthdayStore } from '../services/birthdayStore';
import { BirthdayRecord, ReminderSettings } from '../types/birthday';
import { daysUntilNextBirthday, formatBirthday } from '../utils/date';
import { BirthdayFormModal } from './BirthdayFormModal';
import { BirthdayList } from './BirthdayList';
import { Filters } from './Filters';
import { ReminderSettingsModal } from './ReminderSettingsModal';
import { StatCard } from './StatCard';

interface DashboardProps {
  accessId: string;
  onChangeUser: () => void;
}

export const Dashboard = ({ accessId, onChangeUser }: DashboardProps) => {
  const {
    records,
    birthdaysToday,
    upcoming,
    filteredRecords,
    filters,
    setFilters,
    createBirthday,
    updateBirthday,
    deleteBirthday,
    loading,
    error,
    reload,
  } = useBirthdays(accessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BirthdayRecord | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const upcomingPreview = useMemo(() => upcoming.slice(0, 3), [upcoming]);
  const effectiveSettings: ReminderSettings = settings ?? {
    userId: accessId,
    reminderEnabled: false,
  };
  const actionsBusy = isSaving || deletingId !== null;

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const next = await birthdayStore.getReminderSettings(accessId);
        setSettings(next);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load reminder settings.';
        setNotice({ type: 'error', message });
      } finally {
        setSettingsLoading(false);
      }
    };

    void loadSettings();
  }, [accessId]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (record: BirthdayRecord) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: BirthdayRecord) => {
    const confirmed = window.confirm(`Delete ${record.name}'s birthday?`);
    if (confirmed) {
      try {
        setDeletingId(record.id);
        await deleteBirthday(record.id);
        setNotice({ type: 'success', message: `${record.name}'s birthday was deleted.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed.';
        setNotice({ type: 'error', message });
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="badge">NeverMissBirthdays</span>
          <h1>Your anti-embarrassment birthday command center</h1>
          <p>
            Add birthdays once. Get reminder-ready data for automated email nudges before big dates, so your
            memory can go back to forgetting where you left your charger.
          </p>
        </div>
        <div className="topbar-actions">
          <span className="access-pill">ID: {accessId}</span>
          <button type="button" className="ghost" onClick={() => setSettingsModalOpen(true)}>
            {effectiveSettings.reminderEnabled ? 'Email Reminder Settings' : 'Enable Email Reminders'}
          </button>
          <button type="button" className="ghost" onClick={onChangeUser}>
            Switch ID
          </button>
          <button type="button" onClick={openCreate} disabled={deletingId !== null}>
            Add Birthday
          </button>
        </div>
      </header>
      {notice ? <div className={`toast ${notice.type}`}>{notice.message}</div> : null}
      {!settingsLoading && !effectiveSettings.reminderEnabled ? (
        <div className="empty-state reminder-banner">
          <h3>Email reminders are currently off</h3>
          <p>Enable reminders once and we’ll notify you for all birthdays in this Access ID.</p>
          <button type="button" className="ghost" onClick={() => setSettingsModalOpen(true)}>
            Enable Email Reminders
          </button>
        </div>
      ) : null}

      <section className="stat-grid">
        <StatCard
          title="Birthdays Today"
          value={String(birthdaysToday.length)}
          subtitle={birthdaysToday.length ? 'You remembered in time. Historic.' : 'A rare peaceful day.'}
          icon={<span>🎉</span>}
        />
        <StatCard
          title="Next 60 Days"
          value={String(upcoming.length)}
          subtitle="Upcoming birthdays worth planning now"
          icon={<span>📅</span>}
        />
        <StatCard
          title="Total Saved"
          value={String(records.length)}
          subtitle="People who expect you to remember"
          icon={<span>👑</span>}
        />
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>Birthdays Today</h3>
          </div>
          {birthdaysToday.length === 0 ? (
            <div className="empty-inline">
              <p>No urgent birthdays today. You can breathe.</p>
            </div>
          ) : (
            <ul className="mini-list">
              {birthdaysToday.map((record, index) => (
                <li key={record.id} style={{ animationDelay: `${index * 55}ms` }}>
                  <strong>{record.name}</strong>
                  <span>{formatBirthday(record)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h3>Upcoming Birthdays</h3>
          </div>
          {upcomingPreview.length === 0 ? (
            <div className="empty-inline">
              <p>Nothing soon. A suspicious amount of calm.</p>
            </div>
          ) : (
            <ul className="mini-list">
              {upcomingPreview.map((record, index) => (
                <li key={record.id} style={{ animationDelay: `${index * 55}ms` }}>
                  <strong>{record.name}</strong>
                  <span>
                    {formatBirthday(record)} • in {daysUntilNextBirthday(record)} days
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-header wrap">
          <h3>All Birthdays</h3>
          <Filters value={filters} onChange={setFilters} />
        </div>
        {loading ? (
          <div className="empty-inline">
            <p>Loading the celebration ledger...</p>
          </div>
        ) : null}
        {error ? (
          <div className="empty-state">
            <h3>Could not sync right now</h3>
            <p>{error}</p>
            <button type="button" className="ghost" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        ) : null}
        {!loading && !error ? (
          <BirthdayList
            records={filteredRecords}
            onEdit={openEdit}
            onDelete={(record) => void handleDelete(record)}
            busyId={deletingId}
            actionsDisabled={actionsBusy}
          />
        ) : null}
      </section>

      {modalOpen ? (
        <BirthdayFormModal
          record={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (input) => {
            try {
              setIsSaving(true);
              if (editing) {
                await updateBirthday(editing.id, input);
                setNotice({ type: 'success', message: `${input.name} was updated.` });
              } else {
                await createBirthday(input);
                setNotice({ type: 'success', message: `${input.name} was added.` });
              }
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Save failed.';
              setNotice({ type: 'error', message });
              throw err;
            } finally {
              setIsSaving(false);
            }
          }}
          isSubmitting={isSaving}
        />
      ) : null}
      {settingsModalOpen ? (
        <ReminderSettingsModal
          initial={effectiveSettings}
          saving={settingsSaving}
          onClose={() => setSettingsModalOpen(false)}
          onSave={async (next) => {
            try {
              setSettingsSaving(true);
              const updated = await birthdayStore.updateReminderSettings(accessId, next);
              setSettings(updated);
              setNotice({
                type: 'success',
                message: updated.reminderEnabled
                  ? `Reminders enabled for ${updated.reminderEmail}.`
                  : 'Reminders disabled for this account.',
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Could not save reminder settings.';
              setNotice({ type: 'error', message });
              throw err;
            } finally {
              setSettingsSaving(false);
            }
          }}
        />
      ) : null}
    </div>
  );
};
