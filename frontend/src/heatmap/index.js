import React,{useState} from 'react';
import css from './heatmap.css';
import features from './sgheatmap.json';
import 'leaflet/dist/leaflet.css';
import {MapContainer, GeoJSON, TileLayer} from 'react-leaflet';



const Heatmap = () => {

    const [onselect, setOnselect] = useState({});
    /* function determining what should happen onmouseover, this function updates our state*/
    const highlightFeature = (e=> {
        var layer = e.target;
        console.log(e.target);
        // setOnselect({
        //     county:County,
        //     total:Total,
        //     male:Male,
        //     female:Female,
        //     intersex:Intersex,
        //     density: Desnity
        // });
        layer.setStyle({
            weight: 1,
            color: "black",
            fillOpacity: 1
        });
    });
    /*resets our state i.e no properties should be displayed when a feature is not clicked or hovered over */
    const resetHighlight= (e =>{
        // setOnselect({});
        e.target.setStyle(style(e.target.feature));
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
            ? '#000000'
            : '#ffffff';
    })
    const style = (feature => {
        return ({
            fillColor: mapPolygonColorToDensity(feature.properties.Desnity),
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '2',
            fillOpacity: 0.5
        });
    });
    const mapStyle = {
        height: '55vh',
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

    </div>
  )
}

export default Heatmap