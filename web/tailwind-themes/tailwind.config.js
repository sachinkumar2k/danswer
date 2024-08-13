/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

    // tremor
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      transitionProperty: {
        spacing: "margin, padding",
      },

      keyframes: {
        "subtle-pulse": {
          "0%, 100%": { opacity: 0.9 },
          "50%": { opacity: 0.5 },
        },
        pulse: {
          "0%, 100%": { opacity: 0.9 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "subtle-pulse": "subtle-pulse 2s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      gradientColorStops: {
        "neutral-10": "#e5e5e5 5%",
      },
      screens: {
        "2xl": "1420px",
        "3xl": "1700px",
        "4xl": "2000px",
        mobile: { max: "767px" },
        desktop: "768px",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      width: {
        "message-xs": "450px",
        "message-sm": "550px",
        "message-default": "740px",
        "searchbar-xs": "560px",
        "searchbar-sm": "660px",
        searchbar: "850px",
        "document-sidebar": "800px",
        "document-sidebar-large": "1000px",
      },
      maxWidth: {
        "document-sidebar": "1000px",
        "message-max": "725px",
        "searchbar-max": "750px",
      },
      colors: {
        // Helper function to create color objects
        createColor: (lightColor, darkColor) => ({
          DEFAULT: darkColor,
          dark: darkColor,
        }),

        // Code styling
        "code-bg": ({ opacityValue }) => ({
          DEFAULT: `rgba(0, 0, 0, ${opacityValue || 1})`,
          dark: `rgba(30, 30, 30, ${opacityValue || 1})`,
        }),
        "code-text": ({ opacityValue }) => ({
          DEFAULT: `rgba(224, 224, 224, ${opacityValue || 1})`,
          dark: `rgba(212, 212, 212, ${opacityValue || 1})`,
        }),
        "token-comment": "#608b4e",
        "token-punctuation": "#d4d4d4",
        "token-property": "#569cd6",
        "token-selector": "#e07b53",
        "token-atrule": "#d18ad8",
        "token-function": "#f0e68c",
        "token-regex": "#9cdcfe",
        "token-attr-name": "#9cdcfe",

        // Background
        "background-search": ({ opacityValue }) => ({
          DEFAULT: `rgba(255, 255, 255, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),
        input: ({ opacityValue }) => ({
          DEFAULT: `rgba(245, 245, 245, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),
        background: ({ opacityValue }) => ({
          DEFAULT: `rgba(250, 250, 250, ${opacityValue || 1})`,
          dark: `rgba(17, 24, 39, ${opacityValue || 1})`,
        }),
        "background-100": ({ opacityValue }) => ({
          DEFAULT: `rgba(245, 245, 245, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),
        "background-125": ({ opacityValue }) => ({
          DEFAULT: `rgba(241, 242, 244, ${opacityValue || 1})`,
          dark: `rgba(36, 43, 56, ${opacityValue || 1})`,
        }),
        "background-150": ({ opacityValue }) => ({
          DEFAULT: `rgba(234, 234, 234, ${opacityValue || 1})`,
          dark: `rgba(42, 52, 65, ${opacityValue || 1})`,
        }),
        "background-200": ({ opacityValue }) => ({
          DEFAULT: `rgba(229, 229, 229, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),
        "background-300": ({ opacityValue }) => ({
          DEFAULT: `rgba(212, 212, 212, ${opacityValue || 1})`,
          dark: `rgba(75, 85, 99, ${opacityValue || 1})`,
        }),
        "background-400": ({ opacityValue }) => ({
          DEFAULT: `rgba(163, 163, 163, ${opacityValue || 1})`,
          dark: `rgba(107, 114, 128, ${opacityValue || 1})`,
        }),
        "background-800": ({ opacityValue }) => ({
          DEFAULT: `rgba(38, 38, 38, ${opacityValue || 1})`,
          dark: `rgba(229, 231, 235, ${opacityValue || 1})`,
        }),
        "background-900": ({ opacityValue }) => ({
          DEFAULT: `rgba(17, 24, 39, ${opacityValue || 1})`,
          dark: `rgba(243, 244, 246, ${opacityValue || 1})`,
        }),
        "background-inverted": ({ opacityValue }) => ({
          DEFAULT: `rgba(0, 0, 0, ${opacityValue || 1})`,
          dark: `rgba(255, 255, 255, ${opacityValue || 1})`,
        }),
        "background-emphasis": ({ opacityValue }) => ({
          DEFAULT: `rgba(246, 247, 248, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),
        "background-strong": ({ opacityValue }) => ({
          DEFAULT: `rgba(234, 236, 239, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),

        // Text or icons
        "text-50": ({ opacityValue }) => ({
          DEFAULT: `rgba(250, 250, 250, ${opacityValue || 1})`,
          dark: `rgba(249, 250, 251, ${opacityValue || 1})`,
        }),
        "text-100": ({ opacityValue }) => ({
          DEFAULT: `rgba(245, 245, 245, ${opacityValue || 1})`,
          dark: `rgba(243, 244, 246, ${opacityValue || 1})`,
        }),
        "text-200": ({ opacityValue }) => ({
          DEFAULT: `rgba(229, 229, 229, ${opacityValue || 1})`,
          dark: `rgba(229, 231, 235, ${opacityValue || 1})`,
        }),
        "text-300": ({ opacityValue }) => ({
          DEFAULT: `rgba(212, 212, 212, ${opacityValue || 1})`,
          dark: `rgba(209, 213, 219, ${opacityValue || 1})`,
        }),
        "text-400": ({ opacityValue }) => ({
          DEFAULT: `rgba(163, 163, 163, ${opacityValue || 1})`,
          dark: `rgba(156, 163, 175, ${opacityValue || 1})`,
        }),
        "text-500": ({ opacityValue }) => ({
          DEFAULT: `rgba(115, 115, 115, ${opacityValue || 1})`,
          dark: `rgba(107, 114, 128, ${opacityValue || 1})`,
        }),
        "text-600": ({ opacityValue }) => ({
          DEFAULT: `rgba(82, 82, 82, ${opacityValue || 1})`,
          dark: `rgba(75, 85, 99, ${opacityValue || 1})`,
        }),
        "text-700": ({ opacityValue }) => ({
          DEFAULT: `rgba(64, 64, 64, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),
        "text-800": ({ opacityValue }) => ({
          DEFAULT: `rgba(38, 38, 38, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),

        subtle: ({ opacityValue }) => ({
          DEFAULT: `rgba(107, 114, 128, ${opacityValue || 1})`,
          dark: `rgba(156, 163, 175, ${opacityValue || 1})`,
        }),
        default: ({ opacityValue }) => ({
          DEFAULT: `rgba(75, 85, 99, ${opacityValue || 1})`,
          dark: `rgba(209, 213, 219, ${opacityValue || 1})`,
        }),
        emphasis: ({ opacityValue }) => ({
          DEFAULT: `rgba(55, 65, 81, ${opacityValue || 1})`,
          dark: `rgba(243, 244, 246, ${opacityValue || 1})`,
        }),
        strong: ({ opacityValue }) => ({
          DEFAULT: `rgba(17, 24, 39, ${opacityValue || 1})`,
          dark: `rgba(249, 250, 251, ${opacityValue || 1})`,
        }),

        link: ({ opacityValue }) => ({
          DEFAULT: `rgba(59, 130, 246, ${opacityValue || 1})`,
          dark: `rgba(96, 165, 250, ${opacityValue || 1})`,
        }),
        "link-hover": ({ opacityValue }) => ({
          DEFAULT: `rgba(29, 78, 216, ${opacityValue || 1})`,
          dark: `rgba(147, 197, 253, ${opacityValue || 1})`,
        }),
        inverted: ({ opacityValue }) => ({
          DEFAULT: `rgba(255, 255, 255, ${opacityValue || 1})`,
          dark: `rgba(0, 0, 0, ${opacityValue || 1})`,
        }),

        // One offs
        error: ({ opacityValue }) => ({
          DEFAULT: `rgba(239, 68, 68, ${opacityValue || 1})`,
          dark: `rgba(248, 113, 113, ${opacityValue || 1})`,
        }),
        success: ({ opacityValue }) => ({
          DEFAULT: `rgba(5, 150, 105, ${opacityValue || 1})`,
          dark: `rgba(16, 185, 129, ${opacityValue || 1})`,
        }),
        alert: ({ opacityValue }) => ({
          DEFAULT: `rgba(245, 158, 11, ${opacityValue || 1})`,
          dark: `rgba(251, 191, 36, ${opacityValue || 1})`,
        }),
        accent: ({ opacityValue }) => ({
          DEFAULT: `rgba(99, 102, 241, ${opacityValue || 1})`,
          dark: `rgba(129, 140, 248, ${opacityValue || 1})`,
        }),

        // Borders
        border: ({ opacityValue }) => ({
          DEFAULT: `rgba(229, 231, 235, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),
        "border-light": ({ opacityValue }) => ({
          DEFAULT: `rgba(243, 244, 246, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),
        "border-medium": ({ opacityValue }) => ({
          DEFAULT: `rgba(209, 213, 219, ${opacityValue || 1})`,
          dark: `rgba(75, 85, 99, ${opacityValue || 1})`,
        }),
        "border-strong": ({ opacityValue }) => ({
          DEFAULT: `rgba(156, 163, 175, ${opacityValue || 1})`,
          dark: `rgba(107, 114, 128, ${opacityValue || 1})`,
        }),
        "border-dark": ({ opacityValue }) => ({
          DEFAULT: `rgba(82, 82, 82, ${opacityValue || 1})`,
          dark: `rgba(229, 231, 235, ${opacityValue || 1})`,
        }),

        // Hover
        "hover-light": ({ opacityValue }) => ({
          DEFAULT: `rgba(243, 244, 246, ${opacityValue || 1})`,
          dark: `rgba(31, 41, 55, ${opacityValue || 1})`,
        }),
        "hover-lightish": ({ opacityValue }) => ({
          DEFAULT: `rgba(234, 235, 239, ${opacityValue || 1})`,
          dark: `rgba(42, 52, 65, ${opacityValue || 1})`,
        }),
        hover: ({ opacityValue }) => ({
          DEFAULT: `rgba(229, 231, 235, ${opacityValue || 1})`,
          dark: `rgba(55, 65, 81, ${opacityValue || 1})`,
        }),
        "hover-emphasis": ({ opacityValue }) => ({
          DEFAULT: `rgba(209, 213, 219, ${opacityValue || 1})`,
          dark: `rgba(75, 85, 99, ${opacityValue || 1})`,
        }),
        "accent-hover": ({ opacityValue }) => ({
          DEFAULT: `rgba(79, 70, 229, ${opacityValue || 1})`,
          dark: `rgba(99, 102, 241, ${opacityValue || 1})`,
        }),
      },

      // colors: {
      //   // code styling
      //   "code-bg": "black", // black
      //   "code-text": "#e0e0e0", // light gray
      //   "token-comment": "#608b4e", // green
      //   "token-punctuation": "#d4d4d4", // light gray
      //   "token-property": "#569cd6", // blue
      //   "token-selector": "#e07b53", // more vibrant orange
      //   "token-atrule": "#d18ad8", // more vibrant purple
      //   "token-function": "#f0e68c", // more vibrant light yellow
      //   "token-regex": "#9cdcfe", // light blue
      //   "token-attr-name": "#9cdcfe", // light blue

      //   // background
      //   "background-search": "#ffffff", // white
      //   input: "#f5f5f5",

      //   background: "#fafafa", // 50
      //   "background-100": "#f5f5f5", // neutral-100
      //   "background-125": "#F1F2F4", // gray-125
      //   "background-150": "#EAEAEA", // gray-150
      //   "background-200": "#e5e5e5", // neutral-200
      //   "background-300": "#d4d4d4", // neutral-300
      //   "background-400": "#a3a3a3", // neutral-400
      //   "background-800": "#262626", // neutral-800
      //   "background-900": "#111827", // gray-900
      //   "background-inverted": "#000000", // black

      //   "background-emphasis": "#f6f7f8",
      //   "background-strong": "#eaecef",

      //   // text or icons
      //   "text-50": "#fafafa", // 50, neutral-50
      //   "text-100": "#f5f5f5", // lighter, neutral-100
      //   "text-200": "#e5e5e5", // light, neutral-200
      //   "text-300": "#d4d4d4", // stronger, neutral-300
      //   "text-400": "#a3a3a3", // medium, neutral-400
      //   "text-500": "#737373", // darkMedium, neutral-500
      //   "text-600": "#525252", // dark, neutral-600
      //   "text-700": "#404040", // solid, neutral-700
      //   "text-800": "#262626", // solidDark, neutral-800

      //   subtle: "#6b7280", // gray-500
      //   default: "#4b5563", // gray-600
      //   emphasis: "#374151", // gray-700
      //   strong: "#111827", // gray-900

      //   link: "#3b82f6", // blue-500
      //   "link-hover": "#1d4ed8", // blue-700
      //   inverted: "#ffffff", // white

      //   // one offs
      //   error: "#ef4444", // red-500
      //   success: "#059669", // emerald-600
      //   alert: "#f59e0b", // amber-600
      //   accent: "#6366F1", // indigo-500

      //   // borders
      //   border: "#e5e7eb", // gray-200
      //   "border-light": "#f3f4f6", // gray-100
      //   "border-medium": "#d1d5db", // gray-300
      //   "border-strong": "#9ca3af", // gray-400
      //   "border-dark": "#525252", // neutral-600

      //   // hover
      //   "hover-light": "#f3f4f6", // gray-100
      //   "hover-lightish": "#EAEBEF", // gray-160

      //   hover: "#e5e7eb", // gray-200
      //   "hover-emphasis": "#d1d5db", // gray-300
      //   "accent-hover": "#4F46E5",

      //   // keyword highlighting
      //   highlight: {
      //     text: "#fef9c3", // yellow-100
      //   },

      //   // scrollbar
      //   scrollbar: {
      //     track: "#f9fafb",
      //     thumb: "#e5e7eb",
      //     "thumb-hover": "#d1d5db",

      //     dark: {
      //       thumb: "#989a9c",
      //       "thumb-hover": "#c7cdd2",
      //     },
      //   },

      //   // bubbles in chat for each "user"
      //   user: "#F1F2F4", // near gray-100
      //   ai: "#60a5fa", // blue-400

      //   // for display documents
      //   document: "#f43f5e", // pink-500

      //   // light mode
      //   tremor: {
      //     brand: {
      //       faint: "#eff6ff", // blue-50
      //       muted: "#bfdbfe", // blue-200
      //       subtle: "#60a5fa", // blue-400
      //       DEFAULT: "#3b82f6", // blue-500
      //       emphasis: "#1d4ed8", // blue-700
      //       inverted: "#ffffff", // white
      //     },
      //     background: {
      //       muted: "#f9fafb", // gray-50
      //       subtle: "#f3f4f6", // gray-100
      //       DEFAULT: "#ffffff", // white
      //       emphasis: "#374151", // gray-700
      //     },
      //     border: {
      //       DEFAULT: "#e5e7eb", // gray-200
      //     },
      //     ring: {
      //       DEFAULT: "#e5e7eb", // gray-200
      //     },
      //     content: {
      //       subtle: "#9ca3af", // gray-400
      //       DEFAULT: "#4b5563", // gray-600
      //       emphasis: "#374151", // gray-700
      //       strong: "#111827", // gray-900
      //       inverted: "#ffffff", // white
      //     },
      //   },
      //   // dark mode
      //   "dark-tremor": {
      //     brand: {
      //       faint: "#0B1229", // custom
      //       muted: "#172554", // blue-950
      //       subtle: "#1e40af", // blue-800
      //       DEFAULT: "#3b82f6", // blue-500
      //       emphasis: "#60a5fa", // blue-400
      //       inverted: "#030712", // gray-950
      //     },
      //     background: {
      //       muted: "#131A2B", // custom
      //       subtle: "#1f2937", // gray-800
      //       DEFAULT: "#111827", // gray-900
      //       emphasis: "#d1d5db", // gray-300
      //     },
      //     border: {
      //       DEFAULT: "#1f2937", // gray-800
      //     },
      //     ring: {
      //       DEFAULT: "#1f2937", // gray-800
      //     },
      //     content: {
      //       subtle: "#6b7280", // gray-500
      //       DEFAULT: "#d1d5db", // gray-300
      //       emphasis: "#f3f4f6", // gray-100
      //       strong: "#f9fafb", // gray-50
      //       inverted: "#000000", // black
      //     },
      //   },
      // },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "code-sm": "small",
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      fontWeight: {
        "token-bold": "bold",
      },
      fontStyle: {
        "token-italic": "italic",
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
};
