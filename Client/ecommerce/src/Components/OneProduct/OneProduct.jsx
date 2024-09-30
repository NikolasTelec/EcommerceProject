import React, { useContext, useEffect, useState } from 'react'
import './OneProduct.css'
import { IoIosStar, IoIosStarHalf, IoIosStarOutline } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useParams } from 'react-router-dom';
import { Context } from '../../context';

import axios from "axios"

const OneProduct = () => {

    const { id } = useParams();
    const { user, cart, setCart } = useContext(Context)

    const [product, setProduct] = useState(null);
    const [productQuantity, setProductQuantity] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/storage/${id}`);
                setProduct(response.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };
        fetchProduct();
    }, [id]);

    // formátování ceny
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // počet kusů produktu v košíku
    useEffect(() => {
        if (cart) {
            const cartItem = cart.find(item => item.id === id);
            if (cartItem) {
                setProductQuantity(cartItem.quantity);
            } else {
                setProductQuantity(0);
            }
        }
    }, [cart, id]);

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
                    const newCartItem = {id, price, quantity: 1, inventory, image, title, unitPrice: price};
                    return [...prevCart, newCartItem];
                }
            });

        } else {
            const localCart = JSON.parse(localStorage.getItem('cart'))
            const existingCartItem = localCart.find(item => item.id === id);
            if (existingCartItem) {
                if (existingCartItem.quantity === inventory) {
                    return
                } else {
                    existingCartItem.quantity += 1;
                    existingCartItem.price += price;
                }
            } else {
                const cartItem = {id, price, quantity: 1, inventory, image, title, unitPrice: price};
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
                console.log(existingCartItem);

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


    if (loading) {
        return <div className='oneProduct'></div>;
    }

    return (
        <div className='oneProduct'>
            <div className='oneProduct-wrapper'>
                <div className="oneProduct-wrapper-img">
                    <img src={product.image} alt="" />
                </div>
                <div className="oneProduct-wrapper-product">
                    <div className="oneProduct-wrapper-product-title">
                        <p>{product.title}</p>
                    </div>
                    <div className="oneProduct-wrapper-product-row1">
                        <div className="oneProduct-wrapper-product-row1-rating">
                            {product.rating > 0.5 ? <IoIosStar /> : product.rating > 0 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            {product.rating > 1.5 ? <IoIosStar /> : product.rating > 1 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            {product.rating > 2.5 ? <IoIosStar /> : product.rating > 2 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            {product.rating > 3.5 ? <IoIosStar /> : product.rating > 3 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            {product.rating > 4.5 ? <IoIosStar /> : product.rating > 4 ? <IoIosStarHalf /> : <IoIosStarOutline />}
                            <p>{product.rating}</p>
                        </div>
                        <div className="oneProduct-wrapper-product-row1-storage">
                            {product.inventory > 0 ? <span>Skladem {product.inventory >= 10 ? "10+" : product.inventory} ks</span> : <span style={{ color: 'red' }}>Není skladem</span>}
                        </div>
                    </div>
                    <div className="oneProduct-wrapper-product-description">
                        <span>{product.description}</span>
                    </div>
                    <div className="oneProduct-wrapper-product-row2">
                        <div className="oneProduct-wrapper-product-row2-price">
                            <p>{formatPrice(product.price)},-</p>
                        </div>

                        <div className="oneProduct-wrapper-product-row2-buttons">
                            {productQuantity > 0 ? <button className='oneProduct-wrapper-product-row2-buttons-button' onClick={() => handleRemoveFromCart(product.id, product.price)}><FiMinus /></button> : <button className='oneProduct-wrapper-product-row2-buttons-button-disabled' ><FiMinus /></button>}
                            <span>{productQuantity}</span>
                            {product.inventory > 0 && productQuantity < product.inventory ? <button className='oneProduct-wrapper-product-row2-buttons-button' onClick={() => handleAddToCart(product.id, product.price, product.inventory, product.image, product.title)}><FiPlus /></button> : <button className='oneProduct-wrapper-product-row2-buttons-button-disabled' ><FiPlus /></button>}
                        </div>
                    </div>
                    <button className={product.inventory > 0 ? "oneProduct-wrapper-product-button" : "oneProduct-wrapper-product-button-disabled"} onClick={() => handleAddToCart(product.id, product.price, product.inventory, product.image, product.title)}>
                        <LuShoppingCart />
                        <span>Do košíku</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OneProduct