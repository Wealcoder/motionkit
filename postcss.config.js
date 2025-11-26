const tailwindAnimBuilder = require("./tailwind.animBuilder.config.js");
const tailwindAnimBuilderSettings = require("./tailwind.animBuilderSettings.config.js");


module.exports = {
  plugins: {
    "postcss-nested": {},
    tailwindcss: { tailwindAnimBuilder },
    tailwindcss: { tailwindAnimBuilderSettings },  
    autoprefixer: {},
  },
};
