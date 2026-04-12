import { faker } from '@faker-js/faker';
import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

function generateMockDataList(count: number) {
  const departments = ['技术部', '产品部', '运营部', '市场部', '财务部', '人事部'];
  const dataList = [];

  for (let i = 0; i < count; i++) {
    dataList.push({
      id: i + 1,
      username: faker.internet.username(),
      name: faker.person.fullName(),
      mobile: `1${faker.string.numeric(10)}`,
      email: faker.internet.email(),
      department: faker.helpers.arrayElement(departments),
      status: faker.helpers.arrayElement([0, 1]),
      role_ids: [faker.number.int({ min: 1, max: 5 })],
      created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' '),
    });
  }

  return dataList;
}

const mockData = generateMockDataList(50);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { page = 1, per_page = 10, username, mobile, status } = getQuery(event);

  let listData = structuredClone(mockData);

  if (username) {
    listData = listData.filter((item) =>
      item.username.toLowerCase().includes(String(username).toLowerCase()),
    );
  }
  if (mobile) {
    listData = listData.filter((item) => item.mobile.includes(String(mobile)));
  }
  if (['0', '1'].includes(status as string)) {
    listData = listData.filter((item) => item.status === Number(status));
  }

  return usePageResponseSuccess(page as string, per_page as string, listData);
});
