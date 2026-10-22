const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // ビルド時に index.html へ入れる静的な HTML（scripts/prerender.mjs）のクラスも作る
    "./scripts/prerender.mjs",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'main': '#7dfab1',
      },
      rotate: {
        '135': '135deg',
        '-135': '-135deg',
      },
      spacing: {
        '6/13': '46.153846%',
        '11/24': '45.833333%',
        '13/24': '54.166667%',
        '14/24': '58.333333%',
        '9/24': '37.5%',
        '45/48': '93.75%',
        '92': '23rem',
      },
      borderWidth: {
        '1': '1px',
        '3': '3px',
      },
    },
  },
  plugins: [],
}

