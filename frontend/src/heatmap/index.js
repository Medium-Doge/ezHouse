import React, { useState, useEffect } from 'react';
import css from './heatmap.css';
import features from './sgheatmap.json';
import 'leaflet/dist/leaflet.css';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import axios from 'axios';


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const icons = {};
const fetchIcon = (count, size) => {
    if (!icons[count]) {
        icons[count] = L.divIcon({
            html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
        ${count}
      </div>`,
        });
    }
    return icons[count];
};

function getRandom() {
    const min = 0;
    const max = 3500;
    const rand = min + Math.random() * (max - min);
    return rand;
}

// function MyComponent() {
//     const [position, setPosition] = useState(null)
//     const map = useMapEvents({
//         click() {
//             console.log(e.latlng.lat);
//              console.log(e.latlng.lng);
//           },
//           locationfound(e) {
//             setPosition(e.latlng)
//             map.flyTo(e.latlng, map.getZoom())
//           },
//     })
//     return position === null ? null : (
//         <Marker position={position}>
//           <Popup>You are here</Popup>
//         </Marker>
//     )
//   }

//   const GetCoordinates = () => {
//     const map = useMap();

//     useEffect(() => {
//       if (!map) return;
//       const info = L.DomUtil.create('div', 'legend');

//       const positon = L.Control.extend({
//         options: {
//           position: 'bottomleft'
//         },

//         onAdd: function () {
//           info.textContent = 'Click on map';
//           return info;
//         }
//       })

//       map.on('click', (e) => {
//         console.log(e.latlng)
//         info.textContent = e.latlng;
//       })

//       map.addControl(new positon());

//     }, [map])


//     return null

//   }

const Heatmap = () => {
    const locations = [
        { "name": "jurong west", "position": [1.3435001655425816, 103.70334820770225], "totalrecords": 0 },
        { "name": "boon lay", "position": [1.3132791418613987, 103.70128876968724], "totalrecords": 0 },
        { "name": "jurong east", "position": [1.3160265228775339, 103.73355329858906], "totalrecords": 0 },
        { "name": "pioneer", "position": [1.3105317578251232, 103.66902424078542], "totalrecords": 0 },
        { "name": "clementi", "position": [1.3174002122510786, 103.75895303410752], "totalrecords": 0 },
        { "name": "bukit timah", "position": [1.3277028583560022, 103.79053108367104], "totalrecords": 0 },
        { "name": "bukit batok", "position": [1.3551763704852338, 103.75346119940082], "totalrecords": 0 },
        { "name": "tengah", "position": [1.3620447000702194, 103.72737498454404], "totalrecords": 0 },
        { "name": "choa chu kang", "position": [1.3833363969379069, 103.74590992667913], "totalrecords": 0 },
        { "name": "bukit panjang", "position": [1.3634183636412216, 103.77062318285925], "totalrecords": 0 },
        { "name": "queenstown", "position": [1.2803103359031265, 103.77748797624263], "totalrecords": 0 },
        { "name": "bukit merah", "position": [1.2739114383233257, 103.82181422395736], "totalrecords": 0 },
        { "name": "tanglin", "position": [1.3082700975171921, 103.81530222083379], "totalrecords": 0 },
        { "name": "newton", "position": [1.308098385759878, 103.83932899767558], "totalrecords": 0 },
        { "name": "orchard", "position": [1.3035480199139788, 103.83272163404405], "totalrecords": 0 },
        { "name": "river valley", "position": [1.29685124013572, 103.83452364230723], "totalrecords": 0 },
        { "name": "rochor", "position": [1.3037197319821734, 103.85245791502126], "totalrecords": 0 },
        { "name": "outram", "position": [1.2830028508200781, 103.84034567653346], "totalrecords": 0 },
        { "name": "downtown core", "position": [1.2838706449635333, 103.85441866913885], "totalrecords": 0 },
        { "name": "marina south", "position": [1.2628676759594684, 103.8758052124139], "totalrecords": 0 },
        { "name": "marina east", "position": [1.286233633379564, 103.87155590165384], "totalrecords": 0 },
        { "name": "marine parade", "position": [1.2821125121278913, 103.9034771908865], "totalrecords": 0 },
        { "name": "geylang", "position": [1.319202362006695, 103.88871788511227], "totalrecords": 0 },
        { "name": "bedok", "position": [1.3219497364900725, 103.92475805037495], "totalrecords": 0 },
        { "name": "tampines", "position": [1.3398075962485543, 103.95530638093094], "totalrecords": 0 },
        { "name": "changi", "position": [1.3481185405557317, 103.9976522956096], "totalrecords": 0 },
        { "name": "pasir ris", "position": [1.3777990591747185, 103.94762319457088], "totalrecords": 0 },
        { "name": "toa payoh", "position": [1.3348719598570578, 103.86026869876751], "totalrecords": 0 },
        { "name": "novena", "position": [1.3223371044136139, 103.8355554425874], "totalrecords": 0 },
        { "name": "kallang", "position": [1.3116910130680615, 103.86541729380507], "totalrecords": 0 },
        { "name": "serangoon", "position": [1.3642341782460863, 103.86679025248174], "totalrecords": 0 },
        { "name": "hougang", "position": [1.362001975301588, 103.89013054998519], "totalrecords": 0 },
        { "name": "paya lebar", "position": [1.35908293756251, 103.91432894666156], "totalrecords": 0 },
        { "name": "ang mo kio", "position": [1.3772839385202742, 103.84018917812118], "totalrecords": 0 },
        { "name": "bishan", "position": [1.3527297255914221, 103.84207699630161], "totalrecords": 0 },
        { "name": "sengkang", "position": [1.3906796074457959, 103.88892925268547], "totalrecords": 0 },
        { "name": "punggol", "position": [1.4056179762139827, 103.90832229399345], "totalrecords": 0 },
        { "name": "yishun", "position": [1.4143749066424613, 103.84139055850562], "totalrecords": 0 },
        { "name": "sembawang", "position": [1.4560986472134911, 103.81736378166386], "totalrecords": 0 },
        { "name": "woodlands", "position": [1.440645498838367, 103.78492763292746], "totalrecords": 0 },
        { "name": "mandai", "position": [1.422616693333251, 103.80775307092715], "totalrecords": 0 },
        { "name": "lim chu kang", "position": [1.4315452623513631, 103.7173094181013], "totalrecords": 0 },
        { "name": "seletar", "position": [1.415775838721734, 103.87780550240396], "totalrecords": 0 }
    ]

    const [isOpen, setIsOpen] = useState(0)
    const [isLoading, setLoading] = useState(true);
    const [locationValues, setLocationValues] = useState(locations);
    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }
    const [onselect, setOnselect] = useState({});


    useEffect(() => {
        axios({
            method: 'get',
            url: 'http://54.255.164.208:5000/categories',
            withCredentials: false
        })
            .then(res => {
                console.log(res.data);
                // for (let i = 0; i < locations.length; i++) {
                //     var x = locations[i].name.toUpperCase();
                //     if (res.data.town[locations[i].name.toUpperCase()] > 0) {
                //         locations[i].totalrecords = res.data.town[locations[i].name.toUpperCase()]
                //     }

                // }
                // setLocationValues(locations);
                // setLoading(false);
            })

    }, []);

    /* function determining what should happen onmouseover, this function updates our state*/
    const highlightFeature = (e => {
        var layer = e.target;
        console.log(e.target.feature.properties.PLN_AREA_N)
        layer.setStyle({
            weight: 1,
            color: "black",
            fillOpacity: 0.7
        });
    });
    /*resets our state i.e no properties should be displayed when a feature is not clicked or hovered over */
    const resetHighlight = (e => {
        // setOnselect({});
        e.target.setStyle({
            fillOpacity: 0.5
        });
    })
    /* this function is called when a feature in the map is hovered over or when a mouse moves out of it, the function calls two functions
     highlightFeature and resetHighlight*/
    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
        });
    }

    const mapPolygonColorToDensity = (e => {
        console.log(e)
        for (let i = 0; i < locationValues.length; i++) {
            if (locationValues[i].name.toUpperCase() == e) {
                let density = locationValues[i].totalrecords;
                return density > 200
                    ? '#a50f15'
                    : density > 100
                        ? '#de2d26'
                        : density > 50
                            ? '#fb6a4a'
                            : density > 20
                                ? '#fc9272'
                                : density > 5
                                    ? '#fcbba1'
                                    : '#000000';

            }
        }

    })

    const style = (feature => {
        return ({
            fillColor: mapPolygonColorToDensity(feature.properties.PLN_AREA_N),
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
    const feature = features.features.map(feature => {
        return (feature);
    });

    function test(e) {
        console.log(e);
        console.log("yoo")

        setIsOpen(true);

    }
    if (isLoading) {
        return <div className="App">Loading...</div>;
    }

    return (
        <div>
            <div class="emptyspace">
            </div>
            <div class="heatmap_wrapper">
                <div class="heatmap_title">Discover Locations</div>
                <MapContainer zoom={11}
                    style={mapStyle}
                    dragging={true}
                    scrollWheelZoom={false}
                    center={[1.3521, 103.8198]}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locationValues.map((location) => (
                        location.totalrecords > 0 ?

                            <Marker position={location.position}
                                icon={fetchIcon(
                                    location.totalrecords,
                                    15
                                )} data={location.name} eventHandlers={{
                                    click: (e) => test(e)
                                }}>
                                <Tooltip>
                                    {location.name.toUpperCase()}
                                </Tooltip>
                            </Marker> : null
                    ))}
                    {feature && (
                        <GeoJSON data={feature}
                            style={style}
                            onEachFeature={onEachFeature} />
                    )}
                </MapContainer>
                <Drawer
                    open={isOpen}
                    onClose={toggleDrawer}
                    direction='right'
                    className='bla bla bla'
                >
                    <div>Hello World</div>
                </Drawer>
            </div>

            <div class="emptyspace">
            </div>
        </div>
    )
}

export default Heatmap