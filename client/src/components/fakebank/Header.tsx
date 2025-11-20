import React from 'react'


const Header = () => {
  const onClick = () => {
    window.location.reload(true);
  }
  return (
     <header className={`bg-white shadow-md`}>
    <nav className="container mx-auto p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-teal-600">
        Demo
      </div>
      <div className="space-x-4 hidden md:block">
        <a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition duration-300">
          Personal
        </a>
        <a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition duration-300">
          Business
        </a>
        <a href="#" className="text-gray-600 hover:text-teal-600 font-medium transition duration-300">
          About Us
        </a>
      </div>
      <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg shadow-lg transition duration-300" onClick={onClick}>
        Refresh
      </button>
    </nav>
  </header>
  )
}

export default Header