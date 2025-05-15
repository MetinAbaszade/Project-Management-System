"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useNProgress() {
  const pathname = usePathname();

  useEffect(() => {
    let nprogress: any;

    import("nprogress").then((mod) => {
      nprogress = mod.default;

      nprogress.configure({
        showSpinner: false,
        easing: "ease",
        speed: 300,
        minimum: 0.1,
        trickleSpeed: 200
      });

      nprogress.start();
      const done = () => nprogress.done();

      const timeout = setTimeout(done, 400);

      return () => {
        clearTimeout(timeout);
        done();
      };
    });
  }, [pathname]);
}
