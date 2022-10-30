import React, { useEffect, useState } from 'react'
import { redirect, useLocation } from "react-router-dom";
import css from './search.css'
import axios from 'axios';
import Loader from "react-spinners/ClipLoader";

export const SearchHouses = () => {
  let [loading, setLoading] = useState(false);
  const [towns, setTowns] = useState([])
  const [townToSearch, setSearchTown] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [houses, setHouses] = useState([])
  useEffect(() => {

    axios({
      method: 'get',
      //url:'http://13.228.217.57:5000/api/categories'})
      url: (process.env.REACT_APP_ENDPOINT) + '/api/categories'
    })
      .then(res => {
        setTowns(res.data.towns);
      })

  }, []);

  const handleTownChange = (event) => {
    event.persist();
    console.log(event.target.value)
    setSearchTown(event.target.value)

    setLoading(true)
    axios({
      method: 'post',
      //url:'http://13.228.217.57:5000/api/categories'})
      url: (process.env.REACT_APP_ENDPOINT) + '/api/soldintown',
      data: { "town": event.target.value, "page" : currentPage}
    })
      .then(res => {
        console.log(res.data);
        setHouses(res.data.results)
        setLoading(false)
      }) 
    
};


  return (
    <>
      {
        loading &&
        <div id="loadingOverlay" class="loadingOverlay pageOverlay"></div>

      }
      <div>

        <div class="searchHouse_selectWrapper">
          <select id="flattype" class="form_element select searchHouse_select" onChange={handleTownChange}>
            <option value="" disabled selected hidden>TOWN</option>
            {towns.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div class="searchHouse_contentwrap">
            {
              houses.map((oneHouse, index) => (
                houses.length > 0 ?
                  <div class="searchHouse_oneHouseWrap">
                    <img class="searchouse_oneHouseImg" src={oneHouse.image == null ? "https://via.placeholder.com/150" : oneHouse.image}></img>
                    <div class="searchHouse_textWrap">
                      <div class="searchHouse_oneHouseTitle">ADDRESS: {oneHouse.block + " " + oneHouse.street_name}</div>
                      <div class="searchHouse_oneHouseText">MODEL: {oneHouse.flat_model + " " + oneHouse.flat_type}</div>
                      <div class="searchHouse_oneHouseText">PRICE: {oneHouse.resale_price != null ? oneHouse.resale_price.toLocaleString() : oneHouse.resale_price}</div>
                      <div class="searchHouse_oneHouseText">STOREY: {oneHouse.storey_range}</div>
                      <div class="searchHouse_oneHouseText">SPACE: {oneHouse.floor_area_sqm}</div>
                      
                      <div class="searchHouse_oneHouseText">POSTAL CODE: {oneHouse.postal_code}</div>
                      <div class="searchHouse_oneHouseText">TOWN: {oneHouse.town}</div>


                    </div>
                  </div>
                  : null
              ))

            }
        </div>
      </div>
      <Loader
          color={"#36d7b7"}
          loading={loading}
          className="loader"
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
    </>

  )
}
