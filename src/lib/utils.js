import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import animationData from "@assets/lottie-json.json";


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
 
export const colors = [
  "bg-[#712c4a57] text-[#ffe0fe] border-[1px] border-[ #ff205faa]",
 "bg-[#ffe6ea2a] text-[#ffe6ea] border-[1px] border-[#ffe62a2b]",
  "bg-[#26a602a] text-[#2646a0] border-[1px] border-[ #ffe62a2b]",
  "bg-[#4cc9f02a] text-[#4cc9f0] border-[1px] border-[#4cc9f02b]",
];

export const getColor = (color) => {
  if( color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0]; 
};


export const animationDefaultOptions = {
  loop: true,
  autoPlay: true,
  animationData
}