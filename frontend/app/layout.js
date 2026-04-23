import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nurse Handover | Clinical Handover Tool",
  description:
    "A digital clinical handover tool for hospital nurses. View patient summaries, track handover notes across shifts, and receive AI-generated SBAR summaries to support safe and efficient patient care transitions.",
  keywords: [
    "nurse handover",
    "clinical handover",
    "patient handover tool",
    "SBAR summary",
    "hospital nursing tool",
    "shift handover",
    "electronic handover",
    "patient safety",
    "nursing documentation",
    "AI clinical summary",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
