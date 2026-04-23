module.exports = {
  content: [
    "./apps/menyra-social/index.html",
    "./apps/menyra-social/social-app.js",
    "./apps/menyra-social/_shared/**/*.js",
    "./apps/menyra-social/core/**/*.js",
    "./apps/menyra-social/profile/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"]
      }
    }
  }
};
