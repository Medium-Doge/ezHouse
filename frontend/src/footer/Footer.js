import React from 'react'
import doge from '../navbar/doge.png';
import pikachu from './pikachu.png';

const Footer = () => {
    const style = {
        width: "50px"
    }
  return (
    <div style={{height: "150px", backgroundColor: "#4A73A1", display: "flex", alignItems: "center", borderTop: "2px solid black"}}>
        <div style={{color: "white", fontWeight: "bolder", fontSize:"24px", marginLeft: "10px", display: "flex", alignItems: "center"}}>
            Done by Medium Doge <img src={doge} style={style}/><img src={doge} style={style}/><img src={pikachu} style={style}/><img src={doge} style={style}/><img src={doge} style={style}/>
        </div>
    </div>
  )
}

export default Footer