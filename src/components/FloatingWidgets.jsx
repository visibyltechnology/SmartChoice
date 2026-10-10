import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWidgets() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const whatsappNumber = "2348165929400"; // Smart Choice Electronics - +234 816 592 9400
  const whatsappMessage = "Hello! I'm interested in your electronics products at Smart Choice Electronics.";

  return (
    <div className="floating-widgets">
      {/* WhatsApp Support Button */}
      <a 
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="float-btn float-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat with Smart Choice on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>

      {/* Back to Top Button */}
      {isVisible && (
        <button 
          onClick={scrollToTop} 
          className="float-btn float-scroll"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}
