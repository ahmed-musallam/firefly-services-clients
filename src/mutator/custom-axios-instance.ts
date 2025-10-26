import Axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create();
AXIOS_INSTANCE.defaults.baseURL = 'https://firefly-api.adobe.io';

// add a second `options` argument here if you want to pass extra options to each generated query
export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  // For some strange reason the video generation API requires the x-model-version header to be set to video1_standard
  // even though the docs dont explicitly mention it is required.
  if (config.url?.includes('/videos/')) {
    if (options) {
      options.headers = {
        ...options.headers,
        'x-model-version': 'video1_standard',
      };
    }
  }

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  return promise;
};
