//npm install jwt-decode

import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from "axios"

const Context = createContext();

axios.defaults.baseURL = "https://ecommerceserver-zet7.onrender.com"

const ContextProvider = ({ children }) => {
  const [loginButtonClick, setLoginButtonClick] = useState(false);
  const [registerButtonClick, setRegisterButtonClick] = useState(false);
  const [cart, setCart] = useState([]);
  const [storage, setStorage] = useState([])
  const [inventoryUpdate, setInventoryUpdate] = useState(false) // pokud není dost na skladě

  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Current time in seconds
          if (decodedToken.exp < currentTime) {
            console.log("Token has expired");
            setUser(null);  // Log out user when token expires
            localStorage.removeItem('token');  // Remove expired token
          } else {
            setUser(decodedToken);  // Token is valid
          }
        } catch (error) {
          console.error('Invalid token', error);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null); // No token
      }
    };

    // Initial check on component mount
    checkToken();

    // Listener for changes in localStorage
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        checkToken(); // Call checkToken when the token changes
      }
    };

    // Event listener for changes in localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  // fetch košíku po přihlášení
  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          if (user) {
            const response = await axios.get(`/user/${user._id}`);
            const localCart = JSON.parse(localStorage.getItem('cart'))
            if (localCart.length > 0) {
              setCart(localCart)
              localStorage.setItem('cart', JSON.stringify([]));
            } else {
              setCart(response.data);
            }
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      };

      fetchCart();
    }
  }, [user, inventoryUpdate]);

  // update košíku do db
  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('cart'))
    if (user && localCart.length === 0) {
      const updateCart = async () => {
        try {
          await axios.post('/updateCart', { userId: user._id, cart });
        } catch (error) {
          console.error('Error updating cart:', error);
        }
      };

      if (user._id && cart.length >= 0) {
        updateCart();
      }
    }
  }, [cart])

  // read z databáze storage
  const getFetchStorage = async () => {
    const response = await axios.get("/storage")
    if (response.data.success) {
      setStorage(response.data.data[0].storage)
    }
  }
  useEffect(() => {
    getFetchStorage()
  }, [inventoryUpdate])
  

  return (
    <Context.Provider value={{
      loginButtonClick, setLoginButtonClick,
      registerButtonClick, setRegisterButtonClick,
      cart, setCart,
      user, setUser,
      storage, setStorage,
      inventoryUpdate, setInventoryUpdate
    }}>
      {children}
    </Context.Provider>
  );
};

export { Context, ContextProvider };