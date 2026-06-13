'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Vibrant Festival Collections",
    subtitle: "Up to 30% Off On Designer Sarees & Kurtis",
    description: "Embrace the festive spirits with handloom Banarasi silk, Kanchipuram weaves, and designer Anarkali suits crafted for elegance.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600",
    ctaLink: "/shop?category=Saree",
    color: "from-amber-600/80 to-rose-700/80",
  },
  {
    title: "Modern Indo-Western Fusion",
    subtitle: "Glamorous Party Wear & Western Silhouettes",
    description: "Step into modern style with sequinned bodycon gowns, foil-printed georgette maxi dresses, and elegant contemporary silhouettes.",
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=1600",
    ctaLink: "/shop?category=Western+Dress",
    color: "from-brand-teal-dark/80 to-purple-800/80",
  },
  {
    title: "Heritage Handloom Craftsmanship",
    subtitle: "100% Pure Fabrics & Traditional Embroidery",
    description: "Explore exquisite phulkari salwar suits, hand-embroidered velvet lehengas, and silk kurta sets for weddings and special occasions.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600",
    ctaLink: "/shop?category=Lehenga",
    color: "from-red-800/80 to-brand-gold-dark/80",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-[480px] w-full overflow-hidden bg-slate-900 group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        >
          {/* Overlay gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white space-y-6">
            <span className="text-brand-gold font-bold tracking-widest uppercase text-xs sm:text-sm bg-black/20 self-start px-3 py-1 rounded-full border border-brand-gold/30">
              {slide.subtitle}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-serif max-w-2xl leading-tight drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg max-w-lg text-slate-200 drop-shadow-sm font-light">
              {slide.description}
            </p>
            <div className="pt-2">
              <Link
                href={slide.ctaLink}
                className="bg-brand-saffron hover:bg-brand-saffron-dark text-white px-8 py-3.5 rounded-lg font-semibold text-sm transition-all inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current ? 'bg-brand-gold w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
