import React from 'react'
import Sorsogon from '../assets/sorsogon city.jpg'


const herodiscover = () => {  
  return (  
    <div className="relative flex flex-col items-center justify-center mx-auto bg-cover bg-center h-[400px] mt-24" style={{  
        backgroundImage: `url(${Sorsogon})`,  
      }}>  

      <div className="absolute inset-0 bg-dark opacity-60"></div>  
      
      <div className="relative flex flex-col items-center justify-center">  
        <h1 className="text-light text-center text-5xl mb-4">Explore the Enchanting Wonders of Sorsogon</h1>  
        <nav aria-label="breadcrumb">  
          <ol className="flex space-x-2 text-light">  
            <li><a href="/" className="hover:underline duration-200">Home</a></li>  
            <li>/</li>  
            <li>Discover</li>  
          </ol>  
        </nav> 

      </div>  

    </div>  
  )  
}  

export default herodiscover