import { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageCarousel = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  return (
    <div className='relative'>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} >
            <div className="flex justify-center items-center">
              <img
                src={`http://localhost:3000/uploads/${image}`}
                alt={`Slide ${index + 1}`}
                className="block h-full w-full sm:w-auto sm:h-[40vh]"
              />
            </div>
          </div>
        ))}
      </Slider>
      <div className="absolute bottom-1 right-1 text-xs">
        <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {currentSlide + 1} / {images.length}
        </span>
      </div>
    </div>
  );
};

export default ImageCarousel;