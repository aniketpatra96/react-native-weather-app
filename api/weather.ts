import axios, { AxiosResponse } from 'axios';
import { apiKey } from '@/constants';

interface ParamsProps {
  cityName: string;
  days?: string;
}

const forecastEndPoint = (params: ParamsProps): string =>
  `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;

const locationsEndPoint = (params: ParamsProps): string =>
  `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint: string): Promise<any> => {
  const options: object = {
    method: 'GET',
    url: endpoint,
  };
  try {
    const response: AxiosResponse<
      any,
      any,
      {
        [key: string]: any;
      }
    > = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchWeatherForecast = (params: ParamsProps) => {
  const forecastUrl: string = forecastEndPoint(params);
  return apiCall(forecastUrl);
};

export const fetchLocations = (params: ParamsProps) => {
  const locationsUrl: string = locationsEndPoint(params);
  return apiCall(locationsUrl);
};