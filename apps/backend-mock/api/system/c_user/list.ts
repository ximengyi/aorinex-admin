import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { endUserMockStore } from '~/utils/end-user-mock-store';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { page = 1, per_page = 10, keyword, status, created_start, created_end } = getQuery(event);

  let listData = structuredClone(endUserMockStore.rows);

  if (keyword) {
    const k = String(keyword).toLowerCase();
    listData = listData.filter((item) => {
      const email = item.email ? String(item.email).toLowerCase() : '';
      return (
        item.mobile.includes(String(keyword)) ||
        item.nickname.toLowerCase().includes(k) ||
        email.includes(k)
      );
    });
  }
  if (status === '1' || status === '2') {
    listData = listData.filter((item) => item.status === Number(status));
  }
  if (created_start) {
    listData = listData.filter((item) => item.created_at >= `${created_start} 00:00:00`);
  }
  if (created_end) {
    listData = listData.filter((item) => item.created_at <= `${created_end} 23:59:59`);
  }

  return usePageResponseSuccess(page as string, per_page as string, listData);
});
