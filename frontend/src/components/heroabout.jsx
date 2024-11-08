import React from 'react'
import Rabas from '@/assets/about.webp'
const heroabout = () => {
  return (
    <div className="relative flex flex-col items-center justify-center mx-auto bg-cover  bg-center h-[300px] mt-28 " style={{  
        backgroundImage: `url(${Rabas})`,  
      }}>  

      <div className="absolute inset-0 bg-color1 opacity-90"></div>  
      
      <div className="relative flex flex-col items-center justify-center">  
        <h1 className="text-light text-center text-5xl mb-1">About RabaSorsogon <br></br><span className='text-xl'>Discover the heart of Sorsogon through the eyes of passionate locals</span></h1> 
        <nav aria-label="breadcrumb">  
          <ol className="flex space-x-2 text-light mt-4">  
            <li><a href="/" className="hover:underline duration-200">Home</a></li>  
            <li>/</li>  
            <li>About</li>  
          </ol>  
        </nav> 

      </div>  

    </div>  
  )
}

export default heroabout