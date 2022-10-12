import React, { useState } from 'react'
import triangle from './triangle.svg';
import background from './background.svg';
import { useNavigate } from "react-router-dom";
import css from './homepage.css';
import axios from 'axios';

const Homepage = () => {

    let navigate = useNavigate();
    const routeChange = () => {
        navigate('/login');
    }
    const flat_type = ['1 ROOM', '2 ROOM', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE', 'MULTI-GENERATION'];
    const storey_ranges = ['01 TO 03', '04 TO 06', '07 TO 09', '10 TO 12', '13 TO 15', '16 TO 18', '19 TO 21', '22 TO 24', '25 TO 27', '28 TO 30', '31 TO 33', '34 TO 36', '37 TO 39', '40 TO 42', '43 TO 45', '46 TO 48', '49 TO 51']
    const townarray = 
    ['ANG MO KIO',
        'BEDOK',
        'BISHAN',
        'BUKIT BATOK',
        'BUKIT MERAH',
        'BUKIT PANJANG',
        'BUKIT TIMAH',
        'CENTRAL AREA',
        'CHOA CHU KANG',
        'CLEMENTI',
        'GEYLANG',
        'HOUGANG',
        'JURONG EAST',
        'JURONG WEST',
        'KALLANG/WHAMPOA',
        'MARINE PARADE',
        'PASIR RIS',
        'PUNGGOL',
        'QUEENSTOWN',
        'SEMBAWANG',
        'SENGKANG',
        'SERANGOON',
        'TAMPINES',
        'TOA PAYOH',
        'WOODLANDS',
        'YISHUN'];
    

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
        navigate('/predictprice', { state : values})
   
    }

    return (
        <div class="homepage_main" style={{ backgroundImage: `url(${background})` }}>
            <div class="homepage_title">ezHouse</div>



            <div class="homepage_body">
                <div class="homepage_bodyt1">Locate your dream home</div>
                <div>One stop service to locate your dream home in Singapore with Artificial Intelligence price predictor</div>

                <form class="form-inline homepage_form" onSubmit={handleSubmit}>
                    <input type="text" class="fontAwesome form_element text" name="postalcode" placeholder="&#xF002; Enter postal code" value={values.postalcode} onChange={handlePostalCodeChange} />
                    <select id="flatstorey" class="form_element select" onChange={handleFlatStoreyChange}>
                        <option value="" disabled selected hidden>FLAT STOREY</option>
                        {storey_ranges.map((option, index) => (
                            <option key={index} value={option.replace(/\s+/g, '')}>
                                {option}
                            </option>
                    ))}
                    </select>
                    <select id="flattype" class="form_element select" onChange={handleTownChange}>
                        <option value="" disabled selected hidden>TOWN</option>
                        {townarray.map((option, index) => (
                            <option key={index} value={option.replace(/\s+/g, '')}>
                                {option}
                            </option>
                    ))}
                    </select>
                    <select id="flattype" class="form_element select" onChange={handleFlatTypeChange}>
                        <option value="" disabled selected hidden>FLAT TYPE</option>
                        {flat_type.map((option, index) => (
                            <option key={index} value={option.replace(/\s+/g, '')}>
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
