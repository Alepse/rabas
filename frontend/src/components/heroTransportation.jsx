import React from 'react'
import Sorsogon from '../assets/terminal.webp'

const heroTransportation = () => {
  return (
    <div className="relative flex flex-col items-center justify-center mx-auto bg-cover  bg-center h-[300px] mt-24 " style={{  
        backgroundImage: `url(${Sorsogon})`,  
      }}>  

      <div className="absolute inset-0 bg-color1 opacity-60"></div>  
      
      <div className="relative flex flex-col items-center justify-center">  
        <h1 className="text-light text-center text-5xl mb-4">Always Know Where To Go</h1>  
        <nav aria-label="breadcrumb">  
          <ol className="flex space-x-2 text-light">  
            <li><a href="/" className="hover:underline duration-200">Home</a></li>  
            <li>/</li>  
            <li>Transportation</li>  
          </ol>  
        </nav> 

      </div>  

    </div>  
  )
}

export default heroTransportation