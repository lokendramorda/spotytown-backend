const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  mode: "jit",
  theme: {
    extend: {
      screens: {
        'media': '100px',
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assests/jema.png')",
        "hero-pattern2": "url('/src/assests/jema2.png')"},
    },
  },
  plugins: [],
});