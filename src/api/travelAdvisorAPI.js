/* eslint-disable consistent-return */
import axios from 'axios';
const API_KEY = process.env.REACT_APP_TRAVEL_ADVISOR_API_KEY;

export const getPlacesData = async (type, sw, ne) => {
  try {
    const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
      params: {
        bl_latitude: sw.lat,
        bl_longitude: sw.lng,
        tr_longitude: ne.lng,
        tr_latitude: ne.lat,
      },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getPlacesDataByID = async (location) => {
  try {
    console.log(' enter getPlacesDataByName: ');
    // Step 1: Get location_id from location name
    const response = await axios.get('https://travel-advisor.p.rapidapi.com/locations/auto-complete', {
      params: {
        query: location,
        lang: 'en_US',
        units: 'km',
      },
      headers: {
        'x-rapidapi-key': '76b011ede2mshe4a5a1c5a0654cdp1a1efajsn1209cd6b1950',
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
      },
    });
    console.log('API Response:', response.data);
    const locationDataArray = response.data.data;
    const locationEntry = locationDataArray.find((result) => result.result_type === 'geos');
    const locationID = locationEntry ? locationEntry.result_object.location_id : null;

    if (!locationID) {
      return []; // Return an empty array if locationID  is not found
    }
    console.log(' location id: ', locationID);
    // Step 2: Get attractions data using the locationID
    const data = await axios.get('https://travel-advisor.p.rapidapi.com/attractions/get-details', {
      params: {
        location_id: locationID,
        currency: 'USD',
        lang: 'en_US',
        lunit: 'km',
        sort: 'recommended',
      },
      headers: {
        'X-RapidAPI-Key': '76b011ede2mshe4a5a1c5a0654cdp1a1efajsn1209cd6b1950',
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
      },
    });
    console.log(' response: ', data.data);
    return [data.data];
  } catch (error) {
    console.log(error);
    return []; // Return an empty array in case of any error
  }
};

export const getPlacesDataByName = async (locations) => {
  try {
    console.log(' enter getPlacesDataByName: ', locations);

    const allData = await Promise.all(locations.map(async (location) => {
      const response = await axios({
        method: 'GET',
        url: 'https://travel-advisor.p.rapidapi.com/locations/search',
        params: {
          query: location,
          limit: '30',
          offset: '0',
          units: 'km',
          currency: 'USD',
          sort: 'relevance',
          lang: 'en_US',
        },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        },
      });

      console.log(`Response for ${location}:`, response.data);

      const locationDataArray = response.data.data;
      const locationEntry = locationDataArray.find((result) => ['geos', 'things_to_do', 'restaurants'].includes(result.result_type));
      const locationID = locationEntry ? locationEntry.result_object.location_id : null;

      if (!locationID) {
        console.log(`No location id for ${location}`);
        return null;
      }

      console.log(`Location id for ${location}: `, locationID);

      // Step 2: Get attractions data using the locationID
      const response2 = await axios.get('https://travel-advisor.p.rapidapi.com/attractions/get-details', {
        params: {
          location_id: locationID,
          currency: 'USD',
          lang: 'en_US',
          lunit: 'km',
          sort: 'recommended',
        },
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
        },
      });
      console.log(`Response for ${location} after get-details: `, response2.data);
      return response2.data;
    }));
    console.log('final response:', allData.filter((data) => data !== null));
    // Filter out any null values and return the result
    return allData.filter((data) => data !== null);
  } catch (error) {
    console.log(error);
    return []; // Return an empty array in case of any error
  }
};

export const getPlacesDataByNameOnce = async (location) => {
  try {
    console.log(' enter getPlacesDataByNam e: ', location);

    // 使用新接口获取数据
    const response = await axios({
      method: 'GET',
      url: 'https://travel-advisor.p.rapidapi.com/locations/search',
      params: {
        query: location[0], // 使用函数参数location作为查询条件
        limit: '30',
        offset: '0',
        units: 'km',
        currency: 'USD',
        sort: 'relevance',
        lang: 'en_US',
      },
      headers: {
        'X-RapidAPI-Key': '971d0a7675mshd27ffa52cb10a43p1732e0jsn6f4fcb5a198e',
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
      },
    });

    console.log('Response after location search:', response.data);
    const locationDataArray = response.data.data;
    const locationEntry = locationDataArray.find((result) => result.result_type === 'geos' || 'things_to_do' || 'restaurants');
    const locationID = locationEntry ? locationEntry.result_object.location_id : null;

    if (!locationID) {
      console.log(' no location id: ');
      return []; // Return an empty array if locationID  is not found
    }
    console.log(' location id: ', locationID);
    // Step 2: Get attractions data using the locationID
    const response2 = await axios.get('https://travel-advisor.p.rapidapi.com/attractions/get-details', {
      params: {
        location_id: locationID,
        currency: 'USD',
        lang: 'en_US',
        lunit: 'km',
        sort: 'recommended',
      },
      headers: {
        'X-RapidAPI-Key': '971d0a7675mshd27ffa52cb10a43p1732e0jsn6f4fcb5a198e',
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
      },
    });
    console.log(' response after get-details: ', response2.data);
    return [response2.data];
  } catch (error) {
    console.log(error);
    return []; // Return an empty array in case of any error
  }
};
// export const getWeatherData = async (lat, lng) => {
//   try {
//     if (lat && lng) {
//       const { data } = await axios.get('https://community-open-weather-map.p.rapidapi.com/find', {
//         params: { lat, lon: lng },
//         headers: {
//           'x-rapidapi-key': '76b011ede2mshe4a5a1c5a0654cdp1a1efajsn1209cd6b195',
//           'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
//         },
//       });

//       return data;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
