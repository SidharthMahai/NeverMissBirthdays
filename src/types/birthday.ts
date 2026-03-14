export type Relation = 'friend' | 'family' | 'colleague' | 'other';

export type BirthdayType = 'full' | 'monthDay';

export interface BirthdayRecord {
  id: string;
  userId: string;
  name: string;
  relation: Relation;
  birthdayType: BirthdayType;
  dateIso?: string;
  month?: number;
  day?: number;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayInput {
  name: string;
  relation: Relation;
  birthdayType: BirthdayType;
  dateIso?: string;
  month?: number;
  day?: number;
  email?: string;
  notes?: string;
}

export interface BirthdayFilters {
  search: string;
  relation: Relation | 'all';
  month: number | 'all';
}
