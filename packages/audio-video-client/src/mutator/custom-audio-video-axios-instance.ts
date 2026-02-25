import Axios, { type AxiosRequestConfig } from 'axios';

export const AUDIO_VIDEO_AXIOS_INSTANCE = Axios.create();
AUDIO_VIDEO_AXIOS_INSTANCE.defaults.baseURL = 'https://audio-video-api.adobe.io';

// add a second `options` argument here if you want to pass extra options to each generated query
export const customAudioVideoAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = AUDIO_VIDEO_AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  return promise;
};
