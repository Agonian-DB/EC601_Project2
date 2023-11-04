import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';
import { getPlacesDataByName, getPlacesData } from './api/travelAdvisorAPI';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';
import TravelAdvisorDialog from './components/Dialog/TravelAdvisorDialog';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');
  const [coords, setCoords] = useState({});
  const [bounds, setBounds] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [placeName, setPlaceName] = useState('');// for place names from LLM
  // const [mapCenter, setMapCenter] = useState(coords); // the center of the map, controlled by new places locaiton
  // const [consultingMode, setConsultingMode] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      setCoords({ lat: latitude, lng: longitude });
    });
  }, []);

  useEffect(() => {
    const filtered = places.filter((place) => Number(place.rating) > rating);
    setFilteredPlaces(filtered);
  }, [rating]);

  useEffect(() => {
    if (bounds && type) {
      setIsLoading(true);
      getPlacesData(type, bounds.sw, bounds.ne)
        .then((data) => {
          setPlaces(data.filter((place) => place.name && place.num_reviews > 0));
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);
        });
    }
  }, [type]);

  useEffect(() => {
    console.log(' enter useeffect: ', placeName);
    if (placeName) {
      // setConsultingMode(true);
      // console.log(' Place Name: ', placeName);
      setIsLoading(true);
      // 假设你有一个函数叫 getPlacesDataByName，它根据地点名称来获取数据
      getPlacesDataByName(placeName)
        .then((data) => {
          setPlaces(data);
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);
        });
    }
  }, [placeName]);

  useEffect(() => {
    // update the google map location
    const updateMapCenter = async () => {
      try {
        console.log('Map location changed!');
        const placesData = await getPlacesDataByName(placeName);
        if (placesData[0] && placesData[0].latitude && placesData[0].longitude) {
          setCoords({
            lat: parseFloat(placesData[0].latitude),
            lng: parseFloat(placesData[0].longitude),
          });
          console.error('update coords:', coords);
        }
        console.error('coords:', coords);
      } catch (error) {
        console.error('Error updating map center:', error);
      }
    };
    if (placeName) {
      updateMapCenter();
    }
  }, [placeName]);

  useEffect(() => {
    if (placeName) {
      setIsLoading(true);

      getPlacesDataByName(placeName)
        .then((data) => {
          setPlaces(data); // 更新places
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);

          // 更新地图位置
          if (data[0] && data[0].latitude && data[0].longitude) {
            setCoords({
              lat: parseFloat(data[0].latitude),
              lng: parseFloat(data[0].longitude),
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        });
    }
  }, [placeName]);

  const onLoad = (autoC) => setAutocomplete(autoC);

  const handlePlaceNameUpdate = (newPlaceName) => {
    console.log('placeName changed!', newPlaceName);
    setPlaceName(newPlaceName);
  };

  const onPlaceChanged = () => {
    const lat = autocomplete.getPlace().geometry.location.lat();
    const lng = autocomplete.getPlace().geometry.location.lng();
    setCoords({ lat, lng });
  };

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
      <Grid container spacing={3} style={{ width: '100%' }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            childClicked={childClicked}
            places={filteredPlaces.length ? filteredPlaces : places}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
          />
        </Grid>
        <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            places={filteredPlaces.length ? filteredPlaces : places}
          />
        </Grid>
      </Grid>
      <TravelAdvisorDialog onPlaceNameUpdate={handlePlaceNameUpdate} />
    </>
  );
};

export default App;
