import Axios, { type AxiosRequestConfig } from 'axios';

export const STORAGE_AXIOS_INSTANCE = Axios.create();
STORAGE_AXIOS_INSTANCE.defaults.baseURL = 'https://cloudstorage.adobe.io/v1';

// add a second `options` argument here if you want to pass extra options to each generated query
export const customStorageAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = STORAGE_AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  return promise;
};
