import React, { useContext } from 'react'
import './Login.css'
import { LuUser } from "react-icons/lu";
import { Context } from '../../../context';

const Login = () => {

    const { setLoginButtonClick, user, setUser } = useContext(Context)

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null)
    }

    return (
        <div className='login'>
            <LuUser/>
            <div className='login-button'>
                {user ? <button onClick={handleLogout}>Odhlásit se</button> 
                : <button onClick={() => setLoginButtonClick(true)}>Přihlásit se</button>}
            </div>
        </div>
    )
}

export default Login