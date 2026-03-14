import { BirthdayRecord } from '../types/birthday';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const relationLabel = (relation: BirthdayRecord['relation']) => {
  switch (relation) {
    case 'friend':
      return 'Friend';
    case 'family':
      return 'Family';
    case 'colleague':
      return 'Colleague';
    default:
      return 'Other';
  }
};

export const getRecordMonthDay = (record: BirthdayRecord) => {
  if (record.birthdayType === 'full') {
    if (!record.dateIso) {
      return null;
    }
    const isoLike = /^\\d{4}-\\d{2}-\\d{2}$/.test(record.dateIso);
    const parsed = isoLike
      ? new Date(`${record.dateIso}T00:00:00`)
      : new Date(record.dateIso);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return {
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
    };
  }

  if (!record.month || !record.day) {
    return null;
  }

  return {
    month: record.month,
    day: record.day,
  };
};

export const formatBirthday = (record: BirthdayRecord) => {
  const monthDay = getRecordMonthDay(record);
  if (!monthDay) {
    return 'Unknown date';
  }

  const monthName = MONTH_NAMES[monthDay.month - 1];

  if (record.birthdayType === 'full' && record.dateIso) {
    const isoLike = /^\\d{4}-\\d{2}-\\d{2}$/.test(record.dateIso);
    const year = new Date(isoLike ? `${record.dateIso}T00:00:00` : record.dateIso).getFullYear();
    return `${monthName} ${monthDay.day}, ${year}`;
  }

  return `${monthName} ${monthDay.day}`;
};

const currentYearOccurrence = (month: number, day: number, baseYear: number) => {
  const candidate = new Date(baseYear, month - 1, day);
  if (candidate.getMonth() + 1 !== month || candidate.getDate() !== day) {
    return null;
  }
  return candidate;
};

export const daysUntilNextBirthday = (record: BirthdayRecord, now = new Date()) => {
  const monthDay = getRecordMonthDay(record);
  if (!monthDay) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYear = currentYearOccurrence(monthDay.month, monthDay.day, today.getFullYear());

  let target: Date | null = thisYear;
  if (!target || target < today) {
    target = currentYearOccurrence(monthDay.month, monthDay.day, today.getFullYear() + 1);
  }

  if (!target) {
    return Number.POSITIVE_INFINITY;
  }

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const isBirthdayToday = (record: BirthdayRecord, now = new Date()) => {
  const monthDay = getRecordMonthDay(record);
  if (!monthDay) {
    return false;
  }
  return monthDay.month === now.getMonth() + 1 && monthDay.day === now.getDate();
};

export const birthdayMonth = (record: BirthdayRecord) => {
  const monthDay = getRecordMonthDay(record);
  return monthDay?.month;
};
