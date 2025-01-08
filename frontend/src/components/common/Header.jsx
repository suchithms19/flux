import React from 'react';

const Header = ({ isVisible }) => {

  return (
    <div className={`font-poppins uppercase fixed top-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-center lg:p-4 px-4 py-2 bg-customYellow text-black z-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
      <div className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-0">
        Flux
      </div>
      <div className="font-semibold text-center sm:text-left mb-2 hidden sm:block">
        Public beta is coming soon !!
      </div>
      <div></div> {/*  //know more */}
    </div>
  );
};

export default Header;