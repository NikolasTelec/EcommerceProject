import React, { useContext, useState, useRef, useEffect } from 'react'
import './Register.css'
import { Context } from '../../../../context';
import { LuUser, LuLock } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { FiPhone } from "react-icons/fi";
import axios from "axios"

const Register = () => {

  const { registerButtonClick, setRegisterButtonClick, setLoginButtonClick } = useContext(Context)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    firstName: "",
    lastName: "",
    city: "",
    street: "",
    psc: "",
  })
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  // scroll na error
  const emailRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

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

  //create
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {};

    // validace inputů
    if (!validateEmail(formData.email)) {
      newErrors.email = "Email není ve správném formátu!";
    }
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Hesla se neshodují!";
    }
    if (formData.password === "") {
      newErrors.password = "Vyplňte heslo!";
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
      const response = await axios.post("/createUser", formData)
      console.log(response);
      if (response.data.success) {
        setFormData({ name: "", email: "", password: "", mobile: "", phone: "", firstName: "", lastName: "", city: "", street: "", psc: "", })
        setConfirmPassword("")
        setLoginButtonClick(true)
        setRegisterButtonClick(false)
      }
    }
    catch (error) {
      console.error("Unexpected error:", error);
    }
  }
  const handleOnChange = (e) => {
    const { value, name } = e.target
    if (name !== "confirmPassword") {
      setFormData((prev) => {
        return {
          ...prev,
          [name]: value
        }
      })
    }
    else {
      setConfirmPassword(value);
    }
  }

  useEffect(() => {
    if (errors.email && emailRef.current) {
      emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errors.confirmPassword && confirmPasswordRef.current) {
      confirmPasswordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errors.phone && phoneRef.current) {
      phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errors.password && passwordRef.current) {
      passwordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);


  return <>
    {registerButtonClick ?
      <div className='register'>
        <div className='register-table'>

          <div className='register-table-close' onClick={() => setRegisterButtonClick(false)}><IoMdClose /></div>

          <div className='register-table-h1'>
            <h1>Registrace</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className='register-table-wrapper'>
              <div className='register-table-wrapper-container'>
                {errors.email ? <span className='register-errorSpan'>{errors.email}</span> : <span>Přihlašovací email</span>}
                <div className='register-table-input'>
                  <LuUser />
                  <input type="email" placeholder='Zadejte svůj email' value={formData.email} name='email' onChange={handleOnChange} ref={emailRef} />
                </div>
                {errors.password ? <span className='register-errorSpan'>{errors.password}</span> : <span>Heslo</span>}
                <div className='register-table-input'>
                  <LuLock />
                  <input type="password" placeholder='Zadejte své heslo' value={formData.password} name='password' onChange={handleOnChange} ref={passwordRef} />
                </div>
                {errors.confirmPassword ? <span className='register-errorSpan'>{errors.confirmPassword}</span> : <span>Potvrzení hesla</span>}
                <div className='register-table-input'>
                  <LuLock />
                  <input type="password" placeholder='Zadejte znovu své heslo' value={confirmPassword} name='confirmPassword' onChange={handleOnChange} ref={confirmPasswordRef} />
                </div>
                {errors.phone ? <span className='register-errorSpan'>{errors.phone}</span> : <span>Telefon</span>}
                <div className='register-table-input'>
                  <FiPhone />
                  <input type="text" placeholder='Zadejte své telefonní číslo' value={formData.phone} name='phone' maxLength={9} onChange={handleOnChange} ref={phoneRef} />
                </div>
              </div>

              <div className='register-table-wrapper-container'>
                {errors.firstLastName ? <span className='register-errorSpan'>{errors.firstLastName}</span> : errors.lastName ? <span className='register-errorSpan'>{errors.lastName}</span> : errors.firstName ? <span className='register-errorSpan'>{errors.firstName}</span> : <span>Jméno a příjmení</span>}
                <div className='register-table-wrapper-container-name'>
                  <div className='register-table-input-name'>
                    <input type="text" placeholder='Vaše jméno' value={formData.firstName} name='firstName' maxLength={12} onChange={handleOnChange} />
                  </div>
                  <div className='register-table-input-name'>
                    <input type="text" placeholder='Vaše příjmení' value={formData.lastName} name='lastName' maxLength={12} onChange={handleOnChange} />
                  </div>
                </div>

                {errors.city ? <span className='register-errorSpan'>{errors.city}</span> : <span>Město</span>}
                <div className='register-table-input'>
                  <input type="text" placeholder='Zadejte své město' value={formData.city} name='city' onChange={handleOnChange} />
                </div>
                {errors.street ? <span className='register-errorSpan'>{errors.street}</span> : <span>Ulice</span>}
                <div className='register-table-input'>
                  <input type="text" placeholder='Zadejte svou ulici' value={formData.street} name='street' onChange={handleOnChange} />
                </div>
                {errors.postalCode ? <span className='register-errorSpan'>{errors.postalCode}</span> : <span>PSČ</span>}
                <div className='register-table-input'>
                  <input type="text" placeholder='Zadejte své PSČ' value={formData.psc} name='psc' onChange={handleOnChange} />
                </div>
              </div>
            </div>

            <div className='register-table-register'>
              <button>Zaregistrovat se</button>
            </div>
          </form>

          <div className='register-table-login'>
            <button onClick={() => { setRegisterButtonClick(false); setLoginButtonClick(true) }}>Přihlaste se</button>
          </div>

        </div>
      </div>
      : ""}
  </>
}

export default Register