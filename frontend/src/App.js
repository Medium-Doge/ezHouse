import logo from './logo.svg';
import './App.css';
import Homepage from './homepage';
import Heatmap from './heatmap';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

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
      <Route path="*" element={<Home/>} />
      </Routes>
      </BrowserRouter>


   
  );
}

export default App;
