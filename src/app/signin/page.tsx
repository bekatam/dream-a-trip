import React from 'react'
import "./Signin.css";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: '500' })

const Signin = () => {
  return (
    <>
    <div className='w-full signin'>
    </div>
    <div className='absolute top-1/2 w-full -translate-y-1/2'>
      <form className='flex flex-col mx-auto gap-1'>
        <div className='image__wrapper'>
          <Image src={require("@assets/logo.png")} className='logo_image' alt="logo"/>
        </div>
        <h3 className={poppins.className + ' text-black my-5 text-center text-3xl'}>LOG IN</h3>
        <label htmlFor='email'>E-mail</label>
        <input type='email' id='email' className='rounded-md p-1'/>
        <label className='mt-3' htmlFor='password'>Password</label>
        <input type='password' id='password' className='rounded-md p-1'/>
        <button className='rounded-xl ml-auto text-sm'>Forgot password?</button>
        <button className='rounded-xl mx-auto mt-5 bg-orange-300 w-fit px-5 py-1'>Login</button>
        <button className='rounded-xl mx-auto text-xs'>{"Don't"} have account yet?</button>
      </form>
    </div>
    </>
  )
}

export default Signin