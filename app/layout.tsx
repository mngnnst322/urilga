import type { Metadata, Viewport } from "next";
import { Comfortaa, Nunito } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Танд урилга иржээ 💌",
  description: "Дугтуйг нээгээд хариугаа өгөөрэй.",
  openGraph: {
    title: "Танд нууц урилга иржээ 💌",
    description: "Дугтуйг нээгээд хариугаа өгөөрэй.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${comfortaa.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
