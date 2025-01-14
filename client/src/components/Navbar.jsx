// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className='bg-slate-200 shadow-md'>
    <div className='flex justify-between items-center max-w-6xl mx-auto p-1 h-[100px]'>
    <ul className='flex gap-4 items-center'>
    </ul>
    <img src="" alt="logo" className='flex flex-wrap h-[190px] w-[190px]' />
    <ul className='flex gap-4 items-center'>
      <Link to='/home'>
      <li className='text-slate-700 rounded-md px-2 py-1 transition-hover duration-300 hover:bg-white hover:text-blue-800 font-semibold'>Home</li>
      </Link>
      
      <Link to='/graph'>
          <li className='text-slate-700 rounded-md px-2 py-1 transition-hover duration-300 hover:bg-white hover:text-blue-800 font-semibold'>Statistics</li>
        </Link>
      <Link to='/'>
      <li className='text-slate-700 rounded-md px-2 py-1 transition-hover duration-300 hover:bg-white hover:text-blue-800 font-semibold'>About</li>
      </Link>
      <Link to='/'>
      <li className='text-slate-700 rounded-md px-2 py-1 transition-hover duration-300 hover:bg-white hover:text-blue-800 font-semibold'>Sign in</li>
      </Link>
    </ul>
    </div>
  </header>
  );
};

export default Navbar;
