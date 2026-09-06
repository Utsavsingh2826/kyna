export function initGTM() {
  const gtmId = import.meta.env.VITE_GTM_ID;
  if (!gtmId || typeof window === "undefined") return;
  if (document.getElementById("gtm-script")) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": Date.now(),
    event: "gtm.js",
  });

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.insertBefore(script, document.head.firstChild);

  if (!document.getElementById("gtm-noscript")) {
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-noscript";
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }
}
