import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import AdminMenu from "./components/AdminMenu";
import Cart from "./components/Cart";
import { CartProvider } from "./context/CartContext";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import UserDetails from "./components/UserDetails";
import Invoice from './components/Invoice';
import Landing from "./components/Landing";
import "./App.css";
import About from "./components/About";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isAdminPath = location.pathname.includes("/admin");
    setIsAdmin(isAdminPath);
  }, [location]);

  // Check if current path is the landing page, sign in, or sign up page
  const isLandingPage = location.pathname === "/";
  const isAuthPage = ["/signin", "/signup","/userdetails"].includes(location.pathname);

  return (
    <CartProvider>
      <div className="App">
        {/* Only render Navbar when NOT on landing or auth pages */}
        {!isLandingPage && !isAuthPage && <Navbar isAdmin={isAdmin} />}
        <Routes>
          {/* Landing route */}
          <Route path="/" element={<Landing />} />
          {/* After login, redirect to Hero */}
          <Route path="/home" element={<Hero />} />
          {/* Other routes */}
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/userdetails" element={<UserDetails />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback route */}
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App;
