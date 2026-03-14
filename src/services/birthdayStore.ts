import { BirthdayInput, BirthdayRecord } from '../types/birthday';

const RECORDS_KEY = 'nevermissbirthdays_records_v1';
const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL?.trim() ||
  'https://script.google.com/macros/s/AKfycbzL0lKRpAGuWQNwKoqzWddnmgMOkb2AiRcAL-0owZxzd2tmtO9ow75-G2tFao_hOwG5_A/exec';
const APPS_SCRIPT_CLIENT_KEY =
  import.meta.env.VITE_APPS_SCRIPT_CLIENT_KEY?.trim() ||
  '17088669416447bf8ceecbb1521bbc8de2a73ce4ba60680b';

const parseRecords = (): BirthdayRecord[] => {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as BirthdayRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistRecords = (records: BirthdayRecord[]) => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const normalizedInput = (input: BirthdayInput): BirthdayInput => {
  const base = {
    ...input,
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };

  if (input.birthdayType === 'full') {
    return {
      ...base,
      month: undefined,
      day: undefined,
    };
  }

  return {
    ...base,
    dateIso: undefined,
  };
};

const request = async <T>(body: Record<string, unknown>): Promise<T> => {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Apps Script URL is not configured');
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      ...(APPS_SCRIPT_CLIENT_KEY ? { clientKey: APPS_SCRIPT_CLIENT_KEY } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
};

export const birthdayStore = {
  async listByUser(userId: string) {
    if (APPS_SCRIPT_URL) {
      const data = await request<{ records: BirthdayRecord[] }>({ action: 'list', userId });
      return data.records || [];
    }
    return parseRecords().filter((item) => item.userId === userId);
  },

  async create(userId: string, input: BirthdayInput) {
    if (APPS_SCRIPT_URL) {
      const data = await request<{ record: BirthdayRecord }>({
        action: 'create',
        userId,
        input,
      });
      return data.record;
    }

    const records = parseRecords();
    const now = new Date().toISOString();

    const record: BirthdayRecord = {
      id: randomId(),
      userId,
      createdAt: now,
      updatedAt: now,
      ...normalizedInput(input),
    };

    records.push(record);
    persistRecords(records);
    return record;
  },

  async update(userId: string, id: string, input: BirthdayInput) {
    if (APPS_SCRIPT_URL) {
      await request<{ ok: true }>({ action: 'update', userId, id, input });
      return;
    }

    const records = parseRecords();

    const updated = records.map((record) => {
      if (record.id !== id || record.userId !== userId) {
        return record;
      }

      return {
        ...record,
        ...normalizedInput(input),
        updatedAt: new Date().toISOString(),
      };
    });

    persistRecords(updated);
  },

  async remove(userId: string, id: string) {
    if (APPS_SCRIPT_URL) {
      await request<{ ok: true }>({ action: 'delete', userId, id });
      return;
    }

    const filtered = parseRecords().filter(
      (record) => !(record.id === id && record.userId === userId),
    );
    persistRecords(filtered);
  },
};
