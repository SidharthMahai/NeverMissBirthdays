import { BirthdayInput, BirthdayRecord } from '../types/birthday';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || '';
const API_BIRTHDAYS_URL = `${API_BASE}/api/birthdays`;

const request = async <T>(body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(API_BIRTHDAYS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        message = data.error;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
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
