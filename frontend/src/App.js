import logo from './logo.svg';
import './App.css';
import Homepage from './homepage';
import Heatmap from './heatmap';
import Missing from './authorisation/Missing';
import Unauthorized from './authorisation/Unauthorized';
import Register from './authorisation/Register';
import Login from './authorisation/Login';
import LinkPage from './authorisation/LinkPage';
import RequireAuth from './authorisation/RequireAuth';
import PredictPrice from './predictprice';

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

const ROLES = {
    'Normal': 2001,
    'User': 5150
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
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home/>} />
          {/* public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="linkpage" element={<LinkPage />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="predictPrice" element={<PredictPrice />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.Normal]} />}>
              <Route path="index" element={<Home />} />
          </Route>

          

          {/* catch all */}
          <Route path="*" element={<Missing />} />
      </Routes>
      </BrowserRouter>



  );
}

export default App;
