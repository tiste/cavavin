import { Montserrat, Roboto } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-montserrat",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});
