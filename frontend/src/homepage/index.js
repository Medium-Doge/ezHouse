import React, { useState, useEffect } from 'react'
import triangle from './triangle.svg';
import background from './background.svg';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import css from './homepage.css';
import axios from 'axios';

const Homepage = () => {

    const { setAuth } = useContext(AuthContext);

    let navigate = useNavigate();

    const [flat_type, setFlatType] = useState([])
    const [storey_ranges, setStoreyRange] = useState([])
    const [towns, setTowns] = useState([])

    useEffect(() => {

        axios({
            method: 'get',
            url:'http://13.228.217.57:5000/api/categories'})
            .then(res => {
            console.log(res.data);
            setTowns(res.data.towns);
            setFlatType(res.data.flat_types);
            setStoreyRange(res.data.storey_ranges);
          })

    }, []);

    const [values, setValues] = useState({
        postal_code: '',
        storey_range: '',
        town: '',
        flat_type: ''
    });

    const handlePostalCodeChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            postal_code: event.target.value,
        }));
    };

    const handleFlatStoreyChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            storey_range: event.target.value,
        }));
    };

    const handleTownChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            town: event.target.value,
        }));
    };

    const handleFlatTypeChange = (event) => {
        event.persist();
        setValues((values) => ({
            ...values,
            flat_type: event.target.value.trim(),
        }));
    };

    const handleSubmit = (event) => {
        console.log(values);
        navigate('/predictPrice', { state : values})

    }

    return (
        <div class="homepage_main" style={{ backgroundImage: `url(${background})` }}>
            <div class="homepage_title">ezHouse</div>



            <div class="homepage_body">
                <div class="homepage_bodyt1">Locate your dream home</div>
                <div>One stop service to locate your dream home in Singapore with Artificial Intelligence price predictor.</div>

                <form class="form-inline homepage_form" onSubmit={handleSubmit}>
                    <input type="text" class="fontAwesome form_element text" name="postalcode" placeholder="   &#xF002; Enter postal code" value={values.postalcode} onChange={handlePostalCodeChange} />
                    <select id="flatstorey" class="form_element select" onChange={handleFlatStoreyChange}>
                        <option value="" disabled selected hidden>FLAT STOREY</option>
                        {storey_ranges.map((option, index) => (
                            // <option key={index} value={option.replace(/\s+/g, '')}>
                            <option key={index} value={option}>

                                {option}
                            </option>
                    ))}
                    </select>
                    <select id="flattype" class="form_element select" onChange={handleTownChange}>
                        <option value="" disabled selected hidden>TOWN</option>
                        {towns.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                    ))}
                    </select>
                    <select id="flattype" class="form_element select" onChange={handleFlatTypeChange}>
                        <option value="" disabled selected hidden>FLAT TYPE</option>
                        {flat_type.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                    ))}
                    </select>
                    <div class="homepage_formbuttonwrap form_element">
                        <button class="fontAwesome homepage_formbutton" type="submit" >SEARCH &nbsp;&#xF061;</button>

                    </div>
                </form>
            </div>
            <div class="homepage_stats">
                <div class="homepage_statsbox">
                    <div class="homepage_statstitle">70k</div>
                    <div class="homepage_statscaption">Happy home owners</div>
                </div>
                <div class="homepage_statsbox">
                    <div class="homepage_statstitle">1.6M</div>
                    <div class="homepage_statscaption">Property Sold.</div>
                </div>
                <div class="homepage_statsbox">
                    <div class="homepage_statstitle">100K</div>
                    <div class="homepage_statscaption">Home Listing</div>
                </div>
            </div>
            <img class="triangle" src={triangle} alt="trng"></img>
        </div>

    )
}

export default Homepage
