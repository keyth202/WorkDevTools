import React from 'react'
import piggy from '../../assets/piggybank.png' 

const Hero = () => {
  return (
     <section className={`bg-cover py-20`}
     style={{ backgroundImage: `url(${piggy})` }}>
    <div className={`container mx-auto text-center px-4 `}>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
        Your Future. We are here to help.
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Secure, simple, and smart banking solutions designed to help you reach your financial goals.
      </p>
      <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300">
        Open an Account
      </button>
    </div>
  </section>
  )
}

export default Hero