import { BirthdayFilters } from '../types/birthday';
import { MONTH_NAMES } from '../utils/date';

interface FiltersProps {
  value: BirthdayFilters;
  onChange: (next: BirthdayFilters) => void;
}

export const Filters = ({ value, onChange }: FiltersProps) => {
  return (
    <div className="filters">
      <input
        placeholder="Search names, notes, email..."
        value={value.search}
        onChange={(event) => onChange({ ...value, search: event.target.value })}
      />

      <select
        value={value.relation}
        onChange={(event) =>
          onChange({ ...value, relation: event.target.value as BirthdayFilters['relation'] })
        }
      >
        <option value="all">All Relations</option>
        <option value="friend">Friends</option>
        <option value="family">Family</option>
        <option value="colleague">Colleagues</option>
        <option value="other">Other</option>
      </select>

      <select
        value={value.month}
        onChange={(event) => {
          const next = event.target.value;
          onChange({ ...value, month: next === 'all' ? 'all' : Number(next) });
        }}
      >
        <option value="all">All Months</option>
        {MONTH_NAMES.map((month, index) => (
          <option key={month} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};
