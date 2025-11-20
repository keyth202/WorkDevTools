import React from 'react';
import {useNavigate} from 'react-router-dom';

const Errorpage = () => {
  const navigate = useNavigate();


  const handleClick = () => {
    navigate('/');
  }

  return (
    <div>
      
      <h2>An error has Occurred </h2>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={handleClick}>
          Click here to navigate back to the Home Page
        </button>
    </div>
  )
}

export default Errorpage