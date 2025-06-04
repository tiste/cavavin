import type { Metadata, Viewport } from "next";
import "@/stylesheets/main.scss";
import { montserrat, roboto } from "@/app/fonts";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Cavavin",
  description: "",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="dark"
      className={`${montserrat.variable} ${roboto.variable}`}
    >
      <body>
        <Nav />
        <section className="section">{children}</section>
      </body>
    </html>
  );
}
