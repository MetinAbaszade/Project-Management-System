
import { useEffect, useRef, useState } from "react";

export function useScrollShadow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      setShowTop(el.scrollTop > 4);
      setShowBottom(el.scrollHeight - el.scrollTop > el.clientHeight + 4);
    };

    handleScroll(); // check on mount
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, showTop, showBottom };
}
