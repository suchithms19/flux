import React from 'react';
import Calendly from './Calendly';

const FounderSection = () => {
  return (
    <div className="max-w-6xl mx-auto text-center px-4 md:px-6">
      <div className='flex flex-col md:flex-row justify-center md:space-x-10 items-center'>
        <div className='max-w-xl text-start mb-8 md:mb-0'>
          <div className='text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-black'>Get to Know Flux – Book a Call with the Founders!</div>
          <div className='text-lg md:text-xl text-gray-600'>
            Curious about our mission and how we're revolutionizing the way students learn and find clients? Here's your chance! Connect directly with the founders of Flux for an exclusive opportunity to dive into the vision behind our platform.<br/><br/>
            Ask questions, share your thoughts, and discover how you can be part of our exciting journey.<br/><br/>
            Ready to join us? Book your 10-minute call now!
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default FounderSection;