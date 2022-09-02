/* eslint-disable */
// index.ts
import type { AxiosInstance } from 'axios';
import axios, { AxiosError, AxiosResponse } from 'axios';
import type {
  CancelRequestSource,
  RequestConfig,
  RequestInterceptors,
} from './types';

class Request {
  // axios 实例
  instance: AxiosInstance;

  // 拦截器对象
  interceptorsObj?: RequestInterceptors;

  cancelRequestSourceList?: CancelRequestSource[];

  requestUrlList?: string[];

  constructor(config: RequestConfig) {
    this.requestUrlList = [];
    this.cancelRequestSourceList = [];
    this.instance = axios.create(config);
    this.interceptorsObj = config.interceptors;

    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj?.requestInterceptors,
      this.interceptorsObj?.requestInterceptorsCatch,
    );
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors,
      this.interceptorsObj?.responseInterceptorsCatch,
    );
    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      // 因为我们接口的数据都在res.data下，所以我们直接返回res.data
      (res: AxiosResponse) => {
        // console.log('全局响应拦截器')
        return res.data;
      },
      (err: any) => err,
    );
  }

  /**
   * @description: 获取指定 url 在 cancelRequestSourceList 中的索引
   * @param {string} url
   * @returns {number} 索引位置
   */
  private getSourceIndex(url: string): number {
    return this.cancelRequestSourceList?.findIndex(
      (item: CancelRequestSource) => {
        return Object.keys(item)[0] === url;
      },
    ) as number;
  }
  /**
   * @description: 删除 requestUrlList 和 cancelRequestSourceList
   * @param {string} url
   * @returns {*}
   */
  private delUrl(url: string) {
    const urlIndex = this.requestUrlList?.findIndex((u) => u === url);
    const sourceIndex = this.getSourceIndex(url);
    // 删除url和cancel方法
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    urlIndex !== -1 && this.requestUrlList?.splice(urlIndex as number, 1);
    sourceIndex !== -1 &&
      this.cancelRequestSourceList?.splice(sourceIndex as number, 1);
  }

  // 取消全部请求
  cancelAllRequest() {
    this.cancelRequestSourceList?.forEach((source) => {
      const key = Object.keys(source)[0];
      source[key]();
    });
  }

  // 取消请求
  cancelRequest(url: string | string[]) {
    if (typeof url === 'string') {
      // 取消单个请求
      const sourceIndex = this.getSourceIndex(url);
      sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][url]();
    } else {
      // 存在多个需要取消请求的地址
      url.forEach((u) => {
        const sourceIndex = this.getSourceIndex(u);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][u]();
      });
    }
  }

  request<T>(config: RequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      // 如果我们为单个请求设置拦截器，这里使用单个请求的拦截器
      if (config.interceptors?.requestInterceptors) {
        // eslint-disable-next-line no-param-reassign
        config = config.interceptors.requestInterceptors(config);
      }
      const url = config.url;
      // url存在保存取消请求方法和当前请求url
      if (url) {
        this.requestUrlList?.push(url);
        config.cancelToken = new axios.CancelToken((c) => {
          this.cancelRequestSourceList?.push({
            [url]: c,
          });
        });
      }
      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 如果我们为单个响应设置拦截器，这里使用单个响应的拦截器
          if (config.interceptors?.responseInterceptors) {
            // eslint-disable-next-line no-param-reassign
            res = config.interceptors.responseInterceptors<T>(res);
          }
          const AXIOS_ERROR_CODE = 'ERR_NETWORK';
          const { code } = res as unknown as AxiosError;
          if (code === AXIOS_ERROR_CODE) {
            reject(res); // 接口请求失败，抛错
          }
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        })
        .finally(() => {
          return url && this.delUrl(url);
        });
    });
  }
}
export default Request;
