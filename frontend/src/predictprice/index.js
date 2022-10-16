import React, { useEffect, useState } from 'react'
import { useLocation } from "react-router-dom";
import css from './predict.css'
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMapEvents, useMap, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';


function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const PredictPrice = () => {
  const { state } = useLocation();
  var backendData = { latitude: 1.3435001655425816, longitude: 103.70334820770225 };
  const [data, setData] = useState(backendData);
  var test = [1.3435001655425816, 103.70334820770225]
  const [position, setPosition] = useState(test)
  useEffect(() => {
    console.log("HI")

    console.log(state)
    axios({
      method: 'get',
      url: 'http://13.228.217.57:5000/predict?postal_code=' + state.postal_code + '&town=' + state.town + '&flat_type=' + state.flat_type + '&storey_range=' + state.storey_range,
      withCredentials: false
    })
      .then(res => {
        console.log(res.data);
        backendData = res.data;
        setData(backendData);
        var positionVal = [parseFloat(res.data.latitude), parseFloat(res.data.longitude)]
        console.log("boo")
        console.log(positionVal)
        setPosition(positionVal)
      })

  }, []);

  const mapStyle = {
    height: '100vh',
    width: '100%',
    margin: '0',
  }
  return (
    <>
      <div class="predictprice_title">
        ezHouse
      </div>

      <div class="predictprice_wrapper">
        <div class="predictprice_textwrapper">
          <div class="predictprice_imgwrap">
            <img class="predictprice_img" src={data.image}></img>
            <div class="predictprice_predicttextwrap">
              <p class="predictprice_predicttext_label">PREDICTED PRICE</p>
              <h1 class="predictprice_predicttext">${data.predicted_price.toLocaleString()}.00</h1>
            </div>
          </div>
          <div class="predictprice_hdbinfowrap">
            {data.address}<br></br>
            {data.total_dwelling_units} units total<br></br>
            {data.max_floor_lvl} storey<br></br>
          </div>
          <div class="predictprice_amentieswrap">
            <div class="predictprice_amenitiestext">Amenities</div>

          </div>

        </div>
        <div class="predictprice_mapwrapper">
          <MapContainer zoom={11}
            style={mapStyle}
            dragging={true}
            scrollWheelZoom={false}
            center={[1.3521, 103.8198]}>
            <ChangeView center={position} zoom={16}></ChangeView>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Circle
              center={position}
              radius={1000}
              stroke={true}
            />
            <Marker position={position}></Marker>
          </MapContainer>
        </div></div>
    </>
  )
}

export default PredictPrice