import type { Metadata } from "next";
import "@/stylesheets/main.scss";
import { montserrat, roboto } from "@/app/fonts";

export const metadata: Metadata = {
  title: "Cavavin",
  description: "",
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
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
