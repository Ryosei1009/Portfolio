import { Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import Footer from "./components/_utils/Footer";
import NotFound from "./components/_utils/NotFound";
import Header from "./components/_utils/Header";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;