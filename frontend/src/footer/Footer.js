import React from 'react'
import doge from '../navbar/doge.png';
import pikachu from './pikachu.png';
import gengar from './gengar.png';
import bulbasaur from './bulbasaur.png';
import magikarp from './magikarp.webp';

const Footer = () => {
    const style = {
        width: "50px"
    }
  return (
    <div style={{height: "150px", backgroundColor: "#4A73A1", display: "flex", alignItems: "center", borderTop: "2px solid black"}}>
        <div style={{color: "white", fontWeight: "bolder", fontSize:"24px", marginLeft: "10px", display: "flex", alignItems: "center"}}>
            Done by Medium Doge
             <img src={gengar} style={style} title="SEAN"/>
             <img src={bulbasaur} style={style} title="DON"/>
             <img src={pikachu} style={style} title=""/>
             <img src={magikarp} style={style} title="TAO"/>
             <img src={doge} style={style} title="FAIZ"/>
        </div>
    </div>
  )
}

export default Footer