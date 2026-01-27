"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6", // blue-500
      light: "#60a5fa",
      dark: "#2563eb",
    },
    secondary: {
      main: "#10b981", // green-500
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#030712", // gray-950
      paper: "#1f2937", // gray-800
    },
    text: {
      primary: "#ffffff",
      secondary: "#9ca3af", // gray-400
    },
    divider: "#374151", // gray-700
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #374151",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#030712",
          borderBottom: "1px solid #1f2937",
        },
      },
    },
  },
});

export default theme;
