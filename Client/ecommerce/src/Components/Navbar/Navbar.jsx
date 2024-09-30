import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import Login from './Login/Login';
import Logo from '../../Images/logo.png'
import { CiSearch } from "react-icons/ci";
import { FiClipboard, FiShoppingCart } from "react-icons/fi";
import LoginRegister from './LoginRegister/LoginRegister';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context';


const Navbar = () => {

  const { cart } = useContext(Context)

  const [navbarFocus, setNavbarFocus] = useState(false)
  const [storage, setStorage] = useState([]);
  const [input, setInput] = useState("");
  const [filteredStorage, setFilteredStorage] = useState([]);

  const navigate = useNavigate();

  // read z databáze storage
  const getFetchStorage = async () => {
    const response = await axios.get("/storage")
    if (response.data.success) {
      setStorage(response.data.data[0].storage)
    }
  }
  useEffect(() => {
    getFetchStorage()
  }, [])


  // filtrování inputu
  useEffect(() => {
    const filtered = storage.filter(item =>
      item.title.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredStorage(filtered);
  }, [input]); // Runs every time inputValue or storage changes

  // Handle input change and update inputValue
  const handleInputChange = (e) => {
    setInput(e.target.value); // Update the input value state
  };

  const handleRedirect = (id) => {
    setNavbarFocus(false)
    navigate(`/produkt/${id}`)
  }

  return <>
    <div className='navbar'>
      <LoginRegister />

      {navbarFocus ? <div className='navbar-focus' onClick={() => setNavbarFocus(!navbarFocus)}></div> : ""}

      <div className='navbar-logo' onClick={() => window.location.href = '/'}>
        <img src={Logo} alt="" />
      </div>

      <div className='navbar-main'>
        <div className='navbar-main-search'>
          <div className='navbar-main-search-button'><CiSearch /></div>
          <input onClick={() => setNavbarFocus(true)} onChange={handleInputChange} type="text" placeholder='Zadejte co hledáte...' />
        </div>

        <div className='navbar-main-icons'>
          <div className='navbar-main-icons-orders' onClick={() => navigate('/objednavky')}>
            <FiClipboard />
          </div>
          <div className='navbar-main-icons-cart' onClick={() => navigate('/kosik')}>
            {cart && cart.length > 0 ? (
              <div className='navbar-main-icons-cart-alert'>
                <span>{cart.length}</span>
              </div>
            ) : ""}
            <FiShoppingCart />
          </div>
        </div>

        {navbarFocus ?

          <div className='navbar-main-results'>
            {filteredStorage.length > 0 ? filteredStorage.map(({ id, image, title }) => {
              return (
                <div key={id} className='navbar-main-results-item' onClick={() => handleRedirect(id)}>
                  <div className='navbar-main-results-item-img'>
                    <img src={image} alt="" />
                  </div>
                  <span>{title}</span>
                </div>
              )
            }) : input === "" ? storage.map(({ id, image, title }) => {
              return (
                <div key={id} className='navbar-main-results-item' onClick={() => handleRedirect(id)}>
                  <div className='navbar-main-results-item-img'>
                    <img src={image} alt="" />
                  </div>
                  <span>{title}</span>
                </div>
              )
            }) : filteredStorage.length === 0 ?
              <div className='navbar-main-results-noItem'>
                <span>Hledaný produkt nenalezen</span>
              </div> : ""}
          </div>

          : ""}

      </div>

      <Login />

    </div>

    {/* MOBILE VIEW */}
    <div className='m-navbar'>

      <LoginRegister />

      {navbarFocus ? <div className='m-navbar-focus' onClick={() => setNavbarFocus(!navbarFocus)}></div> : ""}

      <div className='m-navbar-main'>

        <Login />

        <div className='m-navbar-main-logo' onClick={() => window.location.href = '/'}>
          <img src={Logo} alt="" />
        </div>
        <div className='m-navbar-main-icons'>
          <div className='m-navbar-main-icons-orders' onClick={() => navigate('/objednavky')}>
            <FiClipboard />
          </div>
          <div className='m-navbar-main-icons-cart' onClick={() => navigate('/kosik')}>
            {cart.length > 0 ? <div className='m-navbar-main-icons-cart-alert'>
              <span>{cart.length}</span>
            </div> : ""}
            <FiShoppingCart />
          </div>
        </div>
      </div>

      <div className='m-navbar-second'>
        <CiSearch />
        <input onClick={() => setNavbarFocus(true)} type="text" onChange={handleInputChange} placeholder='Zadejte co hledáte...' />

        {navbarFocus ?

          <div className='m-navbar-main-results'>
            {filteredStorage.length > 0 ? filteredStorage.map(({ id, image, title }) => {
              return (
                <div key={id} className='m-navbar-main-results-item' onClick={() => handleRedirect(id)}>
                  <div className='m-navbar-main-results-item-img'>
                    <img src={image} alt="" />
                  </div>
                  <span>{title}</span>
                </div>
              )
            }) : input === "" ? storage.map(({ id, image, title }) => {
              return (
                <div key={id} className='m-navbar-main-results-item' onClick={() => handleRedirect(id)}>
                  <div className='m-navbar-main-results-item-img'>
                    <img src={image} alt="" />
                  </div>
                  <span>{title}</span>
                </div>
              )
            }) : filteredStorage.length === 0 ?
              <div className='m-navbar-main-results-noItem'>
                <span>Hledaný produkt nenalezen</span>
              </div> : ""}
          </div>

          : ""}

      </div>

    </div>
  </>
}

export default Navbar