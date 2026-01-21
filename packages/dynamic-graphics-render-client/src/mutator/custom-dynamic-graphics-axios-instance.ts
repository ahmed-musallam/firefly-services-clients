import Axios, { type AxiosRequestConfig } from 'axios';

export const DYNAMIC_GRAPHICS_AXIOS_INSTANCE = Axios.create();
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.defaults.baseURL = 'https://audio-video-api.adobe.io';

// add a second `options` argument here if you want to pass extra options to each generated query
export const customDynamicGraphicsAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = DYNAMIC_GRAPHICS_AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  return promise;
};
