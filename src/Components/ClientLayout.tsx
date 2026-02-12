"use client";

import { Toaster } from "react-hot-toast";
import Navbar from "@/Components/Navbar";
import { getThemeColors, useThemeStore } from "@/Store/themeStore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);


  return (
    <div
      style={{
        backgroundColor: colors.colors.bg.primary,
        color: colors.colors.text.primary
      }}
      className="select-none transition-colors duration-300 min-h-screen"
    >
      <Navbar />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: colors.colors.bg.card,
            color: colors.colors.text.primary,
            border: `1px solid ${colors.colors.border.primary}`,
          },
          success: {
            iconTheme: {
              primary: colors.colors.status.success,
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: colors.colors.status.error,
              secondary: 'white',
            },
          }
        }}
      />
      {children}
    </div>
  );
}