import logo from './logo.svg';
import './App.css';
import Homepage from './homepage';
import Heatmap from './heatmap';
import Missing from './authorisation/Missing';
import Unauthorized from './authorisation/Unauthorized';
import Register from './authorisation/Register';
import Login from './authorisation/Login';
import RequireAuth from './authorisation/RequireAuth';
import PredictPrice from './predictprice/PredictPrice';
import Navbar from './navbar/Navbar';
import Footer from './footer/Footer';
import { SearchHouses } from './searchHouses/SearchHouses';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const ROLES = {
    'User': 2001
}

function Home() {
  return (
    <div className="App">
    <Homepage></Homepage>
    <Heatmap></Heatmap>
  </div>
  );
}

function App() {
  return (
    <>
      <Navbar></Navbar>
      <Routes>
      <Route path="/" element={<Home/>} />
          {/* public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="index" element={<Home />} />
          <Route path="searchHouses" element={<SearchHouses/>}/>
          {/* <Route path="predictPrice" element={<PredictPrice />} /> */}

          {/* protected routes */}
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route path="predictPrice" element={<PredictPrice />} />
          </Route>
          {/* catch all */}

          <Route path="*" element={<Missing />} />
      </Routes>
      <Footer></Footer>
      </>
  );
}

export default App;
