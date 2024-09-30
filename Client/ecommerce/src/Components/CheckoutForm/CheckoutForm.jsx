import React, { useContext, useEffect, useState, useRef } from 'react'
import './CheckoutForm.css'

import { FaCaretLeft } from "react-icons/fa6";
import { PiMoneyWavy } from "react-icons/pi";
import { IoMdCard } from "react-icons/io";

import { Context } from '../../context';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import emailjs from 'emailjs-com';

const CheckoutForm = () => {

    const { user, cart, setCart, inventoryUpdate, setInventoryUpdate } = useContext(Context)
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState(1)
    const [orderingStatus, setOrderingStatus] = useState(false)
    const [formData, setFormData] = useState({
        userId: user ? user._id : "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        city: "",
        street: "",
        psc: "",
        items: []
    })
    const [errors, setErrors] = useState({});

    // scroll na error
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const nameRef = useRef(null);
    useEffect(() => {
        if (errors.email && emailRef.current) {
            emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.phone && phoneRef.current) {
            phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.firstName || errors.lastName || errors.firstLastName && nameRef.current) {
            nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errors]);

    // aktualizace Items košíkem
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            items: cart.map(({ unitPrice, inventory, ...rest }) => rest) 
        }));
    }, [cart]);

    // aktualizace formData pokud je uživatel přihlášený
    useEffect(() => {
        if (user) {
            setFormData((prevData) => ({
                ...prevData,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                city: user.city,
                street: user.street,
                psc: user.psc,
            }));
        }
    }, [user])

    // validace inputů
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{9}$/; // Příklad jednoduchého formátu pro česká čísla
        return phoneRegex.test(phone);
    };
    const validatePostalCode = (postalCode) => {
        const postalCodeRegex = /^\d{5}$/; // Příklad pro PSČ (5 číslic)
        return postalCodeRegex.test(postalCode);
    };

    //create order
    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = {};

        // validace inputů
        if (!validateEmail(formData.email)) {
            newErrors.email = "Email není ve správném formátu!";
        }
        if (formData.firstName === "") {
            newErrors.firstName = "Vyplňte jméno!";
        }
        if (formData.lastName === "") {
            newErrors.lastName = "Vyplňte příjmení!";
        }
        if (formData.firstName === "" && formData.lastName === "") {
            newErrors.firstLastName = "Vyplňte jméno a příjmení!";
        }
        if (formData.city === "") {
            newErrors.city = "Vyplňte vaše město!";
        }
        if (formData.street === "") {
            newErrors.street = "Vyplňte vaší ulici!";
        }
        if (!validatePhone(formData.phone)) {
            newErrors.phone = "Číslo není ve správném formátu!";
        }
        if (!validatePostalCode(formData.psc)) {
            newErrors.postalCode = "PSČ musí obsahovat 5 číslic!";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post("/createOrder", formData)
            if (response.data.success) {           
                emailjs.send('service_cnxm3wo', 'template_jq29tn2', {
                    email: response.data.data.email,
                    orderId: response.data.data._id,
                }, 'sh-A-xFthr21CYEge')
                .then((result) => {
                    console.log("Email sent successfully:", result.text);
                }, (error) => {
                    console.log("Error sending email:", error.text);
                });

                setFormData({ email: "", phone: "", firstName: "", lastName: "", city: "", street: "", psc: "", items: [] })
                setCart([])
                setOrderingStatus(true)
                localStorage.setItem('cart', JSON.stringify([]));
            }
        }
        catch (error) {
            console.error("Unexpected error:", error);
            alert('Není dostatek zásob pro některé položky!') 
            setInventoryUpdate(!inventoryUpdate)
            navigate('/kosik')
        }
    }
    const handleOnChange = (e) => {
        const { value, name } = e.target
        setFormData((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }


    // formátování ceny
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };



    return (
        <div className='checkoutForm'>
            {!orderingStatus ? <div className='checkoutForm-wrapper'>
                <h1>Dodací údaje</h1>
                <form noValidate>
                    <div className='checkoutForm-wrapper-wrapper'>
                        <div className='checkoutForm-wrapper-wrapper-container'>
                            {errors.email ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.email}</span> : <span>Email</span>}
                            <div className='checkoutForm-wrapper-input'>

                                <input type="email" placeholder='Zadejte svůj email' value={formData.email} name='email' onChange={handleOnChange} ref={emailRef} />
                            </div>
                            {errors.phone ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.phone}</span> : <span>Telefon</span>}
                            <div className='checkoutForm-wrapper-input'>

                                <input type="text" placeholder='Zadejte své telefonní číslo' value={formData.phone} name='phone' onChange={handleOnChange} ref={phoneRef} maxLength={9} />
                            </div>
                            {errors.firstLastName ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.firstLastName}</span> : errors.lastName ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.lastName}</span> : errors.firstName ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.firstName}</span> : <span>Jméno a příjmení</span>}
                            <div className='checkoutForm-wrapper-wrapper-container-name'>
                                <div className='checkoutForm-wrapper-input-name'>
                                    <input type="text" placeholder='Vaše jméno' value={formData.firstName} name='firstName' maxLength={12} onChange={handleOnChange} ref={nameRef} />
                                </div>
                                <div className='checkoutForm-wrapper-input-name'>
                                    <input type="text" placeholder='Vaše příjmení' value={formData.lastName} name='lastName' maxLength={12} onChange={handleOnChange} />
                                </div>
                            </div>
                        </div>

                        <div className='checkoutForm-wrapper-wrapper-container'>
                            {errors.city ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.city}</span> : <span>Město</span>}
                            <div className='checkoutForm-wrapper-input'>
                                <input type="text" placeholder='Zadejte své město' value={formData.city} name='city' onChange={handleOnChange} />
                            </div>
                            {errors.street ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.street}</span> : <span>Ulice</span>}
                            <div className='checkoutForm-wrapper-input'>
                                <input type="text" placeholder='Zadejte svou ulici' value={formData.street} name='street' onChange={handleOnChange} />
                            </div>
                            {errors.postalCode ? <span className='checkoutForm-wrapper-wrapper-container-errorSpan'>{errors.postalCode}</span> : <span>PSČ</span>}
                            <div className='checkoutForm-wrapper-input'>
                                <input type="text" placeholder='Zadejte své PSČ' value={formData.psc} name='psc' onChange={handleOnChange} />
                            </div>
                        </div>
                    </div>
                </form>

                <h1>Platba</h1>
                <div className='checkoutForm-wrapper-payments'>
                    <button className={paymentMethod === 1 ? 'checkoutForm-wrapper-payments-button-selected' : 'checkoutForm-wrapper-payments-button'} onClick={() => setPaymentMethod(1)}><IoMdCard />Kartou</button>
                    <button className={paymentMethod === 2 ? 'checkoutForm-wrapper-payments-button-selected' : 'checkoutForm-wrapper-payments-button'} onClick={() => setPaymentMethod(2)}><IoMdCard />Kartou2</button>
                </div>

                <div className='checkoutForm-wrapper-info'>
                    <div className='checkoutForm-wrapper-info-back'>
                        <button onClick={() => navigate('/kosik')}><FaCaretLeft /><span>Zpět do košíku</span></button>
                    </div>
                    <div className='checkoutForm-wrapper-info-content'>
                        <div className='checkoutForm-wrapper-info-content-price'>
                            <p>Cena k úhradě s DPH</p>
                            <span>{formatPrice(getTotalPrice())} Kč</span>
                        </div>
                        <div className='checkoutForm-wrapper-info-content-continue'>
                            {cart.length > 0 ?
                                <button className='checkoutForm-wrapper-info-content-continue-button' onClick={handleSubmit}><span>Objednat</span><PiMoneyWavy /></button>
                                : <button className='checkoutForm-wrapper-info-content-continue-button-disabled'><span>Objednat</span><PiMoneyWavy /></button>
                            }
                        </div> 
                    </div>
                </div>

            </div> :
                <div className='checkoutForm-content'>
                    <h1>Děkujeme za objednávku!</h1>
                    <span>Objednávka byla úspěšně dokončena.</span>
                    <span>Potvrzení o objednávce naleznete ve Vašem emailu!</span>
                    <button onClick={() => window.location.href = '/'}>Zpět do obchodu</button>
                </div>}
        </div>
    )
}

export default CheckoutForm