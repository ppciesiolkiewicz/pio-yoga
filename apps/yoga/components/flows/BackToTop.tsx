"use client";

import { useEffect, useState } from "react";

/** Floating "Top" button, shown once the reader has scrolled past the hero. */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a className="fl-totop" href="#top" data-show={show} aria-hidden={!show} tabIndex={show ? 0 : -1}>
      ↑ Top
    </a>
  );
}
