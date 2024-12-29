/* istanbul ignore file */
class ServerTestHelper {
  constructor(server) {
    this._server = server;
  }

  async getAccessTokenAndUserId({
    username = 'joko',
    password = 'password',
    fullname = 'Joko Fujiwara',
  } = {}) {
    try {
      const registerResponse = await this._server.inject({
        method: 'POST',
        url: '/users',
        payload: { username, password, fullname },
      });

      const registerData = JSON.parse(registerResponse.payload);
      if (!registerData || !registerData.data?.addedUser?.id) {
        throw new Error('Failed to register user');
      }

      const loginResponse = await this._server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username, password },
      });

      const loginData = JSON.parse(loginResponse.payload);
      if (!loginData || !loginData.data?.accessToken) {
        throw new Error('Failed to login');
      }

      return {
        userId: registerData.data.addedUser.id,
        accessToken: loginData.data.accessToken,
      };
    } catch (error) {
      console.error('Error in getAccessTokenAndUserId:', error);
      throw error;
    }
  }
}

module.exports = ServerTestHelper;
