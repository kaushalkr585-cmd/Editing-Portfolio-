import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FadeIn } from '../common/FadeIn';

// Decorative asset URLs from Figma spec
const DECORATIVE_ASSETS = {
  moon: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
  bottomLeft: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
  lego: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
  bottomRight: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
};

const DEFAULT_BIO =
  "I turn ideas and raw footage into compelling visual stories. From cinematic edits and anime AMVs to brand videos, real estate films, and podcast content, I focus on pacing, visual storytelling, color, sound, and detail. Let's create something unforgettable together!";

// Progressive Word/Character Reveal component
const ProgressiveWord = ({ word, progress, start, end }) => {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const color = useTransform(progress, [start, end], ['#525252', '#F5F5F5']);

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.28em] transition-colors duration-75 select-text"
    >
      {word}
    </motion.span>
  );
};

export const AboutMe = ({ bio = DEFAULT_BIO }) => {
  const containerRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'center 0.4'],
  });

  const words = bio.split(' ');

  const handleImageError = (key) => {
    setImageErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-[#0C0C0C] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* 4 Decorative Corner Images from Figma Spec */}
      
      {/* 1. Moon Icon (Top-Left / Top-Right balance) */}
      {!imageErrors.moon && (
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.85, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          src={DECORATIVE_ASSETS.moon}
          alt=""
          role="presentation"
          onError={() => handleImageError('moon')}
          className="absolute top-10 left-6 sm:left-14 lg:left-24 w-16 sm:w-24 lg:w-32 pointer-events-none select-none z-0 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        />
      )}

      {/* 2. Lego Icon (Top-Right) */}
      {!imageErrors.lego && (
        <motion.img
          initial={{ opacity: 0, rotate: -15 }}
          whileInView={{ opacity: 0.85, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          src={DECORATIVE_ASSETS.lego}
          alt=""
          role="presentation"
          onError={() => handleImageError('lego')}
          className="absolute top-12 right-6 sm:right-16 lg:right-28 w-16 sm:w-24 lg:w-32 pointer-events-none select-none z-0 filter drop-shadow-[0_0_25px_rgba(182,0,168,0.2)]"
        />
      )}

      {/* 3. Bottom-Left Object (p59_1) */}
      {!imageErrors.bottomLeft && (
        <motion.img
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 0.8, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          src={DECORATIVE_ASSETS.bottomLeft}
          alt=""
          role="presentation"
          onError={() => handleImageError('bottomLeft')}
          className="absolute bottom-8 left-4 sm:left-12 lg:left-20 w-20 sm:w-32 lg:w-44 pointer-events-none select-none z-0 filter drop-shadow-[0_0_25px_rgba(118,33,176,0.25)]"
        />
      )}

      {/* 4. Bottom-Right Group (Group_134-1) */}
      {!imageErrors.bottomRight && (
        <motion.img
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 0.8, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45 }}
          src={DECORATIVE_ASSETS.bottomRight}
          alt=""
          role="presentation"
          onError={() => handleImageError('bottomRight')}
          className="absolute bottom-10 right-4 sm:right-12 lg:right-20 w-24 sm:w-36 lg:w-48 pointer-events-none select-none z-0 filter drop-shadow-[0_0_30px_rgba(190,76,0,0.25)]"
        />
      )}

      {/* Ambient center background glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none -z-10 opacity-30" />

      {/* Content Container */}
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Section Heading with specified hero-heading gradient */}
        <FadeIn delay={0.1} y={-10}>
          <h2 className="hero-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase mb-8 sm:mb-12">
            About me
          </h2>
        </FadeIn>

        {/* Accessible screen-reader text */}
        <span className="sr-only">{bio}</span>

        {/* Progressive scroll reveal paragraph */}
        <div
          aria-hidden="true"
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed sm:leading-snug tracking-tight text-center max-w-3xl"
        >
          {words.map((word, index) => {
            const start = index / words.length;
            const end = (index + 1) / words.length;
            return (
              <ProgressiveWord
                key={index}
                word={word}
                progress={scrollYProgress}
                start={start}
                end={end}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
