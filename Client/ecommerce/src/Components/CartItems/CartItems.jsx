import React, { useContext, useEffect } from 'react'
import './CartItems.css'

import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { FiMinus, FiPlus } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";

import { Context } from '../../context';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {

    const { user, cart, setCart } = useContext(Context)
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

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };
    

    const handleAddToCart = async (id, inventory, unitPrice) => {
        if (user) {
            setCart(prevCart => {
                const existingCartItem = prevCart.find(item => item.id === id);
                if (existingCartItem.quantity >= inventory) {
                    return prevCart;
                } else {
                    return prevCart.map(item =>
                        item.id === id
                            ? { ...item, quantity: item.quantity + 1, price: item.price + unitPrice }
                            : item
                    );
                }
            });

        } else {
            const localCart = JSON.parse(localStorage.getItem('cart'))
            const existingCartItem = localCart.find(item => item.id === id);
            if (existingCartItem.quantity >= inventory) {
                return
            } else {
                existingCartItem.quantity += 1;
                existingCartItem.price += unitPrice;
            }
            localStorage.setItem('cart', JSON.stringify(localCart));
            setCart(localCart)
        }
    }

    // odstraňování položky z košíku
    const handleRemoveFromCart = (id, unitPrice) => {
        if (user) {
            setCart(prevCart => {
                const existingCartItem = prevCart.find(item => item.id === id);
                if (existingCartItem.quantity > 1) {
                    return prevCart.map(item =>
                        item.id === id
                            ? { ...item, quantity: item.quantity - 1, price: item.price - unitPrice }
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
                existingCartItem.price -= unitPrice;
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

    const handleDeleteFromCart = (id) => {
        if (user) {
            setCart(prevCart => {
                return prevCart.filter(item => item.id !== id);
            });

        } else {
            const localCart = JSON.parse(localStorage.getItem('cart'))
            const updatedCart = localCart.filter(item => item.id !== id);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            setCart(updatedCart);
        }
    }

    const handleTitleClick = (id) => {
        navigate(`/produkt/${id}`);
      };

    return (
        <div className='cartItems'>
            <div className='cartItems-wrapper'>

                <div className='cartItems-wrapper-cart'>
                    <h1>Košík</h1>
                    {cart.map(({ id, price, quantity, inventory, image, title, unitPrice }) => {
                        return (
                            <div key={id} className='cartItems-wrapper-cart-item'>
                                <div className='cartItems-wrapper-cart-item-container1'>
                                    <div className='cartItems-wrapper-cart-item-container1-img' onClick={() => handleTitleClick(id)}>
                                        <img src={image} alt="" />
                                    </div>
                                    <div className='cartItems-wrapper-cart-item-container1-wrapper'>
                                    <span onClick={() => handleTitleClick(id)}>{title}</span>
                                    {quantity > inventory && <p>Počet kusů na skladě: {inventory} </p>}
                                    </div>
                                    
                                </div>
                                <div className='cartItems-wrapper-cart-item-container2'>
                                    <div className='cartItems-wrapper-cart-item-container2-buttons'>
                                        <button onClick={() => handleRemoveFromCart(id, unitPrice)}><FiMinus /></button>
                                        <span>{quantity}</span>
                                        <button onClick={() => handleAddToCart(id, inventory, unitPrice)}><FiPlus /></button>
                                    </div>
                                    <p>{formatPrice(price)} Kč</p>
                                    <button className='cartItems-wrapper-cart-item-container2-button' onClick={() => handleDeleteFromCart(id)}><FaRegTrashAlt /></button>
                                </div>
                            </div>
                        )
                    })}

                    {cart.length < 1 ? <span>Košík je prázdný</span> : ""}
                </div>

                <div className='cartItems-wrapper-info'>
                    <div className='cartItems-wrapper-info-back'>
                        <button onClick={() => navigate('/')}><FaCaretLeft /><span>Zpět k nákupu</span></button>
                    </div>
                    <div className='cartItems-wrapper-info-content'>
                        <div className='cartItems-wrapper-info-content-price'>
                            <p>Cena k úhradě s DPH</p>
                            <span>{formatPrice(getTotalPrice())} Kč</span>
                        </div>
                        <div className='cartItems-wrapper-info-content-continue'>
                            {cart.length > 0 ?
                                <button className='cartItems-wrapper-info-content-continue-button' onClick={() => navigate('/kosik/pokladna')}><span>Pokračovat</span><FaCaretRight /></button>
                                : <button className='cartItems-wrapper-info-content-continue-button-disabled'><span>Pokračovat</span><FaCaretRight /></button>
                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CartItems