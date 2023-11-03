"use client"
import React, { useEffect, useState } from 'react'
import "./Signin.css";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: '500' })

const Signin = () => {
  const [emailValue, setEmailValue] = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
  useEffect(()=>{
    if(emailValue && !emailRegex.test(emailValue)) {
      setEmailHint('E-mail должен быть в формате example@example.com')
    }
    else {
      setEmailHint('')
    }
  },[emailValue])
  useEffect(()=>{
    if(passwordValue && !passRegex.test(passwordValue)) {
      setPasswordHint('Пароль не соответсвует минимальным требованиям')
    }
    else {
      setPasswordHint('')
    }
  },[passwordValue])
  
  const validateData = () => {
    const condition = !passwordHint && !emailHint && emailValue && passwordValue
    if(condition) {
      // fetch data
    }
    else {
      if(!emailValue) {
        setEmailHint('Заполните данное поле')
      }
      if(!passwordValue) {
        setPasswordHint('Заполните данное поле')
      }
    }
  }

  const handleFocus = (item: string, bool: boolean) => {
    if(item == 'email') {
      setEmailFocused(bool)
    }
    else if (item == 'password') {
      setPasswordFocused(bool)
    }
  }

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
        <input type='email' onFocus={()=>handleFocus('email', true)} onBlur={()=>handleFocus('email', false)} onChange={(e)=>setEmailValue(e.target.value)} id='email' placeholder='Username' className={'p-1 ' + (emailFocused ? 'pl-1' : 'pl-7')}/>
        <p className='hint mb-7'>
          <Image src={require("@assets/user_email.png")} className={(emailFocused ? 'focused' : 'unfocused') + ' login_image'} alt="login_email"/>
          <span className={'transition-all duration-700 ' + (emailHint ? 'opacity-100' : 'opacity-0')}>{emailHint}</span>
        </p>
        <input type='password' onFocus={()=>handleFocus('password', true)} onBlur={()=>handleFocus('password', false)} onChange={(e)=>setPasswordValue(e.target.value)} id='password' placeholder='Password' className={'p-1 ' + (passwordFocused ? 'pl-1' : 'pl-7')}/>
        <div className="password">
          <Image src={require("@assets/user_password.png")} className={(passwordFocused ? 'focused focused_password' : 'unfocused unfocused_password') + ' login_image'} alt="login_password"/>
          <p className='hint'>
            <span className={'duration-700 ' + (passwordHint ? 'opacity-100' : 'opacity-0')}>{passwordHint}</span>
          </p>
          <button className='rounded-xl ml-auto btn'>Forgot password?</button>
        </div>
        <button className='rounded-xl mx-auto mt-5 bg-orange-300 w-fit px-5 py-1' onClick={validateData}>Login</button>
        <button className='rounded-xl mx-auto text-xs btn'>{"Don't"} have account yet?</button>
      </div>
    </div>
    </>
  )
}

export default Signin