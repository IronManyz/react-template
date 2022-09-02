import Request from './config';
import type { RequestConfig } from './config/types';

interface YWZRequestConfig<T> extends RequestConfig {
  data?: T;
}
interface YWZResponse<T> {
  code: number;
  message: string;
  result: T;
}
// 短信端实例
const noteRequest = new Request({
  baseURL: 'http://114.55.66.62:8088', // 服务器基路径
  timeout: 1000 * 60 * 5, // 超时响应
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config) => {
      // console.log('实例请求拦截器');

      return config;
    },
    // 响应拦截器
    responseInterceptors: (result) => {
      // console.log('实例响应拦截器');
      return result;
    },
  },
});

/**
 * @description: 函数的描述
 * @interface D 请求参数的interface
 * @interface T 响应结构的intercept
 * @param {YWZRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const ywzNoteRequest = <D, T = any>(config: YWZRequestConfig<D>) => {
  const { method = 'GET' } = config;
  if (method === 'get' || method === 'GET') {
    config.params = config.data;
  }
  return noteRequest.request<YWZResponse<T>>(config);
};

const cancelRequest = (url: string | string[]) => {
  return noteRequest.cancelRequest(url);
};
// 取消全部请求
const cancelAllRequest = () => {
  return noteRequest.cancelAllRequest();
};

export { cancelRequest, cancelAllRequest, ywzNoteRequest };
