"use client"
import React, { useEffect, useState } from 'react'
import "./Signin.css";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: '500' })

const Signin = () => {
  const [emailValue, setEmailValue] = useState('');
  const [emailHint, setEmailHint] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordHint, setPasswordHint] = useState(false);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
  useEffect(()=>{
    if(emailValue && !emailRegex.test(emailValue)) {
      setEmailHint(true)
    }
    else {
      setEmailHint(false)
    }
  },[emailValue])
  useEffect(()=>{
    if(passwordValue && !passRegex.test(passwordValue)) {
      setPasswordHint(true)
    }
    else {
      setPasswordHint(false)
    }
  },[passwordValue])
  return (
    <>
    <div className='w-full signin'>
    </div>
    <div className='absolute top-1/2 w-full -translate-y-1/2'>
      <div className='form flex flex-col mx-auto'>
        <div className='image__wrapper'>
          <Image src={require("@assets/logo.png")} className='logo_image' alt="logo"/>
        </div>
        <h3 className={poppins.className + ' text-black my-4 text-center text-3xl'}>LOG IN</h3>
        <label htmlFor='email'>E-mail</label>
        <input type='email' onChange={(e)=>setEmailValue(e.target.value)} id='email' className='rounded-md p-1'/>
        <p className={(emailHint ? 'opacity-100' : 'opacity-0') + ' hint'}>E-mail должен быть в формате example@example.com</p>
        <label className='mt-1' htmlFor='password'>Password</label>
        <input type='password' onChange={(e)=>setPasswordValue(e.target.value)} id='password' className='rounded-md p-1'/>
        <div className="password">
          <p className={(passwordHint ? 'opacity-100' : 'opacity-0') + ' hint hint_password'}>Пароль не соответсвует минимальным требованиям</p>
          <button className='rounded-xl ml-auto btn'>Forgot password?</button>
        </div>
        <button className='rounded-xl mx-auto mt-5 bg-orange-300 w-fit px-5 py-1'>Login</button>
        <button className='rounded-xl mx-auto text-xs btn'>{"Don't"} have account yet?</button>
      </div>
    </div>
    </>
  )
}

export default Signin