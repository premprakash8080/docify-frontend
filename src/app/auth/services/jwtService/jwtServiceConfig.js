import apiConfig from '../../../configs/apiConfig';

const jwtServiceConfig = {
  signIn: `${apiConfig.baseURL}/users/login`,
  signUp: `${apiConfig.baseURL}/users/register`,
  logout: `${apiConfig.baseURL}/users/logout`,
  refreshToken: `${apiConfig.baseURL}/users/refresh-token`,
  updateUser: `${apiConfig.baseURL}/users/profile`,
};

export default jwtServiceConfig;
