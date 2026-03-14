import { useEffect, useMemo, useState } from 'react';
import { birthdayStore } from '../services/birthdayStore';
import { BirthdayFilters, BirthdayInput, BirthdayRecord } from '../types/birthday';
import { birthdayMonth, daysUntilNextBirthday, isBirthdayToday } from '../utils/date';

const defaultFilters: BirthdayFilters = {
  search: '',
  relation: 'all',
  month: 'all',
};

export const useBirthdays = (userId: string) => {
  const [records, setRecords] = useState<BirthdayRecord[]>([]);
  const [filters, setFilters] = useState<BirthdayFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const reload = async () => {
    try {
      setError('');
      setLoading(true);
      const next = await birthdayStore.listByUser(userId);
      setRecords(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load birthdays';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [userId]);

  const createBirthday = async (input: BirthdayInput) => {
    await birthdayStore.create(userId, input);
    await reload();
  };

  const updateBirthday = async (id: string, input: BirthdayInput) => {
    await birthdayStore.update(userId, id, input);
    await reload();
  };

  const deleteBirthday = async (id: string) => {
    await birthdayStore.remove(userId, id);
    await reload();
  };

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => daysUntilNextBirthday(a) - daysUntilNextBirthday(b)),
    [records],
  );

  const birthdaysToday = useMemo(
    () => sortedRecords.filter((record) => isBirthdayToday(record)),
    [sortedRecords],
  );

  const upcoming = useMemo(
    () => sortedRecords.filter((record) => {
      const days = daysUntilNextBirthday(record);
      return Number.isFinite(days) && days > 0 && days <= 60;
    }),
    [sortedRecords],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return sortedRecords.filter((record) => {
      const relationMatch = filters.relation === 'all' || record.relation === filters.relation;
      const month = birthdayMonth(record);
      const monthMatch = filters.month === 'all' || month === filters.month;
      const searchMatch =
        normalizedSearch.length === 0 ||
        record.name.toLowerCase().includes(normalizedSearch) ||
        record.notes?.toLowerCase().includes(normalizedSearch) ||
        record.email?.toLowerCase().includes(normalizedSearch);

      return relationMatch && monthMatch && searchMatch;
    });
  }, [filters, sortedRecords]);

  return {
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
  };
};
