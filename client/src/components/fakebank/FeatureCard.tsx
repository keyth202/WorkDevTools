import React from 'react'

const FeatureCard = ({ icon, title, description }) => {
  return (
      <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300 cursor-pointer">
    <i className={`${icon} text-5xl text-indigo-500 mb-4`}></i>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
  )
}

export default FeatureCard