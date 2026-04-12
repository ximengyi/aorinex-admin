import { faker } from '@faker-js/faker';

export interface MockEndUserRecord {
  id: number;
  mobile: string;
  email: string | null;
  nickname: string;
  avatar: string;
  gender: number;
  birthday: string | null;
  status: number;
  register_source: string;
  last_login_at: string | null;
  last_login_ip: string;
  created_at: string;
  updated_at: string;
}

function buildRow(id: number): MockEndUserRecord {
  const mobile = `1${faker.string.numeric(10)}`;
  return {
    id,
    mobile,
    email: faker.helpers.maybe(() => faker.internet.email(), { probability: 0.4 }) ?? null,
    nickname: faker.person.firstName(),
    avatar: '',
    gender: faker.helpers.arrayElement([0, 1, 2]),
    birthday: faker.helpers.maybe(() => faker.date.birthdate().toISOString().slice(0, 10), {
      probability: 0.5,
    }) ?? null,
    status: faker.helpers.arrayElement([1, 2]),
    register_source: faker.helpers.arrayElement(['app', 'h5', 'mini', '']),
    last_login_at: faker.helpers.maybe(
      () => faker.date.recent().toISOString().slice(0, 19).replace('T', ' '),
      { probability: 0.7 },
    ) ?? null,
    last_login_ip: faker.internet.ip(),
    created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
    updated_at: faker.date.recent().toISOString().slice(0, 19).replace('T', ' '),
  };
}

let nextId = 200;
const initial: MockEndUserRecord[] = Array.from({ length: 42 }, (_, i) => buildRow(i + 1));

export const endUserMockStore = {
  get rows() {
    return initial;
  },
  findById(id: number) {
    return initial.find((r) => r.id === id);
  },
  findByMobile(mobile: string, excludeId?: number) {
    return initial.find((r) => r.mobile === mobile && r.id !== excludeId);
  },
  insert(row: Omit<MockEndUserRecord, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const rec: MockEndUserRecord = {
      ...row,
      id: nextId++,
      created_at: now,
      updated_at: now,
    };
    initial.unshift(rec);
    return rec;
  },
  update(id: number, patch: Partial<MockEndUserRecord>) {
    const idx = initial.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    initial[idx] = { ...initial[idx], ...patch, updated_at: now };
    return initial[idx];
  },
};
