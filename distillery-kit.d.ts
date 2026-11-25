// distillery app kit types. Copy this file into the app's src/ folder so TypeScript accepts the kit's tags.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type KitElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
export type DistilleryMark = "still" | "wave" | "ease" | "route" | "film" | "align";
export type DistilleryLoopState = "idle" | "working" | "done";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "d-loop": KitElement & { mark?: DistilleryMark; state?: DistilleryLoopState };
      "d-theme-toggle": KitElement;
    }
  }
}

declare global {
  interface Window {
    distillery?: {
      version: string;
      theme: {
        get(): "light" | "dark" | "system";
        set(preference: "light" | "dark" | "system"): void;
        resolved(): "light" | "dark";
      };
    };
  }
}

export {};
