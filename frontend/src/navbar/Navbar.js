import React, {useState,useEffect } from 'react'
import doge from './doge.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const logOut = (event) => {
        auth = {}
    }
    return (
        <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid black" }} >
            <div style={{ display: "flex", alignItems: "center", flexBasis: "10%" }}>
                <img src={doge} style={{ width: "50px" }}></img>
                ezHouse
            </div>
            <div style={{flexGrow: "1", display: "flex", textAlign: "center"}}>
                <Link style={{flexBasis: "10%", textDecoration: "none"}} to="/" class="link" smooth>Home</Link>
                <Link style={{flexBasis: "10%", textDecoration: "none"}}  to="/searchHouses" class="link" smooth>Search Houses</Link>
            </div>
            <div style={{marginLeft: "auto", flexBasis: "5%"}}>
            {auth.user == null ? 
                <Link style={{textDecoration: "none"}} to="/login">LOGIN</Link> : <Link to="/" style={{textDecoration: "none"}} onClick={logOut} >LOG OUT</Link>}
                
                </div>
            <div>
                
            </div>
        </div>
    )
}

export default Navbar