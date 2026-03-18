import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070A1A",
        panel: "var(--panel)",
        neonCyan: "#27F4F1",
        neonBlue: "#3F7DFF",
        neonGreen: "#7CFF7C",
        neonRose: "#FF5B9E"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(39, 244, 241, 0.4), 0 12px 28px rgba(39, 244, 241, 0.25)",
        glass: "0 20px 40px rgba(2, 8, 23, 0.6)"
      },
      backdropBlur: {
        xl: "20px"
      },
      backgroundImage: {
        aura:
          "radial-gradient(circle at 15% 20%, rgba(63,125,255,0.35) 0%, rgba(7,10,26,0.3) 35%, transparent 70%), radial-gradient(circle at 80% 10%, rgba(39,244,241,0.35) 0%, rgba(7,10,26,0.2) 40%, transparent 75%), radial-gradient(circle at 50% 90%, rgba(255,91,158,0.25) 0%, rgba(7,10,26,0.2) 45%, transparent 80%)"
      },
      animation: {
        "gradient-shift": "gradientShift 10s ease infinite",
        float: "float 6s ease-in-out infinite"
      },
      keyframes: {
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
