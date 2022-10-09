import React, {useEffect, useState} from 'react'
import { useLocation } from "react-router-dom";
import css from './predict.css'
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';




const PredictPrice = () => {
  const {state} = useLocation();
  var backendData = {longitude: "1.36", latitude: "110.3"};
  const [data, setData] = useState(backendData);
  var test = ["1.36", "110.32"]
  const [position, setPosition] = useState(test)
  useEffect(() => {
    console.log("HI")

    console.log(state)
    axios({method: 'get', 
        url:'http://54.255.164.208:5000/predict?postal_code=' + state.postal_code + '&town=' + state.town + '&flat_type=' + state.flat_type + '&storey_range=' + state.storey_range,
        withCredentials: false})
        .then(res => {
        console.log(res.data);
        backendData = res.data;
        setData(backendData);
        var positionVal = [data.latitude, data.longitude]
        setPosition(positionVal)
      })

}, []);

const mapStyle = {
  height: '100vh',
  width: '100%',
  margin: '0',
}
  return (
    <div class="predictprice_wrapper">
      <div class="predictprice_textwrapper">
      {data.predicted_price}xxx
      </div>
    <div class="predictprice_mapwrapper">
    <MapContainer zoom={11}
                    style={mapStyle}
                    dragging={true}
                    scrollWheelZoom={false}
                    center={[1.3521, 103.8198]}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </MapContainer>
      </div></div>
  )
}

export default PredictPrice