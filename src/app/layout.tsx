import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/state/AppStateProvider";
import ConnectivityIndicator from "@/components/ConnectivityIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chekku",
  description: "Get compliant. Get jobs. Get paid.",
  appleWebApp: {
    capable: true,
    title: "Chekku",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen">
        <AppStateProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background relative">
            <ConnectivityIndicator />
            {children}
          </div>
        </AppStateProvider>
      </body>
    </html>
  );
}
