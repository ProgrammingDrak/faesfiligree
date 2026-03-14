"use client";

import { motion } from "framer-motion";

export function WireAnimation() {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 2,
          delay: i * 0.3,
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: { duration: 0.3, delay: i * 0.3 },
      },
    }),
  };

  return (
    <svg
      viewBox="0 0 800 400"
      fill="none"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* Main flowing vine */}
      <motion.path
        d="M-50 200 C100 180, 150 100, 250 120 S400 250, 500 180 S650 80, 750 150 S900 250, 850 200"
        stroke="#B87333"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      />
      {/* Secondary flowing wire */}
      <motion.path
        d="M-30 250 C80 300, 200 200, 300 260 S450 180, 550 240 S700 300, 800 220"
        stroke="#B87333"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      />
      {/* Delicate branch 1 */}
      <motion.path
        d="M250 120 C270 80, 290 60, 280 40"
        stroke="#B87333"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      />
      {/* Delicate branch 2 */}
      <motion.path
        d="M500 180 C520 140, 530 110, 510 90"
        stroke="#B87333"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={2.5}
      />
      {/* Spiral accent */}
      <motion.path
        d="M400 200 C410 190, 420 195, 415 205 S405 215, 410 210"
        stroke="#B87333"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      />
      {/* Small leaf shapes */}
      <motion.path
        d="M280 40 C285 30, 275 25, 270 35 Z"
        stroke="#B87333"
        strokeWidth="0.8"
        fill="#B87333"
        fillOpacity={0.2}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={3.5}
      />
      <motion.path
        d="M510 90 C515 80, 505 75, 500 85 Z"
        stroke="#B87333"
        strokeWidth="0.8"
        fill="#B87333"
        fillOpacity={0.2}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={3.8}
      />
      {/* Bottom flowing wire */}
      <motion.path
        d="M0 350 C150 320, 250 370, 400 340 S600 370, 800 330"
        stroke="#B87333"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
        variants={pathVariants}
        initial="hidden"
        animate="visible"
        custom={1.5}
      />
    </svg>
  );
}
