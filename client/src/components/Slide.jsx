import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade'; // Import effect-specific styles

// Import required modules
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

export default function Slide() {
  return (
    <>
      <Swiper
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination, Autoplay, EffectFade]}  // Add Autoplay and EffectFade modules
        autoplay={{
          delay: 1500,  // Time between slides in ms (2.5 seconds)
          disableOnInteraction: false,  // Continue autoplay even after user interaction
        }}
        loop={true}
        effect="fade"  // Apply fade transition effect
        className="w-full h-96"  // Custom width and height
      >
        <SwiperSlide><img src="/1.png" alt="Slide 1" className="w-full h-full object-cover" /></SwiperSlide>
        <SwiperSlide><img src="/2.jpg" alt="Slide 2" className="w-full h-full object-cover" /></SwiperSlide>
        <SwiperSlide><img src="/3.png" alt="Slide 3" className="w-full h-full object-cover" /></SwiperSlide>
      </Swiper>
    </>
  );
}
