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
  if (!id) {
    return useResponseError('缺少 id');
  }
  const existing = endUserMockStore.findById(id);
  if (!existing) {
    return useResponseError('用户不存在');
  }

  if (body.mobile && endUserMockStore.findByMobile(String(body.mobile).trim(), id)) {
    return useResponseError('手机号已存在');
  }

  const patch: Record<string, any> = {};
  if (body.nickname !== undefined) patch.nickname = String(body.nickname);
  if (body.email !== undefined) patch.email = body.email;
  if (body.avatar !== undefined) patch.avatar = String(body.avatar);
  if (body.gender !== undefined) patch.gender = Number(body.gender);
  if (body.birthday !== undefined) patch.birthday = body.birthday;
  if (body.status !== undefined) patch.status = Number(body.status) === 2 ? 2 : 1;
  if (body.register_source !== undefined) patch.register_source = String(body.register_source);

  const updated = endUserMockStore.update(id, patch);
  return useResponseSuccess(updated);
});
