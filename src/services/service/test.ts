import { ywzNoteRequest } from '../index';

export interface testReq {
  test: number;
}
export interface testRes {
  test1: string;
  arr: number[];
}
export const testApi = (data: testReq) => {
  return ywzNoteRequest<testReq, testRes>({
    url: '/test',
    method: 'GET',
    data,
    interceptors: {
      requestInterceptors(res) {
        // console.log('接口请求拦截')
        return res;
      },
      responseInterceptors(result) {
        // console.log('接口响应拦截')
        return result;
      },
    },
  });
};
