import { eventHandler, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { endUserMockStore } from '~/utils/end-user-mock-store';
import { unAuthorizedResponse, useResponseError, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody<Record<string, any>>(event);
  const id = Number(body?.id);
  const status = Number(body?.status);
  if (!id || (status !== 1 && status !== 2)) {
    return useResponseError('参数错误');
  }
  const updated = endUserMockStore.update(id, { status });
  if (!updated) {
    return useResponseError('用户不存在');
  }
  return useResponseSuccess(updated);
});
