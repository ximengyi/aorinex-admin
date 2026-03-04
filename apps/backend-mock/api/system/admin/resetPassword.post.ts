import { eventHandler, readBody } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { id } = await readBody(event);

  // mock: 返回新密码（生产环境后端不返回明文密码）
  return useResponseSuccess({ id, new_password: 'Admin@123' });
});
