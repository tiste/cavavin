import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cavavin",
    short_name: "Cavavin",
    start_url: "/",
    background_color: "#7B0323",
    theme_color: "#7B0323",
    display: "minimal-ui",
    icons: [
      {
        src: "/icon.jpg",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
