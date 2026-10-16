import { StaticImageData } from "next/image";

export interface DemoScreen {
  id: string;
  label: string;
  images: {
    light: StaticImageData;
    dark: StaticImageData;
  };
}