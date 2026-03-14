import { FormEvent, useMemo, useState } from 'react';
import { BirthdayInput, BirthdayRecord, Relation } from '../types/birthday';

interface BirthdayFormModalProps {
  record?: BirthdayRecord;
  onClose: () => void;
  onSave: (input: BirthdayInput) => Promise<void> | void;
}

const relationOptions: Relation[] = ['friend', 'family', 'colleague', 'other'];

const twoDigit = (n: number) => n.toString().padStart(2, '0');

export const BirthdayFormModal = ({ record, onClose, onSave }: BirthdayFormModalProps) => {
  const initialType = record?.birthdayType ?? 'monthDay';
  const [birthdayType, setBirthdayType] = useState<BirthdayInput['birthdayType']>(initialType);
  const [name, setName] = useState(record?.name ?? '');
  const [relation, setRelation] = useState<Relation>(record?.relation ?? 'friend');
  const [dateIso, setDateIso] = useState(record?.dateIso ?? '');
  const [month, setMonth] = useState(record?.month ?? 1);
  const [day, setDay] = useState(record?.day ?? 1);
  const [email, setEmail] = useState(record?.email ?? '');
  const [notes, setNotes] = useState(record?.notes ?? '');
  const [submitError, setSubmitError] = useState('');

  const maxDay = useMemo(() => new Date(2024, month, 0).getDate(), [month]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    const input: BirthdayInput = {
      name,
      relation,
      birthdayType,
      email,
      notes,
    };

    if (birthdayType === 'full') {
      if (!dateIso) {
        return;
      }
      input.dateIso = dateIso;
    } else {
      input.month = month;
      input.day = Math.min(day, maxDay);
    }

    try {
      setSubmitError('');
      await onSave(input);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save right now.';
      setSubmitError(message);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3>{record ? 'Edit Birthday' : 'Add Birthday'}</h3>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Lee" />
        </label>

        <label>
          Relation
          <select value={relation} onChange={(event) => setRelation(event.target.value as Relation)}>
            {relationOptions.map((item) => (
              <option key={item} value={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Date Type</legend>
          <div className="inline-options">
            <label>
              <input
                type="radio"
                checked={birthdayType === 'monthDay'}
                onChange={() => setBirthdayType('monthDay')}
              />
              Month + Day only
            </label>
            <label>
              <input type="radio" checked={birthdayType === 'full'} onChange={() => setBirthdayType('full')} />
              Full date (year known)
            </label>
          </div>
        </fieldset>

        {birthdayType === 'full' ? (
          <label>
            Date of birth
            <input type="date" value={dateIso} onChange={(event) => setDateIso(event.target.value)} />
          </label>
        ) : (
          <div className="date-grid">
            <label>
              Month
              <select
                value={month}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setMonth(next);
                  setDay((current) => Math.min(current, new Date(2024, next, 0).getDate()));
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Day
              <select value={Math.min(day, maxDay)} onChange={(event) => setDay(Number(event.target.value))}>
                {Array.from({ length: maxDay }).map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {twoDigit(index + 1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label>
          Email (optional)
          <input
            type="email"
            placeholder="person@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Notes (optional)
          <textarea
            rows={3}
            placeholder="Gift ideas, favorite cake, panic backup plan..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="actions-row">
          <button type="submit">{record ? 'Save changes' : 'Add birthday'}</button>
        </div>
        {submitError ? <small>{submitError}</small> : null}
      </form>
    </div>
  );
};
