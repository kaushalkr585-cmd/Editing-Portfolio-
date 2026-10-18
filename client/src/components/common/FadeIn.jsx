import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable FadeIn animation component supporting custom element type,
 * configurable delay, duration, offsets, styles, and reduced motion.
 */
export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.6,
  x = 0,
  y = 20,
  className = '',
  style = {},
  as = 'div',
  viewport = { once: true, margin: '-50px' },
  ...props
}) => {
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default FadeIn;
