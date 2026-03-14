import { BirthdayInput, BirthdayRecord } from '../types/birthday';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || '';
const API_BIRTHDAYS_URL = `${API_BASE}/api/birthdays`;
const APPS_SCRIPT_CLIENT_KEY =
  import.meta.env.VITE_APPS_SCRIPT_CLIENT_KEY?.trim() ||
  '17088669416447bf8ceecbb1521bbc8de2a73ce4ba60680b';

const request = async <T>(body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(API_BIRTHDAYS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      ...(APPS_SCRIPT_CLIENT_KEY ? { clientKey: APPS_SCRIPT_CLIENT_KEY } : {}),
    }),
  });

  const rawText = await response.text();
  let parsed: unknown = null;

  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const maybeError = parsed as { error?: string } | null;
    const message =
      maybeError?.error || rawText || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (parsed === null) {
    throw new Error('Invalid server response');
  }

  return parsed as T;
};

export const birthdayStore = {
  async listByUser(userId: string) {
    const data = await request<{ records: BirthdayRecord[] }>({ action: 'list', userId });
    return data.records || [];
  },

  async create(userId: string, input: BirthdayInput) {
    const data = await request<{ record: BirthdayRecord }>({
      action: 'create',
      userId,
      input,
    });
    return data.record;
  },

  async update(userId: string, id: string, input: BirthdayInput) {
    await request<{ ok: true }>({ action: 'update', userId, id, input });
  },

  async remove(userId: string, id: string) {
    await request<{ ok: true }>({ action: 'delete', userId, id });
  },
};
