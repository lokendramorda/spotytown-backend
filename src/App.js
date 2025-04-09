import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './screens/Home';
import './App.css';
import Suggestions from "./screens/Suggestions";
import Posts from "./screens/Posts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={
          <div className="bg-hero-pattern max-h-[790px] bg-cover bg-no-repeat bg-center">
            <Home />
            <Suggestions />
          </div>
        } />
       
        <Route path="/posts" element={
          <div className="bg-hero-pattern max-h-[790px] bg-cover bg-no-repeat bg-center">
            <Posts />
          </div>
          }
           />
      </Routes>
    </BrowserRouter>
  );
}

export default App;