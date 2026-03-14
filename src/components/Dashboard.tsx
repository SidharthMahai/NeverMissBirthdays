import { useMemo, useState } from 'react';
import { useBirthdays } from '../hooks/useBirthdays';
import { BirthdayRecord } from '../types/birthday';
import { daysUntilNextBirthday, formatBirthday } from '../utils/date';
import { BirthdayFormModal } from './BirthdayFormModal';
import { BirthdayList } from './BirthdayList';
import { Filters } from './Filters';
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

  const upcomingPreview = useMemo(() => upcoming.slice(0, 3), [upcoming]);

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
      await deleteBirthday(record.id);
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
          <button type="button" className="ghost" onClick={onChangeUser}>
            Switch ID
          </button>
          <button type="button" onClick={openCreate}>
            Add Birthday
          </button>
        </div>
      </header>

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
          <BirthdayList records={filteredRecords} onEdit={openEdit} onDelete={(record) => void handleDelete(record)} />
        ) : null}
      </section>

      {modalOpen ? (
        <BirthdayFormModal
          record={editing}
          onClose={() => setModalOpen(false)}
          onSave={async (input) => {
            if (editing) {
              await updateBirthday(editing.id, input);
            } else {
              await createBirthday(input);
            }
          }}
        />
      ) : null}
    </div>
  );
};
