import React, { useContext, useEffect, useState } from 'react'
import './Items.css'
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { FiMinus, FiPlus } from "react-icons/fi";
import { LuShoppingCart } from "react-icons/lu";
import axios from "axios"
import { Context } from '../../context';
import { useNavigate } from 'react-router-dom';

const Items = () => {

  const { user, cart, setCart, storage } = useContext(Context)

  const navigate = useNavigate();

  // inicializace košíku do localStorage při první návštěvě
  useEffect(() => {
    if (!user) {
      const localCart = JSON.parse(localStorage.getItem('cart'))
      setCart(localCart)
      if (localCart === null) {
        localStorage.setItem('cart', JSON.stringify([]));
      }
    }
  }, [user])

  // formátování ceny
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }


  // přidávání položky do košíku
  const handleAddToCart = async (id, price, inventory, image, title) => {
    if (user) {
      setCart(prevCart => {
        const existingCartItem = prevCart.find(item => item.id === id);
        if (existingCartItem) {
          if (existingCartItem.quantity >= inventory) {
            return prevCart;
          } else {
            return prevCart.map(item =>
              item.id === id
                ? { ...item, quantity: item.quantity + 1, price: item.price + price }
                : item
            );
          }
        } else {
          const newCartItem = { id, price, quantity: 1, inventory, image, title, unitPrice: price };
          return [...prevCart, newCartItem];
        }
      });

    } else {
      const localCart = JSON.parse(localStorage.getItem('cart'))
      const existingCartItem = localCart.find(item => item.id === id);

      if (existingCartItem) {
        if (existingCartItem.quantity >= inventory) {
          return
        } else {
          existingCartItem.quantity += 1;
          existingCartItem.price += price;
        }
      } else {
        const cartItem = { id, price, quantity: 1, inventory, image, title, unitPrice: price };
        localCart.push(cartItem);
      }
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart)
    }
  }

  // odstraňování položky z košíku
  const handleRemoveFromCart = (id, price) => {
    if (user) {
      setCart(prevCart => {
        const existingCartItem = prevCart.find(item => item.id === id);
        if (existingCartItem.quantity > 1) {
          return prevCart.map(item =>
            item.id === id
              ? { ...item, quantity: item.quantity - 1, price: item.price - price }
              : item
          );
        } else {
          return prevCart.filter(item => item.id !== id);
        }
      });

    } else {
      const localCart = JSON.parse(localStorage.getItem('cart'))
      const existingCartItem = localCart.find(item => item.id === id);
      if (existingCartItem.quantity > 1) {
        existingCartItem.quantity -= 1;
        existingCartItem.price -= price;
      } else {
        const updatedCart = localCart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
        return;
      }
      localStorage.setItem('cart', JSON.stringify(localCart));
      setCart(localCart)
    }
  }

  // redirect na konkrétní produkt
  const handleTitleClick = (id) => {
    navigate(`/produkt/${id}`);
  };


  return (
    <div className='items'>
      {
        storage.map(({ id, image, title, description, inventory, rating, price }) => {
          const cartItem = cart.find((item) => item.id === id);
          const isInCart = !!cartItem;

          return (
            <div key={id} className='items-oneItem'>
              <div className='items-oneItem-img' onClick={() => handleTitleClick(id)}>
                <img src={image} alt="" />
              </div>

              <div className='items-oneItem-row1'>
                <div className='items-oneItem-row1-rating'>
                  {rating > 0.5 ? <IoIosStar /> : rating > 0 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                  {rating > 1.5 ? <IoIosStar /> : rating > 1 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                  {rating > 2.5 ? <IoIosStar /> : rating > 2 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                  {rating > 3.5 ? <IoIosStar /> : rating > 3 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                  {rating > 4.5 ? <IoIosStar /> : rating > 4 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                  <p>{rating}</p>
                </div>
                <div className='items-oneItem-row1-storage'>
                  {inventory > 0 ? <span>Skladem {inventory >= 10 ? "10+" : inventory} ks</span> : <span style={{ color: 'red' }}>Není skladem</span>}
                </div>
              </div>

              <div className='items-oneItem-title'>
                <p onClick={() => handleTitleClick(id)}>{title}</p>
              </div>

              <div className='items-oneItem-description'>
                <p>{description}</p>
              </div>

              <div className='items-oneItem-row2'>
                <div className='items-oneItem-row2-price'>
                  <p>{formatPrice(price)},-</p>
                </div>

                {isInCart ?
                  <div className='items-oneItem-row2-buttons'>
                    <button onClick={() => handleRemoveFromCart(id, price)}><FiMinus /></button>
                    <span>{cartItem.quantity}</span>
                    <button onClick={() => handleAddToCart(id, price, inventory)}><FiPlus /></button>
                  </div>
                  : inventory > 0 ?
                    <button className='items-oneItem-row2-button' onClick={() => handleAddToCart(id, price, inventory, image, title)}>
                      <LuShoppingCart />
                      <span>Do košíku</span>
                    </button> :
                    <button className="items-oneItem-row2-button-disabled">
                      <LuShoppingCart />
                      <span>Do košíku</span>
                    </button>}


              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default Items