import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '@/api/weather';
import { weatherImages } from '@/constants';
import * as Progress from 'react-native-progress';
import { getData, storeData } from '@/utils/store';

export default function Index() {
  const [showSearch, toggleSearch] = useState<boolean>(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const handleLocation = (location: any): void => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: location.name,
      days: '7',
    }).then((data: any) => {
      setWeather(JSON.parse(JSON.stringify(data)));
      setLoading(false);
      storeData('city', location?.name);
    });
  };

  const handleSearch = (value: string): void => {
    // fetch locations
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data: any) => {
        setLocations(data);
      });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [handleSearch]);

  const { current, location } = weather;

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async (): Promise<void> => {
    const city: string | null = await getData('city');
    fetchWeatherForecast({
      cityName: city || 'Paris',
      days: '7',
    }).then((data: any) => {
      setWeather(JSON.parse(JSON.stringify(data)));
      setLoading(false);
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="relative flex-1">
        <StatusBar style="light" />
        <Image
          source={require('@/assets/images/bg.png')}
          alt="background"
          className="absolute h-full w-full"
          blurRadius={70}
        />
        {loading ? (
          <View className="flex-1 flex-row items-center justify-center">
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/* Search Section */}
            <View style={{ height: '7%' }} className="relative z-50 mx-4">
              <View
                className="rounded-full"
                style={{
                  backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent',
                  overflow: 'hidden',
                }}>
                <View className="flex-row items-center justify-end px-1">
                  {showSearch ? (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder="Search City"
                      placeholderTextColor="lightgray"
                      className="h-10 flex-1 pb-1 pl-6 text-base text-white"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  ) : null}
                  <TouchableOpacity
                    onPress={() => toggleSearch(!showSearch)}
                    style={{ backgroundColor: theme.bgWhite(0.3) }}
                    className="m-1 rounded-full p-3">
                    <MagnifyingGlassIcon size={25} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              {locations.length > 0 && showSearch ? (
                <View className="absolute top-16 w-full rounded-3xl bg-gray-300">
                  {locations.map((loc, index) => {
                    const location: any = JSON.parse(JSON.stringify(loc));
                    let showBorder: boolean = index + 1 !== locations.length;
                    let borderClass: string = showBorder ? 'border-b-2 border-b-gray-400' : '';
                    return (
                      <TouchableOpacity
                        key={index}
                        className={`mb-1 flex-row items-center border-0 ${borderClass} p-3 px-4`}
                        onPress={() => handleLocation(location)}>
                        <MapPinIcon size="20" color="gray" />
                        <Text className="ml-2 text-lg text-black">
                          {location?.name}, {location?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/* Forecast Section */}
            <View className="mx-4 mb-2 flex flex-1 justify-around">
              {/* Location */}
              <Text className="text-center text-2xl font-bold text-white">
                {location?.name},{' '}
                <Text className="text-lg font-semibold text-gray-300">{location?.country}</Text>
              </Text>
              {/* Weather Image */}
              <View className="flex-row justify-center">
                <Image
                  source={
                    weatherImages[current?.condition?.text]
                      ? weatherImages[current?.condition?.text]
                      : { uri: `https:${current?.condition?.icon}` }
                  }
                  className="h-52 w-52"
                />
              </View>
              {/* Temperature */}
              <View className="space-y-2">
                <Text className="ml-5 text-center text-6xl font-bold text-white">
                  {parseInt(current?.temp_c)}&#176;
                </Text>
                <Text className="text-center text-xl tracking-widest text-white">
                  {current?.condition?.text}
                </Text>
              </View>
              {/* Other Stats */}
              <View className="mx-4 flex-row justify-between">
                <View className="flex-row items-center space-x-2">
                  <Image source={require('@/assets/icons/wind.png')} className="h-6 w-6" />
                  <Text className="ml-1 text-base font-semibold text-white">
                    {current?.wind_kph}km/h
                  </Text>
                </View>
                {Platform.OS === 'ios' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image
                      source={require('@/assets/icons/drop.png')}
                      style={{ width: 24, height: 24, resizeMode: 'contain' }}
                    />
                    <Text
                      style={{ marginLeft: 8, fontSize: 16, color: 'white', fontWeight: '600' }}>
                      {current?.humidity}%
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center space-x-2">
                    <Image source={require('@/assets/icons/drop.png')} className="h-6 w-6" />
                    <Text className="ml-1 text-base font-semibold text-white">
                      {current?.humidity}%
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center space-x-2">
                  <Image source={require('@/assets/images/sun.png')} className="h-6 w-6" />
                  <Text className="ml-1 text-base font-semibold text-white">
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>
            {/* Forecast Section for next days */}
            <View className="mb-2 space-y-3">
              <View className="mx-5 mb-5 flex-row items-center space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-base text-white">Daily Forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}>
                {weather?.forecast?.forecastday?.map((item: any, index: number): ReactElement => {
                  const date: Date = new Date(item?.date);
                  const options: any = { weekday: 'long' };
                  const dayName: string = date.toLocaleDateString('en-US', options);
                  return (
                    <View
                      key={index}
                      className="mr-4 flex w-24 items-center justify-center space-y-1 rounded-3xl py-3"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}>
                      <Image
                        source={
                          weatherImages[item?.day?.condition?.text]
                            ? weatherImages[item?.day?.condition?.text]
                            : { uri: `https:${item?.day?.condition?.icon}` }
                        }
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-xl font-semibold text-white">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
