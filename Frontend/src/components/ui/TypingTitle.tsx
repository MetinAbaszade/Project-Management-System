"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

export function TypingTitle() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-3xl font-bold tracking-tight text-center sm:text-4xl"
    >
      <Typewriter
        words={[
          "Welcome to TaskUp",
          "Beautiful work, managed carefully."
        ]}
        loop
        cursor
        cursorStyle="|"
        typeSpeed={50}
        deleteSpeed={30}
        delaySpeed={2000}
      />
    </motion.h1>
  );
}
