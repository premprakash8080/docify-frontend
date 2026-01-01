const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    return 'http://127.0.0.1:2018/api';
  }
  return 'http://77.37.62.160:3012/api';
};

const apiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000,
};

export default apiConfig;

