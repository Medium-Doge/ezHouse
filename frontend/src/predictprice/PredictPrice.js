import React, { useEffect, useState } from 'react'
import { redirect, useLocation } from "react-router-dom";
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
var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var violetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});




const PredictPrice = () => {
  let [loading, setLoading] = useState(false);
  const { state } = useLocation();
  var backendData = { latitude: 1.3435001655425816, longitude: 103.70334820770225, history: [ {}] };
  const [data, setData] = useState(backendData);
  const [amenities, setAmenities] = useState([]);
  var defaultLoc = [1.3435001655425816, 103.70334820770225]
  const [position, setPosition] = useState(defaultLoc)
  const [markers, setMarkers] = useState([{ "name": "test", "location": { "lat": 1.3435001655425816, "lon": 103.70334820770255 }, "category": "food" }]);
  const [filterVal, setFilterVal] = useState("")
  const [activeButton, setActiveButton] = useState("")
  useEffect(() => {

    console.log(state)
    axios({
      method: 'post',
      url: process.env.REACT_APP_ENDPOINT + '/api/predict',
      // url: 'http://13.228.217.57:5000/api/predict',
      data: {"postal_code": state.postal_code,
              "town": state.town,
              "flat_type": state.flat_type,
              "storey_range": state.storey_range,
              "session": "1ee990060ea77e2a079861ff02fa3619a29dbb8beca06f05e606309efe853070"
            }
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
      // url: 'http://13.228.217.57:5000/api/amenities?postal_code=' + state.postal_code
      url: process.env.REACT_APP_ENDPOINT + '/api/amenities?postal_code=' + state.postal_code
    })
      .then(res => {
        console.log(res.data);
        setAmenities(res.data.results);

        setMarkers(res.data.results);
        // console.log(markerObj);
        // console.log(amenities);
        setLoading(false);

      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          setLoading(false);

        }
      })

  }, []);

  function LocationMarkers() {
    const map = useMapEvents({
    });

    return (
      <React.Fragment>
        {markers.map(marker =>
          <Marker position={[marker.location.lat, marker.location.lon]}
            icon={marker.category == "food" ? redIcon : marker.category == "transport" ? greenIcon : marker.category == "leisure" ? goldIcon
              : marker.category == "education" ? violetIcon : orangeIcon} >
            <Tooltip><span style={{ fontWeight: "bold" }}>{marker.name}</span><br></br><br></br>{marker.category.toUpperCase()}<br></br><br></br>{marker.address}</Tooltip>
          </Marker>)}
      </React.Fragment>
    );
  }

  const mapStyle = {
    height: '100vh',
    width: '100%',
    margin: '0',
  }

  const filterCategories = (val) => (event) => {
    if (filterVal == val) setFilterVal("")
    else setFilterVal(val)
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
              <p class="predictprice_predicttext_label">EXTRA DETAILS</p>
              <div class="predictprice_hdbinfowrap">
                <span class="predictprice_hdbinfotext">ADDRESS: {data.address}</span>
                <span class="predictprice_hdbinfotext">TOTAL UNITS: {data.total_dwelling_units} units total</span>
                <span class="predictprice_hdbinfotext">MAX STOREY: {data.max_floor_lvl} storey</span>
              </div>
            </div>
          </div>

          <div class="predictprice_amentieswrap">
            <div class="predictprice_amenitiestext">Amenities</div>
            <div class="predictprice_filterwrap">
              <span class="predictprice_filterText">FILTER BY:</span>
              <button style={{color: "red", border: "1px solid red", backgroundColor: "white"}} className={filterVal == 'food' ? "predictprice_filterbutton activeButton" : "predictprice_filterbutton"} onClick={filterCategories("food")}>FOOD</button>
              <button style={{color: "green", border: "1px solid green", backgroundColor: "white"}} className={filterVal == 'transport' ? "predictprice_filterbutton activeButton" : "predictprice_filterbutton"} onClick={filterCategories("transport")}>TRANSPORT</button>
              <button style={{color: "purple", border: "1px solid purple", backgroundColor: "white"}} className={filterVal == 'education' ? "predictprice_filterbutton activeButton" : "predictprice_filterbutton"} onClick={filterCategories("education")}>EDUCATION</button>
              <button style={{color: "orange", border: "1px solid orange", backgroundColor: "white"}} className={filterVal == 'leisure' ? "predictprice_filterbutton activeButton" : "predictprice_filterbutton"} onClick={filterCategories("leisure")}>LEISURE</button>

            </div>
            <div class="predictprice_amenitiescontentwrap">
              {
                amenities.filter(amenities => amenities.category.includes(filterVal)).map((oneAmenities) => (
                  amenities.length > 0 ?
                    <div class="predictprice_oneAmenities">
                      <img class="predictprice_oneAmenitiesImg" src={oneAmenities.image == null ? "https://via.placeholder.com/150" : oneAmenities.image}></img>
                      <div class="predictprice_oneAmenitiesTextWrap">
                        <div class="predictprice_oneAmenitiesTitle">{oneAmenities.name}</div>
                        <div class="predictprice_oneAmenitiesCategory">{oneAmenities.category.toUpperCase()}</div>

                        <div class="predictprice_oneAmenitiesAddress">{oneAmenities.address}</div>
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
            <Marker position={position}>
              <Tooltip>{data.address}</Tooltip>
            </Marker>
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
      <div class="predictprice_historywrap">
            <div class="predictprice_historytext">Previously Sold</div>

            <div class="predictprice_historycontentwrap">
            <div class="predictprice_oneAmenities">
                      <table id="predictprice_historytable">
                        <tr>
                          <th>Index</th>
                          <th>Block</th>
                          <th>Flat Model</th>
                          <th>Flat Type</th>
                          <th>Floor Sq Area</th>
                          <th>Lease Commence Date</th>
                          <th>Month</th>
                          <th>Postal Code</th>
                          {/* <th>Remaing Lease Months</th> */}
                          <th>Resale Price</th>
                          <th>Storey Range</th>
                          <th>Street Name</th>
                          <th>Town</th>
                        </tr>
              {
                data.history.map((oneHistory, index) => (
                  data.history.length > 0 ?
                      <>
                        <tr>
                          <td>{index+1}</td>
                          <td>{oneHistory.block}</td>
                          <td>{oneHistory.flat_model}</td>
                          <td>{oneHistory.flat_type}</td>
                          <td>{oneHistory.floor_area_sqm}</td>
                          <td>{oneHistory.lease_commence_date}</td>
                          <td>{oneHistory.month}</td>
                          <td>{oneHistory.postal_code}</td>
                          {/* <td>{oneHistory.remaining_lease (months)}</td> */}
                          <td>{oneHistory.resale_price}</td>
                          <td>{oneHistory.storey_range}</td>
                          <td>{oneHistory.street_name}</td>
                          <td>{oneHistory.town}</td>

                        </tr>
                      </>
                    : null
                ))

              }
                      </table>
                    </div>
            </div>
          </div>
    </>
  )
}

export default PredictPrice
