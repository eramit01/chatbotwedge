import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, CheckCircle2, Clock, ArrowLeft, Loader2, Percent, Calendar, ListChecks } from 'lucide-react';
// Universal default bot image - always accessible via public folder
const DEFAULT_BOT_IMAGE = "/default-bot.png";

// Import fallback bot images - Vite will process these correctly (backup fallbacks)
import bot1 from '../botimg/1.png';
import bot2 from '../botimg/2.png';
import bot3 from '../botimg/3.png';

// Fallback bot images array (backup if default-bot.png fails)
const FALLBACK_IMAGES = [bot1, bot2, bot3];
const getFallbackImage = (index) => {
  return FALLBACK_IMAGES[index] || FALLBACK_IMAGES[0];
};

// Universal safe bot image resolver
const getSafeBotImage = (botImageFromConfig) => {
  // If botImage is null, undefined, or empty string, use default
  if (!botImageFromConfig || botImageFromConfig.trim() === "") {
    return DEFAULT_BOT_IMAGE;
  }
  return botImageFromConfig;
};

// Universal image error handler - tries fallback images before showing initial
const createImageErrorHandler = (botImageValue, botNameValue) => (e) => {
  // If default image fails, try imported fallback
  if (botImageValue === DEFAULT_BOT_IMAGE || (typeof botImageValue === 'string' && botImageValue.includes('default-bot.png'))) {
    const fallbackImg = getFallbackImage(0);
    if (e.target.src !== fallbackImg) {
      e.target.src = fallbackImg;
      return;
    }
  }
  // If all images fail, show initial
  e.target.style.display = 'none';
  const fallback = e.target.parentElement;
  const isWhiteBg = fallback.className.includes('bg-white') || fallback.className.includes('bg-gradient');
  const textColor = isWhiteBg ? 'text-[#814157]' : 'text-white';
  const fontSize = 'text-base xs:text-lg sm:text-xl';
  fallback.className = fallback.className.replace('overflow-hidden', '');
  fallback.innerHTML = `<span class="flex items-center justify-center w-full h-full ${textColor} font-bold ${fontSize}">${botNameValue.charAt(0)}</span>`;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Random girl names for the bot (fallback)
const GIRL_NAMES = ['Priya', 'Ananya', 'Kavya', 'Sneha', 'Meera', 'Riya', 'Aisha', 'Neha', 'Divya', 'Shreya'];
const FALLBACK_AVATARS = [getFallbackImage(0), getFallbackImage(1), getFallbackImage(2)];

const BookingBot = ({ isOpen: externalIsOpen, onClose: externalOnClose, botName: externalBotName, botImage: externalBotImage }) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [showPopup, setShowPopup] = useState(false);
  const [spaConfig, setSpaConfig] = useState(null);
  const [status, setStatus] = useState("loading");
  const [botName, setBotName] = useState(externalBotName || '');
  const [botImage, setBotImage] = useState(externalBotImage ? getSafeBotImage(externalBotImage) : DEFAULT_BOT_IMAGE);
  const [currentView, setCurrentView] = useState('welcome'); // welcome, services, booking, success
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    services: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const sectionsViewedRef = useRef(0);
  const hasShownPopupRef = useRef(false);

  const spaId =
    new URLSearchParams(window.location.search).get("spa") ||
    window.__SPA_BOT_ID ||
    "";

  // Fetch spa config from API
  useEffect(() => {
    if (!spaId) {
      console.error("[SpaBot] Missing spaId. Add ?spa=your-spa-id to URL");
      setStatus("error");
      return;
    }
    const fetchConfig = async () => {
      try {
        setStatus("loading");
        const url = `${API_BASE}/spas/config/${spaId}`;
        console.log("[SpaBot] Fetching config from:", url);
        const { data } = await axios.get(url);
        console.log("[SpaBot] Config received:", data);
        if (!data || !data.isActive) {
          throw new Error("Spa is not active");
        }
        
        // Resolve bot name and image
        const resolvedBotName = data.botName || GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)];
        
        // Universal safe bot image resolution
        // Use the safe resolver which handles null, undefined, and empty strings
        let resolvedBotImage = getSafeBotImage(data.botImage);
        
        // If we got a non-default image, validate and resolve the URL
        if (resolvedBotImage !== DEFAULT_BOT_IMAGE) {
          try {
            // If it's already an absolute URL (http/https)
            if (resolvedBotImage.startsWith('http://') || resolvedBotImage.startsWith('https://')) {
              const testUrl = new URL(resolvedBotImage);
              resolvedBotImage = testUrl.href;
            } else if (resolvedBotImage.startsWith('/')) {
              // It's an absolute path - make it full URL using chatbot's origin
              resolvedBotImage = `${window.location.origin}${resolvedBotImage}`;
            } else {
              // It's a relative path - make it absolute
              resolvedBotImage = `${window.location.origin}/${resolvedBotImage}`;
            }
            console.log('[SpaBot] Resolved botImage URL:', resolvedBotImage);
          } catch (e) {
            // Invalid URL, use default
            console.warn('[SpaBot] Invalid botImage URL, using default:', data.botImage, e);
            resolvedBotImage = DEFAULT_BOT_IMAGE;
          }
        } else {
          console.log('[SpaBot] Using default bot image:', DEFAULT_BOT_IMAGE);
        }
        
        setBotName(resolvedBotName);
        setBotImage(resolvedBotImage);
        setSpaConfig(data);
        setStatus("ready");
        
        // Show popup after a delay if chat is closed
        if (!isOpen) {
          setTimeout(() => {
            setShowPopup(true);
          }, 2000);
        }
      } catch (error) {
        console.error("[SpaBot] Error fetching config:", error);
        console.error("[SpaBot] Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: url,
          spaId: spaId,
          apiBase: API_BASE
        });
        setStatus("error");
      }
    };
    fetchConfig();
  }, [spaId]);

  // Enhanced scroll tracking with intersection observer
  useEffect(() => {
    if (hasShownPopupRef.current || !spaConfig) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const handleIntersection = (entries) => {
      let viewedSections = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          viewedSections++;
        }
      });

      if (viewedSections >= 2 && !hasShownPopupRef.current && !isOpen) {
        hasShownPopupRef.current = true;
        setTimeout(() => {
          setShowPopup(true);
        }, 1500);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const heroSection = document.getElementById('hero');
    const servicesSection = document.getElementById('services');

    if (heroSection) observer.observe(heroSection);
    if (servicesSection) observer.observe(servicesSection);

    return () => {
      if (heroSection) observer.unobserve(heroSection);
      if (servicesSection) observer.unobserve(servicesSection);
    };
  }, [isOpen, spaConfig]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [currentView, isOpen, typingIndicator]);

  // Sync with external state
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
      if (externalIsOpen) {
        setShowPopup(false);
        setCurrentView('welcome');
        setTypingIndicator(true);
        setTimeout(() => {
          setTypingIndicator(false);
          scrollToBottom();
        }, 800);
      }
    }
  }, [externalIsOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowPopup(false);
    setCurrentView('welcome');
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      scrollToBottom();
    }, 800);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setCurrentView('welcome');
    setSelectedServices([]);
    setBookingData({ name: '', phone: '', services: '', message: '' });
    setSubmitStatus(null);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const handleAction = (action) => {
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      if (action === 'claim-offer') {
        setCurrentView('booking');
        setBookingData(prev => ({ ...prev, services: spaConfig?.offer || '20% Off Special Offer' }));
      } else if (action === 'book-now') {
        setCurrentView('booking');
      } else if (action === 'services-pricing') {
        setCurrentView('services');
      }
      scrollToBottom();
    }, 600);
  };

  const handleServiceSelect = (service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitStatus === 'error') {
      setSubmitStatus(null);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingData.name.trim() || !bookingData.phone.trim()) {
      setSubmitStatus('error');
      scrollToBottom();
      return;
    }

    if (!validatePhone(bookingData.phone)) {
      setSubmitStatus('error-phone');
      scrollToBottom();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const servicesList = selectedServices.length > 0 
      ? selectedServices.map(s => s.title).join(', ') 
      : bookingData.services || 'General Booking';

    try {
      await axios.post(`${API_BASE}/leads`, {
        spaId: spaConfig.spaId,
        name: bookingData.name.trim(),
        phone: bookingData.phone.trim(),
        services: selectedServices.length > 0 ? selectedServices.map(s => s.title) : [bookingData.services || 'General Booking'],
        message: bookingData.message.trim() || '',
      });

      setSubmitStatus('success');
      setCurrentView('success');
      setBookingData({ name: '', phone: '', services: '', message: '' });
      setSelectedServices([]);
      
      setTimeout(() => {
        setCurrentView('welcome');
        setSubmitStatus(null);
      }, 5000);
      
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookFromServices = () => {
    if (selectedServices.length > 0) {
      setBookingData(prev => ({ 
        ...prev, 
        services: selectedServices.map(s => s.title).join(', ') 
      }));
    }
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      setCurrentView('booking');
      scrollToBottom();
    }, 600);
  };

  const getTotalPrice = () => {
    if (selectedServices.length === 0) return null;
    
    // Calculate from service prices (using minPrice if available, or parse priceRange)
    const total = selectedServices.reduce((sum, service) => {
      if (service.minPrice) {
        return sum + service.minPrice;
      }
      // Try to parse priceRange (e.g., "₹1,500 - ₹2,500" -> 1500)
      const match = service.priceRange?.match(/₹[\d,]+/);
      if (match) {
        return sum + parseInt(match[0].replace(/[₹,]/g, ''));
      }
      return sum;
    }, 0);
    
    const discount = total * 0.2;
    return {
      original: total,
      discount: discount,
      final: total - discount
    };
  };

  const totalPrice = getTotalPrice();
  const accent = spaConfig?.colors?.primary || "#814157";
  const secondaryColor = spaConfig?.colors?.secondary || "#a85573";

  if (status === "loading") {
    return (
      <div className="fixed bottom-6 right-6" style={{ zIndex: 2147483647 }}>
        <div className="bg-white rounded-full p-4 shadow-lg">
          <Loader2 className="animate-spin text-[#814157]" size={24} />
        </div>
      </div>
    );
  }

  if (status === "error" || !spaConfig) {
    return (
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-6 shadow-2xl max-w-sm border border-red-200" style={{ zIndex: 2147483647 }}>
        <p className="text-gray-800 font-semibold mb-2">Chat temporarily unavailable</p>
        <div style={{ fontSize: "11px", marginTop: "8px", color: "#666" }}>
          <p className="mb-1"><strong>Debug Info:</strong></p>
          <p>spaId: {spaId || "❌ missing"}</p>
          <p>API: {API_BASE}</p>
          <p className="mt-2 text-xs text-gray-500">
            Check browser console (F12) for details
          </p>
        </div>
      </div>
    );
  }

  const services = spaConfig.services || [];

  return (
    <>
      {/* Enhanced Popup Notification */}
      {showPopup && !isOpen && (
        <div className="fixed bottom-24 left-6 animate-fade-in" style={{ zIndex: 2147483647 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full blur-2xl opacity-50"></div>
            
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 bg-[#814157] text-white hover:bg-[#a85573] transition-colors z-10 p-1.5 rounded-full shadow"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                  <img 
                    src={botImage} 
                    alt={botName}
                    className="w-full h-full object-cover"
                    onError={createImageErrorHandler(botImage, botName)}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Hi, I'm {botName} 👋</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-gray-500 font-medium">Online</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-4 relative z-10 leading-relaxed">
              Need help? Book appointments & claim offers!
            </p>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleOpenChat}
                className="flex-1 bg-[#814157] text-white py-2 px-4 rounded-xl font-semibold hover:bg-[#a85573] transition-all text-sm"
              >
                Claim Offer
              </button>
              <button
                onClick={handleOpenChat}
                className="flex-1 bg-white border-2 border-[#814157] text-[#814157] py-2 px-4 rounded-xl font-semibold hover:bg-[#814157]/10 transition-all text-sm"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Floating Chat Button - Only show if not controlled externally */}
      {!isOpen && externalIsOpen === undefined && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 left-6 bg-white text-white p-0 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95"
          style={{ zIndex: 2147483647 }}
          title="Chat with Booking Assistant"
          aria-label="Open booking chat"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <img 
              src={botImage} 
              alt={botName}
              className="w-full h-full object-cover"
              onError={createImageErrorHandler(botImage, botName)}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow"></div>
          </div>
        </button>
      )}

      {/* Enhanced Chat Window - Fully Responsive */}
      {isOpen && (
        <div className="fixed top-2 left-2 right-2 bottom-2 xs:top-4 xs:left-4 xs:right-4 xs:bottom-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-full sm:max-w-md sm:h-[85vh] sm:max-h-[700px] bg-white rounded-xl xs:rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden" style={{ zIndex: 2147483647 }}>
          {/* Enhanced Chat Header */}
          <div className="bg-[#814157] text-white p-3 xs:p-4 sm:p-5 flex items-center justify-between shadow-lg border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                  <img 
                    src={botImage} 
                    alt={botName}
                    className="w-full h-full object-cover"
                    onError={createImageErrorHandler(botImage, botName)}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-[2.5px] sm:border-[3px] border-[#814157] shadow-lg animate-pulse z-20 ring-1 ring-green-400/30"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm xs:text-base sm:text-lg truncate">{botName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-white/90 font-medium">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="text-white hover:bg-white/10 p-1.5 xs:p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close chat"
            >
              <X size={18} className="xs:w-5 xs:h-5" />
            </button>
          </div>

          {/* Enhanced Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-6 bg-gradient-to-b from-gray-50/50 via-white to-white custom-scrollbar">
            {currentView === 'welcome' && (
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex items-start gap-2 xs:gap-3 sm:gap-4 animate-fade-in">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white">
                    <img 
                      src={botImage} 
                      alt={botName}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(botImage, botName)}
                    />
                  </div>
                  <div className="bg-white rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-5 shadow-lg max-w-[92%] xs:max-w-[90%] sm:max-w-[85%] border border-gray-100/80">
                    <h2 className="text-gray-900 mb-2 sm:mb-3 leading-tight text-sm xs:text-base sm:text-lg font-semibold">
                      Welcome to <span className="text-[#814157] font-bold">{spaConfig.spaName}</span>
                    </h2>
                    <p className="text-gray-600 text-xs xs:text-sm sm:text-base mb-2 xs:mb-3 sm:mb-4 leading-relaxed">
                      I'm {botName}, your personal booking assistant. Let's find the perfect therapy for you.
                    </p>
                    
                    {/* Special Offer Card */}
                    {spaConfig.offer && (
                      <div className="bg-gradient-to-br from-[#814157]/10 via-[#814157]/5 to-white border-2 border-[#814157]/30 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 mb-2 xs:mb-3 sm:mb-4 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-20 xs:w-24 h-20 xs:h-24 bg-[#814157]/20 rounded-full blur-3xl opacity-40"></div>
                        <div className="relative z-10">
                          <p className="text-[10px] xs:text-xs sm:text-sm font-bold text-[#814157] uppercase tracking-wider mb-1.5 xs:mb-2 sm:mb-3">Limited Time Offer</p>
                          <p className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#814157] mb-1 xs:mb-1.5 sm:mb-2 leading-none">{spaConfig.offer}</p>
                          <p className="text-xs xs:text-sm sm:text-base text-[#814157]/80 mb-1.5 xs:mb-2 font-medium">on all spa services today</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 xs:p-2.5 sm:p-3 mb-2 xs:mb-3 sm:mb-4">
                      <p className="text-[9px] xs:text-[10px] sm:text-xs text-blue-800 font-medium leading-relaxed">
                        <strong>Booking & Payment:</strong> No advance payment required for booking. Payment will be completed face-to-face at the spa when you visit.
                      </p>
                    </div>
                    
                    <p className="text-gray-700 text-xs xs:text-sm sm:text-base font-semibold">How would you like to proceed?</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 xs:gap-3 sm:gap-4 mt-4 xs:mt-5 sm:mt-6 animate-fade-in">
                  {/* 20% Off Button */}
                  <button
                    onClick={() => handleAction('claim-offer')}
                    className="bg-[#814157] text-white py-3.5 xs:py-4 sm:py-5 px-4 xs:px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#a85573] transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 min-w-0 flex-1">
                      <Percent className="text-white" size={20} strokeWidth={2.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm xs:text-base sm:text-lg font-bold mb-0.5 xs:mb-1">Claim {spaConfig.offer || '20% Off'}</p>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-white/95 font-medium">Exclusive discount available today</p>
                      </div>
                    </div>
                    <span className="text-xl xs:text-2xl sm:text-3xl group-hover:translate-x-1 transition-transform flex-shrink-0 ml-1 xs:ml-2">→</span>
                  </button>
                  
                  {/* Book Appointment Button */}
                  <button
                    onClick={() => handleAction('book-now')}
                    className="bg-white border-2 border-[#814157] text-[#814157] py-3.5 xs:py-4 sm:py-5 px-4 xs:px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#814157]/10 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-md text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 min-w-0 flex-1">
                      <Calendar className="text-[#814157]" size={20} strokeWidth={2.5} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm xs:text-base sm:text-lg font-bold mb-0.5 xs:mb-1 text-[#814157]">Book Appointment</p>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-[#814157]/80 font-medium">Quick and easy booking</p>
                      </div>
                    </div>
                    <span className="text-xl xs:text-2xl sm:text-3xl text-[#814157] group-hover:translate-x-1 transition-transform flex-shrink-0 ml-1 xs:ml-2">→</span>
                  </button>
                  
                  {/* View Services Button */}
                  <button
                    onClick={() => handleAction('services-pricing')}
                    className="bg-white border-2 border-[#814157] text-[#814157] py-3.5 xs:py-4 sm:py-5 px-4 xs:px-5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#814157]/10 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-h-[56px]"
                  >
                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-4 min-w-0 flex-1">
                      <ListChecks className="text-[#814157]" size={18} />
                      <span className="text-sm xs:text-base sm:text-lg font-semibold">View services & pricing</span>
                    </div>
                    <span className="text-xl xs:text-2xl sm:text-3xl text-[#814157] group-hover:translate-x-1 transition-transform flex-shrink-0 ml-1 xs:ml-2">→</span>
                  </button>
                </div>
              </div>
            )}

            {currentView === 'services' && (
              <div className="space-y-4">
                {/* Services Message */}
                <div className="flex items-start gap-2 xs:gap-3 animate-fade-in">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                    <img 
                      src={botImage} 
                      alt={botName}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(botImage, botName)}
                    />
                  </div>
                  <div className="bg-white rounded-xl xs:rounded-2xl p-2.5 xs:p-3 sm:p-4 shadow-md max-w-[92%] xs:max-w-[90%] sm:max-w-[85%] border border-gray-100">
                    <p className="text-gray-800 font-bold mb-1 text-sm xs:text-base sm:text-lg">Our Premium Services</p>
                    <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm mb-2 sm:mb-3">Select one or more services you're interested in:</p>
                    
                    {services.length === 0 ? (
                      <p className="text-gray-500 text-sm">No services available at the moment.</p>
                    ) : (
                      <div className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 max-h-[200px] xs:max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {services.map((service) => {
                          const isSelected = selectedServices.find(s => s.id === service.id);
                          return (
                            <div
                              key={service.id}
                              className={`border-2 rounded-lg xs:rounded-xl p-2 xs:p-2.5 sm:p-3.5 cursor-pointer transition-all duration-200 touch-manipulation ${
                                isSelected
                                  ? 'border-[#814157] bg-gradient-to-r from-pink-50 to-rose-50 shadow-md'
                                  : 'border-gray-200 hover:border-[#814157]/50 hover:bg-gray-50 active:bg-gray-100'
                              }`}
                              onClick={() => handleServiceSelect(service)}
                            >
                              <div className="flex items-start justify-between gap-1.5 xs:gap-2 sm:gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                                    <p className={`font-bold text-[10px] xs:text-xs sm:text-sm ${isSelected ? 'text-[#814157]' : 'text-gray-800'}`}>
                                      {service.title}
                                    </p>
                                    {service.popular && (
                                      <span className="bg-yellow-100 text-yellow-700 text-[9px] xs:text-[10px] sm:text-xs font-bold px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-full">
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-[9px] xs:text-[10px] sm:text-xs text-gray-600 flex-wrap">
                                    {service.duration && (
                                      <div className="flex items-center gap-0.5 xs:gap-1">
                                        <Clock size={9} />
                                        {service.duration}
                                      </div>
                                    )}
                                    {service.priceRange && (
                                      <div className="flex items-center gap-0.5 xs:gap-1 flex-wrap">
                                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium">Starting from</span>
                                        <span className="text-[9px] xs:text-[10px] sm:text-xs font-semibold">{service.priceRange}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected 
                                    ? 'border-[#814157] bg-[#814157]' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {selectedServices.length > 0 && (
                      <div className="mt-3 xs:mt-4 p-2.5 xs:p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg xs:rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs xs:text-sm font-bold text-green-800 mb-1 xs:mb-1.5">
                              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                            </p>
                            {totalPrice && (
                              <div className="space-y-0.5 xs:space-y-1">
                                <p className="text-[10px] xs:text-xs sm:text-sm text-green-700">
                                  Estimated Total: <span className="line-through">₹{totalPrice.original.toLocaleString()}</span>{' '}
                                  <span className="font-bold text-green-800">₹{totalPrice.final.toLocaleString()}</span> (20% off)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 xs:gap-2.5 sm:gap-3 mt-3 xs:mt-3.5 sm:mt-4 animate-fade-in">
                  <button
                    onClick={handleBookFromServices}
                    disabled={selectedServices.length === 0}
                    className="flex-1 bg-white border-2 border-[#814157] text-[#814157] py-3 xs:py-3.5 sm:py-4 px-3 xs:px-4 sm:px-5 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#814157]/10 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2 text-xs xs:text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-h-[48px]"
                  >
                    <Calendar size={16} strokeWidth={2.5} />
                    <span className="hidden xs:inline sm:hidden">Book</span>
                    <span className="hidden sm:inline">Continue Booking</span>
                    <span className="xs:hidden">Book</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('welcome');
                      scrollToBottom();
                    }}
                    className="bg-[#814157] text-white py-3 xs:py-3.5 sm:py-4 px-3 xs:px-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#a85573] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-w-[48px] min-h-[48px]"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            )}

            {currentView === 'booking' && (
              <div className="space-y-4">
                {/* Booking Message */}
                <div className="flex items-start gap-2 xs:gap-3 animate-fade-in">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                    <img 
                      src={botImage} 
                      alt={botName}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(botImage, botName)}
                    />
                  </div>
                  <div className="bg-white rounded-xl xs:rounded-2xl p-2.5 xs:p-3 sm:p-4 shadow-md max-w-[92%] xs:max-w-[90%] sm:max-w-[85%] border border-gray-100">
                    <p className="text-gray-800 font-bold mb-1.5 xs:mb-2 text-xs xs:text-sm sm:text-base">Perfect! Let's complete your booking 🎉</p>
                    {selectedServices.length > 0 && (
                      <div className="mb-2 xs:mb-2.5 sm:mb-3 p-1.5 xs:p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-[9px] xs:text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 xs:mb-1.5">Selected Services:</p>
                        <div className="flex flex-wrap gap-1 xs:gap-1.5">
                          {selectedServices.map((service, idx) => (
                            <span key={idx} className="text-[9px] xs:text-[10px] sm:text-xs bg-[#814157] text-white px-1.5 xs:px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium">
                              {service.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm mb-2 xs:mb-2.5 sm:mb-3">Please fill in your details below:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 xs:p-2 sm:p-2.5 mt-1.5 xs:mt-2 sm:mt-3">
                      <p className="text-[9px] xs:text-[10px] sm:text-xs text-blue-800 font-medium leading-relaxed">
                        <strong>Payment Information:</strong> No advance payment required. Payment will be confirmed and completed face-to-face at the spa when you visit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleSubmitBooking} className="space-y-2 xs:space-y-2.5 sm:space-y-3 animate-fade-in">
                  {submitStatus === 'success' && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-800 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl text-[10px] xs:text-xs sm:text-sm flex items-start gap-1.5 xs:gap-2">
                      <CheckCircle2 size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p>Booking request submitted successfully! We'll contact you within 24 hours.</p>
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl text-[10px] xs:text-xs sm:text-sm flex items-start gap-1.5 xs:gap-2">
                      <X size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p>Please fill in all required fields.</p>
                    </div>
                  )}
                  {submitStatus === 'error-phone' && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-800 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl text-[10px] xs:text-xs sm:text-sm flex items-start gap-1.5 xs:gap-2">
                      <X size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p>Please enter a valid 10-digit Indian phone number.</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="name" className="block text-xs xs:text-sm font-medium text-gray-700 mb-0.5 xs:mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingInputChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-[#814157] focus:border-[#814157] transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-xs xs:text-sm sm:text-base hover:border-gray-300 touch-manipulation"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs xs:text-sm font-medium text-gray-700 mb-0.5 xs:mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleBookingInputChange}
                      placeholder="Enter 10-digit phone number"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-[#814157] focus:border-[#814157] transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-xs xs:text-sm sm:text-base hover:border-gray-300 touch-manipulation"
                    />
                  </div>
                  {selectedServices.length === 0 && (
                    <div className="space-y-1">
                      <label htmlFor="services" className="block text-xs xs:text-sm font-medium text-gray-700 mb-0.5 xs:mb-1">
                        Services Interested <span className="text-gray-400 text-[10px] xs:text-xs">(optional)</span>
                      </label>
                      <input
                        type="text"
                        id="services"
                        name="services"
                        value={bookingData.services}
                        onChange={handleBookingInputChange}
                        placeholder="Mention services you're interested in"
                        className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-[#814157] focus:border-[#814157] transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-xs xs:text-sm sm:text-base hover:border-gray-300 touch-manipulation"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label htmlFor="message" className="block text-xs xs:text-sm font-medium text-gray-700 mb-0.5 xs:mb-1">
                      Additional Message <span className="text-gray-400 text-[10px] xs:text-xs">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={bookingData.message}
                      onChange={handleBookingInputChange}
                      placeholder="Any special requests, preferred time, or additional information"
                      rows="4"
                      className="w-full px-3 xs:px-4 sm:px-5 py-2.5 xs:py-3 sm:py-3.5 border-2 border-gray-200 rounded-lg xs:rounded-xl focus:ring-2 focus:ring-[#814157] focus:border-[#814157] transition-all duration-200 resize-none bg-white text-gray-900 placeholder-gray-400 text-xs xs:text-sm sm:text-base hover:border-gray-300 touch-manipulation"
                    />
                  </div>
                  <div className="flex gap-2 xs:gap-3 sm:gap-4 pt-2 xs:pt-2.5 sm:pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#814157] text-white py-3 xs:py-3.5 sm:py-4 px-3 xs:px-4 sm:px-5 md:px-6 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#a85573] transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-h-[48px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span className="hidden xs:inline sm:hidden">Submitting</span>
                          <span className="hidden sm:inline">Submitting...</span>
                          <span className="xs:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span className="hidden xs:inline sm:hidden">Submit</span>
                          <span className="hidden sm:inline">Submit Booking</span>
                          <span className="xs:hidden">Submit</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('welcome');
                        setSubmitStatus(null);
                        scrollToBottom();
                      }}
                      className="bg-[#814157] text-white py-3 xs:py-3.5 sm:py-4 px-3 xs:px-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-[#a85573] transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#814157] focus:ring-offset-2 touch-manipulation min-w-[48px] min-h-[48px]"
                      aria-label="Go back"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentView === 'success' && (
              <div className="space-y-3 xs:space-y-4 animate-fade-in">
                <div className="flex items-start gap-2 xs:gap-3">
                  <div className="w-9 h-9 xs:w-10 xs:h-10 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                    <img 
                      src={botImage} 
                      alt={botName}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(botImage, botName)}
                    />
                  </div>
                  <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-md max-w-[92%] xs:max-w-[90%] sm:max-w-[85%] border border-gray-100 text-center">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4">
                      <CheckCircle2 size={24} className="xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>
                    <p className="text-gray-800 font-bold text-sm xs:text-base sm:text-lg mb-1.5 xs:mb-2">Booking Confirmed! 🎉</p>
                    <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm mb-2 xs:mb-3 sm:mb-4 leading-relaxed">
                      Thank you for choosing {spaConfig.spaName}! We've received your booking request and will contact you shortly to confirm your appointment.
                    </p>
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg xs:rounded-xl p-2 xs:p-2.5 sm:p-3 mb-2 xs:mb-3 sm:mb-4">
                      <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-700 mb-1.5 xs:mb-2 leading-relaxed">
                        <strong>What's next?</strong> Our team will call you within 24 hours to finalize your appointment time and answer any questions.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 xs:p-2 mt-1.5 xs:mt-2">
                        <p className="text-[9px] xs:text-[10px] sm:text-xs text-blue-800 font-medium leading-relaxed">
                          <strong>Payment:</strong> No advance payment needed. Payment will be confirmed and completed face-to-face when you visit the spa.
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-[9px] xs:text-[10px] sm:text-xs">
                      You can close this chat anytime. We're here if you need anything else! 😊
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {typingIndicator && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-gradient-to-br from-[#814157] to-[#a85573] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md">
                  <img 
                    src={botImage} 
                    alt={botName}
                    className="w-full h-full object-cover"
                    onError={createImageErrorHandler(botImage, botName)}
                  />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default BookingBot;
