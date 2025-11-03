import Axios, { type AxiosRequestConfig } from 'axios';

export const PHOTOSHOP_AXIOS_INSTANCE = Axios.create();
PHOTOSHOP_AXIOS_INSTANCE.defaults.baseURL = 'https://image.adobe.io';

// add a second `options` argument here if you want to pass extra options to each generated query
export const customPhotoshopAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = PHOTOSHOP_AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  return promise;
};
