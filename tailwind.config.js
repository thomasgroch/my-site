// Font customization can be added later if needed

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', "./node_modules/flowbite/**/*.js"],
  theme: {
    fontSize: {
      // .75rem
      // .875rem
      'xs': '.875rem',
      'sm': '1rem',
      'tiny': '1.125rem',
      'base': '1.25rem',
      'lg': '1.5rem',
      'xl': '1.875rem',
      '2xl': '2.25rem',
      '3xl': '3rem',
      '4xl': '4rem',
      '5xl': '5rem',
      '6xl': '',
      '7xl': '',
    },
    extend: {
      fontFamily: {
        // sans: ['Noto Sans, ui-sans-serif, system-ui', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "50%": {
            opacity: .6,
            transform: "translate(30px, -50px) scale(1.3)",
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('flowbite/plugin')
  ],
}
