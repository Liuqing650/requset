import fetch from 'dva/fetch';
import { notification } from 'antd';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: response.statusText,
  });
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  // 允许fetch携带token
  const defaultOptions = {
    credentials: 'include',
  };
  const opt = options || {};
  const newOptions = { ...defaultOptions, ...opt };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
  }
  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => {
      const data = response.json();
      if (response.headers.get('x-total-count')) {
        // ret.headers['x-total-count'] = response.headers.get('x-total-count');

      }
      return data;
    })
    .catch((error) => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      return error;
    });
}
