import React,{useState} from 'react';
import css from './heatmap.css';
import features from './sgheatmap.json';
import 'leaflet/dist/leaflet.css';
import {MapContainer, GeoJSON, TileLayer} from 'react-leaflet';

function getRandom() {
    const min = 0;
    const max = 3500;
    const rand = min + Math.random() * (max - min);
    return rand;
}

const Heatmap = () => {

    const [onselect, setOnselect] = useState({});
    /* function determining what should happen onmouseover, this function updates our state*/
    const highlightFeature = (e=> {
        var layer = e.target;
        console.log(e.target.feature.properties.PLN_AREA_N)
        layer.setStyle({
            weight: 1,
            color: "black",
            fillOpacity: 1
        });
    });
    /*resets our state i.e no properties should be displayed when a feature is not clicked or hovered over */
    const resetHighlight= (e =>{
        // setOnselect({});
        e.target.setStyle({
            fillOpacity: 0.5
        });
    })
    /* this function is called when a feature in the map is hovered over or when a mouse moves out of it, the function calls two functions
     highlightFeature and resetHighlight*/
    const onEachFeature= (feature, layer)=> {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    const mapPolygonColorToDensity=(density => {
        return density > 3023
            ? '#a50f15'
            : density > 676
            ? '#de2d26'
            : density > 428
            ? '#fb6a4a'
            : density > 236
            ? '#fc9272'
            : density > 23
            ? '#fcbba1'
            : '#fee5d9';
    })
    const style = (feature => {
        return ({
            fillColor: mapPolygonColorToDensity(getRandom()),
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '2',
            fillOpacity: 0.5
        });
    });
    const mapStyle = {
        height: '100vh',
        width: '85%',
        margin: '0 auto',
    }
    const feature = features.features.map(feature=>{
        return(feature);
    });
  return (
    <div>
        <div class="emptyspace">
        </div>
        <div class="heatmap_wrapper">
            <div class="heatmap_title">Discover Locations</div>
            <MapContainer zoom={11}
                 scrollWheelZoom={true} 
                  style={mapStyle} 
                   center={[1.3521, 103.8198]}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {feature && (
                    <GeoJSON data={feature} 
                    style={style} 
                    onEachFeature={onEachFeature}/>
                    )}
                </MapContainer>
        </div>
        <div class="emptyspace">
        </div>
    </div>
  )
}

export default Heatmap