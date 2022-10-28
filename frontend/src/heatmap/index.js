import React, { useState, useEffect } from 'react';
import css from './heatmap.css';
import features from './sgheatmap.json';
import 'leaflet/dist/leaflet.css';
import { MapContainer, GeoJSON, TileLayer, Marker, Popup, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import axios from 'axios';
import Loader from "react-spinners/ClipLoader";
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


// const GetCoordinates = () => {
//     const map = useMap();
//     // const https = require('node:https');
//
//     useEffect(() => {
//         if (!map) return;
//         const info = L.DomUtil.create('div', 'legend');
//
//         const positon = L.Control.extend({
//             options: {
//                 position: 'bottomleft'
//             },
//
//             onAdd: function () {
//                 info.textContent = 'Click on map';
//                 return info;
//             }
//         })
//
//         map.on('click', (e) => {
//             console.log(e.latlng)
//             info.textContent = e.latlng;
//         })
//
//         map.addControl(new positon());
//
//     }, [map])
//
//
//     return null
//
// }

const Heatmap = () => {

    const locations = [
        { "name": "jurong west", "position": [1.3435001655425816, 103.70334820770225], "totalrecords": 0, "records": [] },
        { "name": "boon lay", "position": [1.3132791418613987, 103.70128876968724], "totalrecords": 0, "records": [] },
        { "name": "jurong east", "position": [1.3160265228775339, 103.73355329858906], "totalrecords": 0, "records": [] },
        { "name": "pioneer", "position": [1.3105317578251232, 103.66902424078542], "totalrecords": 0, "records": [] },
        { "name": "clementi", "position": [1.3174002122510786, 103.75895303410752], "totalrecords": 0, "records": [] },
        { "name": "bukit timah", "position": [1.3277028583560022, 103.79053108367104], "totalrecords": 0, "records": [] },
        { "name": "bukit batok", "position": [1.3551763704852338, 103.75346119940082], "totalrecords": 0, "records": [] },
        { "name": "tengah", "position": [1.3620447000702194, 103.72737498454404], "totalrecords": 0, "records": [] },
        { "name": "choa chu kang", "position": [1.386495597286298, 103.7455989072713], "totalrecords": 0, "records": [] },
        { "name": "bukit panjang", "position": [1.3634183636412216, 103.77062318285925], "totalrecords": 0, "records": [] },
        { "name": "queenstown", "position": [1.2803103359031265, 103.77748797624263], "totalrecords": 0, "records": [] },
        { "name": "bukit merah", "position": [1.2739114383233257, 103.82181422395736], "totalrecords": 0, "records": [] },
        { "name": "tanglin", "position": [1.3082700975171921, 103.81530222083379], "totalrecords": 0, "records": [] },
        { "name": "newton", "position": [1.308098385759878, 103.83932899767558], "totalrecords": 0, "records": [] },
        { "name": "orchard", "position": [1.3035480199139788, 103.83272163404405], "totalrecords": 0, "records": [] },
        { "name": "river valley", "position": [1.29685124013572, 103.83452364230723], "totalrecords": 0, "records": [] },
        { "name": "rochor", "position": [1.3037197319821734, 103.85245791502126], "totalrecords": 0, "records": [] },
        { "name": "outram", "position": [1.2830028508200781, 103.84034567653346], "totalrecords": 0, "records": [] },
        { "name": "downtown core", "position": [1.2838706449635333, 103.85441866913885], "totalrecords": 0, "records": [] },
        { "name": "marina south", "position": [1.2628676759594684, 103.8758052124139], "totalrecords": 0, "records": [] },
        { "name": "marina east", "position": [1.286233633379564, 103.87155590165384], "totalrecords": 0, "records": [] },
        { "name": "marine parade", "position": [1.2821125121278913, 103.9034771908865], "totalrecords": 0, "records": [] },
        { "name": "geylang", "position": [1.3229634499283442, 103.89010280799121], "totalrecords": 0, "records": [] },
        { "name": "bedok", "position": [1.3219497364900725, 103.92475805037495], "totalrecords": 0, "records": [] },
        { "name": "tampines", "position": [1.3398075962485543, 103.95530638093094], "totalrecords": 0, "records": [] },
        { "name": "changi", "position": [1.3481185405557317, 103.9976522956096], "totalrecords": 0, "records": [] },
        { "name": "pasir ris", "position": [1.3782631955430769, 103.96219402261721], "totalrecords": 0, "records": [] },
        { "name": "toa payoh", "position": [1.337043690523248, 103.8585247584277], "totalrecords": 0, "records": [] },
        { "name": "novena", "position": [1.3223371044136139, 103.8355554425874], "totalrecords": 0, "records": [] },
        { "name": "kallang", "position": [1.3116910130680615, 103.86541729380507], "totalrecords": 0, "records": [] },
        { "name": "serangoon", "position": [1.3720817415516937, 103.86643015491924], "totalrecords": 0, "records": [] },
        { "name": "hougang", "position": [1.3634963623020968, 103.8866812954002], "totalrecords": 0, "records": [] },
        { "name": "paya lebar", "position": [1.35908293756251, 103.91432894666156], "totalrecords": 0, "records": [] },
        { "name": "ang mo kio", "position": [1.3813539165262414, 103.83725478303992], "totalrecords": 0, "records": [] },
        { "name": "bishan", "position": [1.3549109524320786, 103.83622506403243], "totalrecords": 0, "records": [] },
        { "name": "sengkang", "position": [1.3906796074457959, 103.88892925268547], "totalrecords": 0, "records": [] },
        { "name": "punggol", "position": [1.4056179762139827, 103.90832229399345], "totalrecords": 0, "records": [] },
        { "name": "yishun", "position": [1.4143749066424613, 103.84139055850562], "totalrecords": 0, "records": [] },
        { "name": "sembawang", "position": [1.4560986472134911, 103.81736378166386], "totalrecords": 0, "records": [] },
        { "name": "woodlands", "position": [1.440645498838367, 103.78492763292746], "totalrecords": 0, "records": [] },
        { "name": "mandai", "position": [1.422616693333251, 103.80775307092715], "totalrecords": 0, "records": [] },
        { "name": "lim chu kang", "position": [1.4315452623513631, 103.7173094181013], "totalrecords": 0, "records": [] },
        { "name": "seletar", "position": [1.415775838721734, 103.87780550240396], "totalrecords": 0, "records": [] }
    ]

    const [isOpen, setIsOpen] = useState(0)
    let [loading, setLoading] = useState(false);
    const [locationValues, setLocationValues] = useState(locations);
    const [drawerTitle, setDrawerTitle] = useState("");
    const [drawerRecords, setDrawerRecords] = useState([]);
    const [drawerTotal, setDrawerTotal] = useState();
    const [drawerAvgPrice, setDrawerAvgPrice] = useState(0);
    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }
    const [onselect, setOnselect] = useState({});


    useEffect(() => {
        setLoading(true);
        axios({
            method: 'get',
            url: process.env.REACT_APP_ENDPOINT + '/api/recentlysold',
            // url: 'http://13.228.217.57:5000/api/recentlysold'
        })
            .then(res => {
                const x = res.data;
                Object.keys(res.data).forEach(function (key, index) {
                    for (let i = 0; i < locations.length; i++) {
                        if (locations[i].name.toUpperCase() == key) {
                            locations[i].records = res.data[key].records;
                            locations[i].totalrecords = res.data[key].total;
                        }
                    }

                })
                setLocationValues(locations);
                setLoading(false);
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


    function openDrawer(e) {
        let index = 0;
        setLoading(true);
        var clickedname = e.target.options.data;
        for (let i = 0; i < locationValues.length; i++) {
            let oneLocation = locationValues[i];
            if (oneLocation.name == clickedname) {
                console.log(locationValues[i])

                setDrawerTitle(oneLocation.name.charAt(0).toUpperCase() + oneLocation.name.slice(1));
                setDrawerTotal(oneLocation.totalrecords);
                setDrawerRecords(oneLocation.records);
                var total = 0;
                index = i;
                for (let j = 0; j < oneLocation.records.length; j++) {
                    total += oneLocation.records[j].resale_price;
                }
                setDrawerAvgPrice((total / oneLocation.totalrecords).toLocaleString());
                break;
            }
        }
        let postalcodesArray = [];
        for (let x = 0; x < locationValues[index].records.length; x++) {
            postalcodesArray[x] = String(locationValues[index].records[x].postal_code);
            if (x == 29) break; //limit to 30
        }
        console.log(postalcodesArray);
        axios({
            method: 'post',
            url: process.env.REACT_APP_ENDPOINT + '/api/image',
            // url: 'http://13.228.217.57:5000/api/image',
            data: { "postalcodes": postalcodesArray }
        })
            .then(res => {
                Object.keys(res.data).forEach(function (key, i) {
                    for (let x = 0; x < locationValues[index].records.length; x++) {
                        if (locationValues[index].records[x].postal_code == key) {
                            locationValues[index].records[x].img = res.data[key];
                        }
                    }
                })
                setDrawerRecords(locationValues[index].records);
                setIsOpen(true);
                setLoading(false);

            })




    }
    return (
        <div>
            {
                loading &&
                <div id="loadingOverlay" class="loadingOverlay pageOverlay"></div>
            }
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
                                    click: (e) => openDrawer(e)
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
                    {/* <GetCoordinates></GetCoordinates> */}
                </MapContainer>

                <Drawer
                    open={isOpen}
                    onClose={toggleDrawer}
                    direction='right'
                    className='drawer'
                    size='400px'
                >
                    <div class="drawer_wrap">

                        <div class="drawer_titlewrap">
                            <div class="drawer_title">{drawerTitle}</div>
                            <div>{drawerTotal} Houses found in this estate.</div>
                            <div>Average price of the region is <span style={{ fontWeight: "bold" }}>${drawerAvgPrice}</span></div>
                        </div>
                        {
                            drawerRecords.map((record, index) => (
                                <div class="drawer_bodywrap">
                                    <img class="drawer_img" style={{ width: "150px", height: "150px" }} src={record.img}></img>
                                    <div class="drawer_bodytextwrap">
                                        <div>
                                            {record.block + " " + record.street_name}
                                        </div>
                                        <div>Type: {record.flat_model + " " + record.flat_type} </div>
                                        <div>Price: <br />${record.resale_price.toLocaleString()}.00</div>
                                    </div>
                                </div>

                            ))
                        }
                    </div>



                </Drawer>
                <Loader
                    color={"#36d7b7"}
                    loading={loading}
                    className="loader"
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>

            <div class="emptyspace">
            </div>
        </div>
    )
}

export default Heatmap
