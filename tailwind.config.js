/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/components/**/*.{js,vue,ts}",
    "./src/layouts/**/*.vue",
    "./src/pages/**/*.vue",
    "./src/plugins/**/*.{js,ts}",
    "./src/app.vue", // <--- Importante
    "./src/error.vue"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}