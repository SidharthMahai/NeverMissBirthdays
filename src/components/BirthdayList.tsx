import { BirthdayRecord } from '../types/birthday';
import { daysUntilNextBirthday, formatBirthday, isBirthdayToday, relationLabel } from '../utils/date';

interface BirthdayListProps {
  records: BirthdayRecord[];
  onEdit: (record: BirthdayRecord) => void;
  onDelete: (record: BirthdayRecord) => void;
}

export const BirthdayList = ({ records, onEdit, onDelete }: BirthdayListProps) => {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <h3>No birthdays match this filter</h3>
        <p>
          This is the calm before the cake storm. Try a different filter or add another person you definitely
          promised yourself you would not forget.
        </p>
      </div>
    );
  }

  return (
    <div className="list-shell">
      {records.map((record, index) => {
        const today = isBirthdayToday(record);
        const dueIn = daysUntilNextBirthday(record);
        const dueLabel = today ? 'Today' : `${dueIn} day${dueIn === 1 ? '' : 's'}`;

        return (
          <article
            key={record.id}
            className={`birthday-row ${today ? 'today' : ''}`}
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <div>
              <h4>{record.name}</h4>
              <span>
                {relationLabel(record.relation)} • {formatBirthday(record)}
              </span>
              {record.notes ? <p>{record.notes}</p> : null}
            </div>

            <div className="row-meta">
              <strong>{dueLabel}</strong>
              <div>
                <button type="button" className="ghost" onClick={() => onEdit(record)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => onDelete(record)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
