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
  const mobile = String(body?.mobile ?? '').trim();
  if (!mobile) {
    return useResponseError('手机号不能为空');
  }
  if (endUserMockStore.findByMobile(mobile)) {
    return useResponseError('手机号已存在');
  }

  const rec = endUserMockStore.insert({
    mobile,
    email: body.email ?? null,
    nickname: String(body.nickname ?? ''),
    avatar: String(body.avatar ?? ''),
    gender: Number(body.gender ?? 0),
    birthday: body.birthday ?? null,
    status: Number(body.status ?? 1) === 2 ? 2 : 1,
    register_source: String(body.register_source ?? 'admin'),
    last_login_at: null,
    last_login_ip: '',
  });

  return useResponseSuccess(rec);
});
