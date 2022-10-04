import logo from './logo.svg';
import './App.css';
import Homepage from './homepage';
import Heatmap from './heatmap';
import Missing from './homepage/Missing';
import Unauthorized from './homepage/Unauthorized';
import Register from './homepage/Register';
import Login from './homepage/Login';
import LinkPage from './homepage/LinkPage';
import RequireAuth from './homepage/RequireAuth';


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

          <Route element={<RequireAuth allowedRoles={[ROLES.Normal]} />}>
              <Route path="index" element={<Home />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route path="predictPrice" element={<Home />} />
          </Route>

          {/* catch all */}
          <Route path="*" element={<Missing />} />
      </Routes>
      </BrowserRouter>



  );
}

export default App;
