import React from 'react';

const FlexibleAdvert = ({ title, description, imageSrc, buttonText = "Get Started" }) => {
  return (
    <div className="text-poppins max-w-5xl mx-auto ">
      <div className="flex justify-center ">
        <img src={imageSrc} alt="Advertisement banner" className="lg:w-7/12 rounded-t-lg" />
      </div>
      
      <div className="p-6 bg-customYellow2 rounded-b-lg shadow-md">
        <h2 className="text-poppins uppercase text-xl lg:text-3xl font-bold text-center mb-4">{title}</h2>
        
        <p className=" lg:text-xl text-center mb-6">{description}</p>
        
      </div>
    </div>
  );
};

export default FlexibleAdvert;
