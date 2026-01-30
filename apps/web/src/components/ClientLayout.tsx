"use client";

import MuiProvider from "./MuiProvider";
import Navbar from "./Navbar";
import Box from "@mui/material/Box";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <MuiProvider>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1, pt: 8 }}>
          {children}
        </Box>
      </Box>
    </MuiProvider>
  );
}
