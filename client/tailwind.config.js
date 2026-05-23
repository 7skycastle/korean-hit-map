/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#182033",
        paper: "#f5f6f8"
      },
      boxShadow: {
        report: "0 18px 50px rgba(24, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};
