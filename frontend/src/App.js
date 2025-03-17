import { Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import Footer from "./components/_utils/Footer";
import NotFound from "./components/_utils/NotFound";
import Header from "./components/_utils/Header";
import { useEffect, useState } from "react";
import Auth from "./components/Auth";

function App() {
  const [isAuth, setIsAuth] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('token')
    async function checkAuth() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/auth/check`, {
          method: 'POST',
          headers: {
            'Authorization': token
          }
        });
        if (response.ok) {
          setIsAuth(true)
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    }
    checkAuth();
  }, [])
  
  return (
    <div>
      <a href="/auth">aaa</a>
      <Header isAuth={isAuth} setIsAuth={setIsAuth} />
      <Routes>
        <Route path="/" element={<Home isAuth={isAuth} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;