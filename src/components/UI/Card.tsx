import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200';
  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={onClick ? { y: 0, scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        className={classes}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;