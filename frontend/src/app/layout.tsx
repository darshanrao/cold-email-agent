import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ColdReach - AI-Powered Cold Emails",
  description: "Generate highly personalized cold emails for founders and hiring managers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
