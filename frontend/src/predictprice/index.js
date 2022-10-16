import React, { useEffect, useState } from 'react'
import { useLocation } from "react-router-dom";
import css from './predict.css'
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMapEvents, useMap, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';
import Loader from "react-spinners/ClipLoader";


function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
//https://github.com/pointhi/leaflet-color-markers
var greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



const PredictPrice = () => {
  let [loading, setLoading] = useState(false);
  const { state } = useLocation();
  var backendData = { latitude: 1.3435001655425816, longitude: 103.70334820770225 };
  const [data, setData] = useState(backendData);
  const [amenities, setAmenities] = useState([]);
  var test = [1.3435001655425816, 103.70334820770225]
  const [position, setPosition] = useState(test)
  const [markers, setMarkers] = useState([{ "name": "test", "position": [1.3654149, 103.8506386] }]);

  useEffect(() => {

    console.log(state)
    axios({
      method: 'get',
      url: 'http://13.228.217.57:5000/predict?postal_code=' + state.postal_code + '&town=' + state.town + '&flat_type=' + state.flat_type + '&storey_range=' + state.storey_range
    })
      .then(res => {
        console.log(res.data);
        res.data.predicted_price = res.data.predicted_price.toLocaleString();
        backendData = res.data;
        setData(backendData);
        var positionVal = [parseFloat(res.data.latitude), parseFloat(res.data.longitude)]
        console.log(positionVal)
        setPosition(positionVal)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })
      setLoading(true);
    axios({
      method: 'get',
      url: 'http://13.228.217.57:5000/amenities?postal_code=' + state.postal_code
    })
      .then(res => {
        console.log(res.data);
        setAmenities(res.data.education);
        let markerObj = [{}];
        for (let i = 0; i < res.data.education.length; i++) {
          markerObj[i] = { "name": res.data.education[i].name, "position": [res.data.education[i].location.lat, res.data.education[i].location.lon] }
        }
        setMarkers(markerObj);
        console.log(markerObj);
        console.log(amenities);
      setLoading(false);

      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })

  }, []);

  function LocationMarkers() {
    const map = useMapEvents({
    });

    return (
      <React.Fragment>
        {markers.map(marker =>
          <Marker position={marker.position} icon={greenIcon} >
            <Tooltip>{marker.name}</Tooltip>
          </Marker>)}
      </React.Fragment>
    );
  }

  const mapStyle = {
    height: '100vh',
    width: '100%',
    margin: '0',
  }
  return (
    <>
                {
                loading &&
                <div id="loadingOverlay" class="loadingOverlay pageOverlay"></div>

            }
      <div class="predictprice_title">
        ezHouse
      </div>

      <div class="predictprice_wrapper">
        <div class="predictprice_textwrapper">
          <div class="predictprice_imgwrap">
            <img class="predictprice_img" src={data.image}></img>
            <div class="predictprice_predicttextwrap">
              <p class="predictprice_predicttext_label">PREDICTED PRICE</p>
              <h1 class="predictprice_predicttext">${data.predicted_price}.00</h1>
            </div>
          </div>
          <div class="predictprice_hdbinfowrap">
            {data.address}<br></br>
            {data.total_dwelling_units} units total<br></br>
            {data.max_floor_lvl} storey<br></br>
          </div>
          <div class="predictprice_amentieswrap">
            <div class="predictprice_amenitiestext">Amenities</div>
            <div class="predictprice_amenitiescontentwrap">
              {

                amenities.map((oneAmenities) => (
                  amenities.length > 0 ?
                    <div class="predictprice_oneAmenities">
                      <img class="predictprice_oneAmenitiesImg" src={oneAmenities.image == null ? "https://via.placeholder.com/150" : oneAmenities.image}></img>
                      <div class="predictprice_oneAmenitiesTextWrap">
                        <div class="predictprice_oneAmenitiesTitle">{oneAmenities.name}</div>
                        <div class="predictprice_oneAmenitiesAddress">ADDRESS DASDADASDASDAS</div>
                      </div>
                    </div>
                    : null
                ))

              }

            </div>
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
            <LocationMarkers></LocationMarkers>
            <Marker position={position}></Marker>
          </MapContainer>
        </div>
        <Loader
                    color={"#36d7b7"}
                    loading={loading}
                    className="loader"
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
        </div>
    </>
  )
}

export default PredictPrice