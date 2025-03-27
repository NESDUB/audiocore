import React from 'react';
import PropTypes from 'prop-types';

const SkipIcon = ({ size = 24, color = 'currentColor', direction = 'next', ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color}
      {...props}
    >
      {direction === 'next' ? (
        // Skip Next
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      ) : (
        // Skip Previous
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
      )}
    </svg>
  );
};

SkipIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  direction: PropTypes.oneOf(['next', 'previous'])
};

export default SkipIcon;