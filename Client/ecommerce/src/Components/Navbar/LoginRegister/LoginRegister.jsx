import React, { useState, useContext } from 'react'
import './LoginRegister.css'
import Register from './Register/Register';
import { LuUser, LuLock } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { Context } from '../../../context';
import axios from "axios"

const LoginRegister = () => {

  const { loginButtonClick, setLoginButtonClick, setRegisterButtonClick, user } = useContext(Context)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({});

  // validace emailu
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = "Email není ve správném formátu!";
    }
    if (formData.password === "") {
      newErrors.password = "Vyplňte heslo!";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const response = await axios.post('/loginUser', formData);

      if (response.data.success) {
        // Handle successful login (e.g., save token, redirect user, etc.)
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        window.location.href = '/'
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: error.response.data.message,
        }));
      } else {
        console.error("Unexpected error:", error);
      }
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


  return <>
    {loginButtonClick ?
      <div className='loginRegister'>
        <div className='loginRegister-table'>
          <div className='loginRegister-table-close' onClick={() => setLoginButtonClick(false)}><IoMdClose /></div>
          <div className='loginRegister-table-h1'>
            <h1>Přihlášení</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {errors.email ? <span className='loginRegister-errorSpan'>{errors.email}</span> : <span>E-mail</span>}
            <div className='loginRegister-table-input'>
              <LuUser />
              <input type="email" name='email' placeholder='Zadejte svůj email' onChange={handleOnChange} />
            </div>

            {errors.password ? <span className='loginRegister-errorSpan'>{errors.password}</span> : <span>Heslo</span>}
            <div className='loginRegister-table-input'>
              <LuLock />
              <input type="password" name='password' placeholder='Zadejte své heslo' onChange={handleOnChange} />
            </div>

            <div className='loginRegister-table-login'>
              <button>Přihlásit se</button>
            </div>
          </form>

          <div className='loginRegister-table-register'>
            <button onClick={() => { setRegisterButtonClick(true); setLoginButtonClick(false) }}>Zaregistrujte se</button>
          </div>

        </div>
      </div>
      : <Register />}
  </>
}

export default LoginRegister