import React from 'react';
import PropTypes from 'prop-types';

const PlayIcon = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color}
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
};

PlayIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string
};

export default PlayIcon;