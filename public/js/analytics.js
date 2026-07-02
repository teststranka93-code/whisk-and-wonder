/**
 * GA4 placeholder loader + typed event helpers.
 * Swap GA_MEASUREMENT_ID in config.js with a real ID to go live;
 * until then events log to the console so the tracking plan is demoable.
 */
(function () {
  const id = window.WW_CONFIG?.GA_MEASUREMENT_ID;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  if (id && !id.includes("XXXXXXXXXX")) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
    gtag("js", new Date());
    gtag("config", id);
  } else {
    console.info("[GA4] Placeholder mode — set WW_CONFIG.GA_MEASUREMENT_ID to enable real tracking.");
  }

  window.wwTrack = function (eventName, params) {
    gtag("event", eventName, params || {});
    console.info(`[GA4 event] ${eventName}`, params || {});
  };
})();
