import React from 'react';
import Image from 'next/image';

const IconTest = () => {
  return (
    <div className="container mt-5">
      <h2>Icon Test</h2>
      <div className="row">
        <div className="col-md-4">
          <h4>Using Next.js Image</h4>
          <Image 
            src="/assets/all icons 96px/AI.png" 
            alt="AI Icon" 
            width={96} 
            height={96} 
            style={{ border: '1px solid red' }}
          />
        </div>
        <div className="col-md-4">
          <h4>Using Regular Img Tag</h4>
          <img 
            src="/assets/all icons 96px/AI.png" 
            alt="AI Icon" 
            style={{ width: '96px', height: '96px', border: '1px solid blue' }}
          />
        </div>
        <div className="col-md-4">
          <h4>Using Background Image</h4>
          <div 
            style={{ 
              width: '96px', 
              height: '96px', 
              backgroundImage: 'url(/assets/all icons 96px/AI.png)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              border: '1px solid green' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default IconTest;
