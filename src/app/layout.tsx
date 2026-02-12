import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/Components/ClientLayout";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Daily Logger",
  description: "Daily logging and productivity tracking."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">

        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              const theme = "dark";
              if (theme) {
                document.documentElement.classList.add(theme);
              }
            } catch (e) {}
          `}
        </Script>

        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}