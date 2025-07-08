import React from 'react';
import './Loader.css';
import '../styles/global.css';

const Loader = () => {
  return (
    <div className="loader-spinner flex-center">
      <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    </div>
  );
};

export default Loader;
