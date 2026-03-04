import { eventHandler, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody(event);

  // mock: 直接返回创建成功，带一个假 id
  return useResponseSuccess({
    id: Date.now(),
    ...body,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
});
