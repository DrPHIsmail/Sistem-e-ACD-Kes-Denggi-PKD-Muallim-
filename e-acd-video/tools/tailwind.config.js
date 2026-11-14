/* Tailwind 3.4.17 (same major/minor as the source app's CDN build), compiled offline. */
const path = require('path');
module.exports = {
  content: [path.join(__dirname, '../src/**/*.{js,html}')],
  theme: { extend: { fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] } } }
};
