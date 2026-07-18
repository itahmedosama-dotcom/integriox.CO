/* ==========================================================================
   Integriox — Site-wide connection config
   --------------------------------------------------------------------------
   This file is the SHARED, permanent Google Sheet connection used by every
   visitor of the deployed site (not just localStorage on one browser).

   How it's meant to be edited:
   1. Go to Settings → 🔌 الربط والتكامل (Integration).
   2. Change the Web App URL / API Key and click
      "تطبيق ومعاينة على هذا الجهاز" to preview the change locally first
      (this only affects your own browser).
   3. Once you're happy with it, click "تحميل ملف config.js المحدث" to
      download an updated version of *this exact file*.
   4. Upload/replace assets/js/config.js in your hosting (e.g. GitHub Pages)
      with the downloaded file so the change applies to every visitor.

   You can also edit the two values below by hand and re-upload.
   ========================================================================== */
window.INTEGRIOX_CONFIG = {
  sheetUrl: "https://script.google.com/macros/s/AKfycbw9VolKZEUii0rSdU6Dei9gr-3Dbtf7ld7t4vyMOzUtqyh1mNeOgQMIxCsgNADHgO4t/exec",
  apiKey: "INX-2026SecretKey123"
};
