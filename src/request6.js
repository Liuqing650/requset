import fetch from 'dva/fetch';
import { config } from 'Utis';
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function saveToken(headers, httpStr) {
  const urls = config.tokenUrls;
  if (!urls || urls.length === 0) {
    return null;
  }
  const url = httpStr.replace(config.host, '');
  if (urls.includes(url)) {
    delCookie(headers);
    SetCookie(headers);
  }
}

function SetCookie(cookieInfo) {
  const Days = config.validTime ? config.validTime : 1;
  const exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  Object.keys(cookieInfo).map((key) => {
    document.cookie = key + "=" + escape(cookieInfo[key]) + ";expires=" + exp.toGMTString();
  });
}

function getCookie(httpStr) {
  const url = httpStr.replace(config.host, '');
  const urls = config.tokenUrls;
  if (!document.cookie) {
    return null;
  }
  if (urls && urls.includes(url)) {
    return {
      'ULP-AUTH-TOKEN': '2323',
      'ULP-AUTH-USER-ID': '2323',
    };
  }
  let arr = document.cookie.split(';');
  if (arr && arr.length > 0) {
    let output = {};
    arr.map((arrItem) => {
      const item = arrItem.split('=');
      const key = item[0].replace(' ', '');
      const value = item[1].replace(' ', '');
      output[key] = value;
    });
    return output;
  }
}

function delCookie(cookieInfo) {
  const exp = new Date();
  exp.setTime(exp.getTime() - 1);
  Object.keys(cookieInfo).map((key) => {
    const cval = getCookie(key);
    if (cval != null) document.cookie = key + "=" + escape(cookieInfo[key]) + ";expires=" + exp.toGMTString();
  });
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options) {
  // 允许fetch携带token
  const defaultOptions = {
    credentials: 'include',
  };
  const opt = options || {};
  const cookie = getCookie(url);
  const tokenConfig = {
    token: 'ULP-AUTH-TOKEN',
    id: 'ULP-AUTH-USER-ID'
  }
  let newOptions = { ...defaultOptions, ...opt };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...cookie,
      ...newOptions.headers,
    };
  } else {
    newOptions.headers = {
      ...cookie,
      ...newOptions.headers,
    };
  }
  const response = await fetch(url, newOptions);

  checkStatus(response);

  const data = await response.json();
  const ret = {
    data,
    headers: {},
  };
  if (response.headers.get(tokenConfig.token)) {
    ret.headers[tokenConfig.token] = response.headers.get(tokenConfig.token);
    ret.headers[tokenConfig.id] = response.headers.get(tokenConfig.id);
    saveToken(ret.headers, url);
  }
  return ret;
}
