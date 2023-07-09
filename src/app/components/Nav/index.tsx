import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Nav = () => {
  return (
    <div className='w-full flex px-20 justify-between items-center pb-1 pt-1 bg-white'>
        <Link href='/' className='text-xl'>
            <Image src={require('@assets/logo.png')} alt='logo' height={48}/>
        </Link>
        <Link href='/' className='text-xl'>Map</Link>
        <Link href='/list' className='text-xl'>List</Link>
        <button className="text-xl">Sign In</button>
    </div>
  )
}

export default Nav