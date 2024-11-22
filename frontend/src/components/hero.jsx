import Slider from 'react-slick';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import hall from '../assets/hall.jpeg';
import bulusan from '../assets/bulusan.jpg';
import subic from '../assets/subic.webp'
import dancalan from '../assets/dancalan.png';


// Import Slick CSS files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Hero = () => {
  const images = [hall, bulusan, subic, dancalan];
  const greetings = [
    {
      title: 'Plan Your Perfect Journey',
      description: 'With RabaSorsogon, your trip to Sorsogon will be more enjoyable, memorable, and truly unforgettable.'
    },
    {
      title: 'Embrace Serenity and Adventure',
      description: 'Discover the perfect balance of relaxation and excitement in Sorsogon\'s diverse landscapes.'
    },
    {
      title: 'Unwind and Rejuvenate',
      description: 'Let the natural beauty of Sorsogon refresh your mind, body, and soul.'
    },
    {
      title: 'Discover Tranquil Escapes',
      description: 'Explore hidden gems and peaceful retreats throughout the stunning province of Sorsogon.'
    }
  ];

  const CustomPrevArrow = ({ onClick, ...rest }) => {
    const { currentSlide, slideCount, ...buttonProps } = rest;
    return (
      <button
        {...buttonProps}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 md:bg-black hover:bg-color3 hover:text-dark duration-300 md:bg-opacity-50 text-transparent md:text-white p-2 rounded-full focus:outline-none"
        onClick={onClick}
      >
        <FiChevronLeft size={24} />
      </button>
    );
  };

  const CustomNextArrow = ({ onClick, ...rest }) => {
    const { currentSlide, slideCount, ...buttonProps } = rest;
    return (
      <button
        {...buttonProps}
        className="absolute  right-4  top-1/2 transform -translate-y-1/2 z-20 md:bg-black  hover:bg-color3 hover:text-dark duration-300 md:bg-opacity-50 text-transparent md:text-white p-2 rounded-full focus:outline-none"
        onClick={onClick}
      >
        <FiChevronRight size={24} />
      </button>
    );
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    fade: false,
    cssEase: "linear",
    autoplay: true,
    autoplaySpeed: 5000,
    appendDots: (dots) => (
      <div style={{ position: 'absolute', bottom: '10px', width: '100%' }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 mx-1 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity duration-300"></div>
    ),
  };

  return (
    <div className="mx-auto mt-24 h-[500px] relative font-sans overflow-hidden">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative h-[500px]">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="absolute  inset-0 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
                {greetings[index].title}
              </h1>
              <p className="text-white text-lg md:text-xl max-w-2xl mb-8 animate-fadeIn animation-delay-300">
                {greetings[index].description}
              </p>
            </div>
          </div>
        ))}
      </Slider>
      <div className="absolute bottom-[8rem] left-0 right-0 flex justify-center">
        <a
          href='/destinations'
          className="mt-4 flex items-center bg-light text-black font-semibold py-3 px-6 rounded-full transform transition-all duration-300 hover:translate-x-2 animate-slideUp animation-delay-600"
        >
          Explore <FiChevronRight className="ml-2" size={20} />
        </a>
      </div>
    </div>
  );
};

export default Hero;
