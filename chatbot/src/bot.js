/**
 * Spa Bot Widget Loader - Production Grade
 * Complete isolation using Shadow DOM to prevent any host CSS interference
 * Works like Tawk.to, Crisp, Intercom - always stays on top
 * 
 * Usage:
 * <script src="https://chatbot.yourdomain.com/bot.js?spa=spa_1"></script>
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__SPA_BOT_LOADED) {
    console.warn('[SpaBot] Widget already loaded');
    return;
  }
  window.__SPA_BOT_LOADED = true;

  // Get the current script element
  const currentScript = document.currentScript || 
    document.querySelector('script[src*="bot.js"]') ||
    document.scripts[document.scripts.length - 1];

  if (!currentScript) {
    console.error('[SpaBot] Could not find script element');
    return;
  }

  // Extract spaId from query parameter, data attribute, or global variable
  const scriptSrc = currentScript.src || currentScript.getAttribute('src') || '';
  const urlParams = new URLSearchParams(scriptSrc.split('?')[1] || '');
  const spaId = 
    urlParams.get('spa') || 
    currentScript.getAttribute('data-spa') ||
    window.__SPA_BOT_ID ||
    null;

  if (!spaId) {
    console.error('[SpaBot] Missing spaId. Please provide spaId in script URL: bot.js?spa=YOUR_SPA_ID');
    return;
  }

  // Extract baseUrl from script src
  let baseUrl = '';
  
  if (currentScript.dataset && currentScript.dataset.base) {
    baseUrl = currentScript.dataset.base;
  } else if (scriptSrc) {
    const url = new URL(scriptSrc);
    baseUrl = `${url.protocol}//${url.host}${url.pathname.replace(/\/bot\.js$/, '')}`;
  } else {
    baseUrl = window.location.origin;
  }

  baseUrl = baseUrl.replace(/\/$/, '');

  console.log('[SpaBot] Initializing with spaId:', spaId, 'baseUrl:', baseUrl);

  // Check if widget container already exists
  const existingContainer = document.getElementById('spa-bot-root');
  if (existingContainer) {
    console.warn('[SpaBot] Widget container already exists');
    return;
  }

  // Wait for DOM to be ready
  function initWidget() {
    // Create host container - directly in document.body
    const hostContainer = document.createElement('div');
    hostContainer.id = 'spa-bot-root';
    hostContainer.setAttribute('data-spa-id', spaId);
    hostContainer.setAttribute('data-spa-bot-widget', 'true');
    
    // CRITICAL: Set host container styles with maximum priority
    // This container is in the host document, so it needs maximum z-index
    hostContainer.style.cssText = `
      position: fixed !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 400px !important;
      height: 600px !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      outline: none !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
      transform: translateZ(0) !important;
      will-change: transform !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
      overflow: visible !important;
      clip: auto !important;
      clip-path: none !important;
      contain: layout style paint !important;
    `;
    
    // Set via setProperty for maximum browser compatibility
    const criticalProps = {
      'position': 'fixed',
      'z-index': '2147483647',
      'bottom': '0',
      'right': '0',
      'isolation': 'isolate',
      'opacity': '1',
      'visibility': 'visible',
      'display': 'block',
      'transform': 'translateZ(0)',
      'contain': 'layout style paint',
      'pointer-events': 'auto'
    };
    
    Object.keys(criticalProps).forEach(prop => {
      hostContainer.style.setProperty(prop, criticalProps[prop], 'important');
    });

    // Create Shadow DOM for complete CSS isolation
    // This prevents ANY host CSS from affecting the widget
    let shadowRoot;
    try {
      shadowRoot = hostContainer.attachShadow({ mode: 'open' });
    } catch (e) {
      // Fallback for browsers without Shadow DOM support
      console.warn('[SpaBot] Shadow DOM not supported, using regular DOM');
      shadowRoot = hostContainer;
    }

    // Create shadow container inside Shadow DOM
    const shadowContainer = document.createElement('div');
    shadowContainer.id = 'spa-bot-shadow-container';
    
    // Styles for shadow container (isolated from host CSS)
    shadowContainer.style.cssText = `
      position: fixed !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 400px !important;
      height: 600px !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
      transform: translateZ(0) !important;
      will-change: transform !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    const iframeSrc = `${baseUrl}?spa=${encodeURIComponent(spaId)}`;
    
    iframe.src = iframeSrc;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('title', 'Spa Booking Chatbot');
    iframe.setAttribute('aria-label', 'Spa Booking Chatbot');
    iframe.setAttribute('loading', 'eager');
    
    // Iframe styles - completely isolated
    iframe.style.cssText = `
      border: none !important;
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 2147483647 !important;
      background: transparent !important;
      pointer-events: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;

    // Handle iframe load errors
    iframe.onerror = function() {
      console.error('[SpaBot] Failed to load iframe:', iframeSrc);
      shadowContainer.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
          color: #666;
          font-family: Arial, sans-serif;
          font-size: 14px;
          z-index: 999999;
        ">
          <p>Chatbot temporarily unavailable</p>
          <p style="font-size: 12px; margin-top: 8px; color: #999;">Please try again later</p>
        </div>
      `;
    };

    // Append iframe to shadow container
    shadowContainer.appendChild(iframe);
    
    // Append shadow container to shadow root
    if (shadowRoot !== hostContainer) {
      shadowRoot.appendChild(shadowContainer);
    } else {
      // Fallback: append directly if no Shadow DOM
      shadowContainer.style.cssText = shadowContainer.style.cssText.replace('position: fixed', 'position: absolute');
      hostContainer.appendChild(shadowContainer);
    }
    
    // CRITICAL: Append host container directly to document.body
    // This ensures it's at the highest level in DOM hierarchy
    // Remove from any parent first to avoid stacking context issues
    if (hostContainer.parentNode) {
      hostContainer.parentNode.removeChild(hostContainer);
    }
    document.body.appendChild(hostContainer);
    
    // Ensure body doesn't have overflow:hidden that would clip the widget
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowX === 'hidden' || bodyStyle.overflowY === 'hidden') {
      console.warn('[SpaBot] Body has overflow:hidden, widget may be clipped');
    }
    
    // Force container to stay on top - comprehensive monitoring
    const ensureTopPosition = () => {
      // Ensure container is in body
      if (hostContainer.parentNode !== document.body) {
        document.body.appendChild(hostContainer);
      }
      
      // Force all critical properties on host container
      Object.keys(criticalProps).forEach(prop => {
        hostContainer.style.setProperty(prop, criticalProps[prop], 'important');
      });
      
      // Additional safety checks for host container
      hostContainer.style.setProperty('opacity', '1', 'important');
      hostContainer.style.setProperty('visibility', 'visible', 'important');
      hostContainer.style.setProperty('display', 'block', 'important');
      hostContainer.style.setProperty('pointer-events', 'auto', 'important');
      
      // Force styles on shadow container if it exists
      if (shadowContainer && shadowContainer.parentNode) {
        const shadowProps = {
          'position': 'fixed',
          'z-index': '2147483647',
          'bottom': '0',
          'right': '0',
          'pointer-events': 'auto',
          'opacity': '1',
          'visibility': 'visible',
          'display': 'block'
        };
        Object.keys(shadowProps).forEach(prop => {
          shadowContainer.style.setProperty(prop, shadowProps[prop], 'important');
        });
      }
      
      // Force styles on iframe
      if (iframe && iframe.parentNode) {
        const iframeProps = {
          'z-index': '2147483647',
          'pointer-events': 'auto',
          'opacity': '1',
          'visibility': 'visible',
          'display': 'block'
        };
        Object.keys(iframeProps).forEach(prop => {
          iframe.style.setProperty(prop, iframeProps[prop], 'important');
        });
      }
      
      // Check visibility
      const rect = hostContainer.getBoundingClientRect();
      const computed = window.getComputedStyle(hostContainer);
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       computed.visibility !== 'hidden' &&
                       computed.display !== 'none' &&
                       computed.opacity !== '0';
      
      if (!isVisible) {
        console.warn('[SpaBot] Container not visible, forcing visibility');
        hostContainer.style.setProperty('opacity', '1', 'important');
        hostContainer.style.setProperty('visibility', 'visible', 'important');
        hostContainer.style.setProperty('display', 'block', 'important');
        hostContainer.style.setProperty('pointer-events', 'auto', 'important');
      }
    };
    
    // Enhanced MutationObserver - monitors everything
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === hostContainer || (node.nodeType === 1 && node.contains && node.contains(hostContainer))) {
              console.warn('[SpaBot] Container was removed, re-adding');
              document.body.appendChild(hostContainer);
            }
          });
        }
        if (mutation.type === 'attributes' && mutation.target === hostContainer) {
          ensureTopPosition();
        }
      });
      ensureTopPosition();
    });
    
    // Observe body and container
    observer.observe(document.body, {
      childList: true,
      subtree: false,
      attributes: false
    });
    
    observer.observe(hostContainer, {
      attributes: true,
      attributeFilter: ['style', 'class', 'id']
    });
    
    // Event listeners with capture phase
    const events = ['scroll', 'resize', 'touchmove', 'wheel'];
    events.forEach(event => {
      window.addEventListener(event, ensureTopPosition, { 
        passive: true, 
        capture: true 
      });
    });
    
    // Continuous monitoring with requestAnimationFrame
    let rafId;
    let checkCount = 0;
    const maxChecks = 300; // ~5 seconds at 60fps
    
    const checkPosition = () => {
      if (checkCount < maxChecks) {
        ensureTopPosition();
        checkCount++;
        rafId = requestAnimationFrame(checkPosition);
      }
    };
    checkPosition();
    
    // Periodic check every 2 seconds (safety net)
    const periodicCheck = setInterval(() => {
      ensureTopPosition();
    }, 2000);
    
    // Cleanup after 10 seconds (widget should be stable)
    setTimeout(() => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      clearInterval(periodicCheck);
    }, 10000);

    console.log('[SpaBot] Widget loaded successfully with Shadow DOM isolation and maximum z-index');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Expose global API
  window.SpaBot = {
    spaId: spaId,
    baseUrl: baseUrl,
    version: '2.0.0',
    shadowDOM: true
  };
})();
