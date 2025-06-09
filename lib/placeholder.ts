import { Wine } from "@/domain/wine";
import redImage from "@/public/red.png";
import whiteImage from "@/public/white.png";
import roseImage from "@/public/rose.png";
import champagneImage from "@/public/champagne.png";

export function getPlaceholder(w: Wine): string {
  if (w.color === "Champagne") {
    return champagneImage.src;
  }
  if (w.color === "Blanc") {
    return whiteImage.src;
  }
  if (w.color === "Rosé") {
    return roseImage.src;
  }
  return redImage.src;
}
