import React, { useEffect } from 'react';

const GoogleAd = ({ 
  slot, 
  format = 'auto',
  responsive = true,
  style = { display: 'block' }
}) => {
  useEffect(() => {
    try {
      // Push ad after component mounts
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // Only show ads in production
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div style={{ 
        ...style, 
        background: '#f0f0f0', 
        padding: '20px', 
        textAlign: 'center',
        border: '2px dashed #ccc',
        color: '#666'
      }}>
        Ad Placeholder ({format})
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-3485450755973148"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive.toString()}
    />
  );
};

export default GoogleAd;
