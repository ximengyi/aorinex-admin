import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { endUserMockStore } from '~/utils/end-user-mock-store';
import { unAuthorizedResponse, useResponseError, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const id = Number(getQuery(event).id);
  const row = endUserMockStore.findById(id);
  if (!row) {
    return useResponseError('用户不存在');
  }

  return useResponseSuccess({ ...row });
});
