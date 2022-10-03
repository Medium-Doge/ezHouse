import React from 'react'
import css from './heatmap.css';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import geomap from './planning.json';
const geoUrl =
  "https://raw.githubusercontent.com/yongjun21/sg-heatmap/master/data/raw/npc-boundary.json"
  


const Heatmap = () => {
  return (
    <div>
        <div class="emptyspace">
        </div>
        <div class="heatmap_wrapper">
            <div class="heatmap_title">Discover Locations</div>
            <ComposableMap>
      <Geographies geography={geomap}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
    </ComposableMap>
        </div>

    </div>
  )
}

export default Heatmap