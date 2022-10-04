import React from 'react'
import triangle from './triangle.svg';
import background from './background.svg';
import { useNavigate } from "react-router-dom";
import css from './homepage.css';

const Homepage = () => {

    let navigate = useNavigate();
    const routeChange = () =>{
        navigate('/unauthorized');
    }

    return (
        <div class="homepage_main" style={{ backgroundImage: `url(${background})` }}>
            <div class="homepage_title">ezHouse</div>



            <div class="homepage_body">
                <div class="homepage_bodyt1">Locate your dream home</div>
                <div>One stop service to locate your dream home in Singapore with Artificial Intelligence price predictor</div>

                <form class="form-inline homepage_form" action="/action_page.php">
                <input type="text" class="fontAwesome form_element text" name="postalcode" placeholder="&#xF002; Enter postal code" value=""/>
                    <select id="flatstorey" class="form_element select">
                        <option value="" disabled selected hidden>FLAT STOREY</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                    </select>
                    <select id="flattype" class="form_element select" placeholder="boo">
                        <option value="" disabled selected hidden>TOWN</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                    </select>
                    <select id="flattype" class="form_element select" placeholder="boo">
                        <option value="" disabled selected hidden>FLAT TYPE</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                    </select>
                    <div class="homepage_formbuttonwrap">
                        <button class="fontAwesome homepage_formbutton" type="submit form_element" onClick={routeChange}>SEARCH &nbsp;&#xF061;</button>

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
