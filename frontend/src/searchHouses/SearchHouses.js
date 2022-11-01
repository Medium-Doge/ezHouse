import React, { useEffect, useState } from 'react'
import { redirect, useLocation } from "react-router-dom";
import css from './search.css'
import axios from 'axios';
import Loader from "react-spinners/ClipLoader";
import InfiniteScroll from 'react-infinite-scroll-component';

export const SearchHouses = () => {
  let [loading, setLoading] = useState(false);
  const [towns, setTowns] = useState([])
  const [townToSearch, setSearchTown] = useState("ANG MO KIO")
  const [currentPage, setCurrentPage] = useState(1)
  const [houses, setHouses] = useState({ results: [] })

  const getInitialHouses = (searchValue) => {
    setLoading(true)
    axios({
      method: 'post',
      url: (process.env.REACT_APP_ENDPOINT) + '/api/soldintown',
      data: { "town": searchValue, "page": 1 },
      timeout: 10000
    })
      .then(res => {
        console.log(res.data);
        setHouses({
          results: res.data.results
        })
        setCurrentPage(currentPage+1)
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  useEffect(() => {

    axios({
      method: 'get',
      //url:'http://13.228.217.57:5000/api/categories'})
      url: (process.env.REACT_APP_ENDPOINT) + '/api/categories'
    })
      .then(res => {
        setTowns(res.data.towns);
      })
      getInitialHouses(townToSearch)

  }, []);

  const handleTownChange = (event) => {
    event.persist();
    console.log(event.target.value)
    setSearchTown(event.target.value)
    setCurrentPage(1)
    getInitialHouses(event.target.value)

  };

  const getHouses = () => {
    setLoading(true)
    axios({
      method: 'post',
      url: (process.env.REACT_APP_ENDPOINT) + '/api/soldintown',
      data: { "town": townToSearch, "page": currentPage },
      timeout: 10000
    })
      .then(res => {
        console.log(res.data);
        setHouses({
           results: [...houses.results, ...res.data.results]
        })
        console.log(houses)
        setCurrentPage(currentPage+1)
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  return (
    <>
      {
        loading &&
        <div id="loadingOverlay" class="loadingOverlay pageOverlay"></div>

      }
      <div>

        <div class="searchHouse_selectWrapper">
          <select id="flattype" class="form_element select searchHouse_select" onChange={handleTownChange}>
            {towns.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div class="searchHouse_contentwrap">
          <InfiniteScroll
            dataLength={houses.results.length} //This is important field to render the next data
            next={getHouses}
            hasMore={true}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
            // below props only if you need pull down functionality
          >
            {
            houses.results.map((oneHouse, index) => (
              houses.results.length > 0 ?
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
          </InfiniteScroll>
          
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
