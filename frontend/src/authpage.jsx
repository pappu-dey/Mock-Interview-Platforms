import React, { useState } from 'react'
import './authpage.css'

export default function AuthPage() {
  const [islogin,setislogin]=useState(true);
  return (
    <div className="container">
      <div className="form-container">
        <div className="form-toggle">
          <button className={islogin ? 'active' :""} onClick={()=> setislogin(true)}>Login</button>
          <button className={!islogin ? 'active' : ""} onClick={()=> setislogin(false)}>Sign up</button>
        </div>

    {islogin ?<>
      <div className='form'>
        <h2>Login from</h2>
        <input type='email' placeholder='Enter email ...'></input>
          <input type='password' placeholder='Password...'></input>
          <a> forgot password</a>

          <button>Login</button>

          <p>Not a member ? <a href='#'onClick={()=> setislogin(false)}>Sign up </a></p>
      </div>
    </> : <>
      <h2>Sign up</h2>
       <input type='email' placeholder='Enter email ...'></input>
          <input type='password' placeholder='Password...'></input>
          <input type='password' placeholder='Reenter password...'></input>
          <button>Sign Up</button>
    </>}


      </div>
    </div>
  )
}
