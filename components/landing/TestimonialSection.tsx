'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {useTheme} from 'next-themes';

const testimonials = [
  {
    quote: "We were brand new to selling on Amazon and launched our listings with zero reviews, which was honestly the hardest part. We've been using MyLeadKart for just over three months now and it's helped us build reviews steadily from the start.",
    author: "Leanne",
    role: "USA Amazon Seller"
  },
  {
    quote: "After around six months with MyLeadKart, our listings are in a completely different place. We've more than tripled our reviews and sales have followed. What's stood out most is the increase in organic traffic.",
    author: "Emma",
    role: "USA Amazon Seller"
  },
  {
    quote: "During my trial I had a couple of questions about timing and setup, so I reached out to support. The response was quick, clear, and genuinely helpful, not just a generic reply. That level of support gave me confidence.",
    author: "Conner",
    role: "UK Amazon Seller"
  },
  {
    quote: "I was sceptical at first because I have used other platforms that promised results but did very little. MyLeadKart has been completely different. My review count increased faster in the first six weeks than it had in the previous three months.",
    author: "Alex",
    role: "USA Amazon Seller"
  },
  {
    quote: "We started using MyLeadKart about two months ago and the difference is unreal. Reviews used to trickle in, now they're coming through daily. It's so simple, once it's set up, it just runs on its own.",
    author: "Mark R",
    role: "UK Amazon Seller"
  },
  {
    quote: "I've been selling on Amazon for a couple of years and getting reviews was always hit or miss. After using MyLeadKart for about six weeks, I started noticing reviews coming in regularly without me having to do anything.",
    author: "Mo",
    role: "European Amazon Seller"
  }
];

export default function TestimonialSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const leftTextX = useTransform(scrollYProgress, [0, 0.3], ['0%', '-300%']);
  const rightTextX = useTransform(scrollYProgress, [0, 0.3], ['0%', '300%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]);

  // Adjust scroll distance based on number of cards. 
  // '100vw' starts it just off the right edge.
  // '-100%' ends it exactly when the last card leaves the left edge.
  const cardsX = useTransform(scrollYProgress, [0.05, 1], ['100vw', '-100%']); 

  return (
    <section ref={containerRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <p className="text-lg font-mono text-foreground mb-6 uppercase tracking-widest flex items-center gap-2">
            Customer Testimonials
          </p>
          <motion.h2 
            style={{ opacity: textOpacity }}
            className="text-6xl md:text-8xl lg:text-9xl font-semibold text-sky-700 flex gap-4 md:gap-8 tracking-tight"
          >
            <motion.span style={{ x: leftTextX }}>Happy</motion.span>
            <motion.span style={{ x: rightTextX }}>Sellers</motion.span>
          </motion.h2>
        </div>

        {/* Cards Container */}
        <motion.div 
          style={{ x: cardsX }}
          className="absolute flex gap-6 md:gap-8 top-1/2 -translate-y-1/2 z-20 items-center pl-8 md:pl-[20vw] pr-[50vw]"
        >
          {testimonials.map((testimonial, i) => (
            <div 
              key={i} 
              className={`w-[320px] md:w-[420px] shrink-0 bg-sky-600 p-8 md:p-10 rounded-3xl text-foreground shadow-2xl shadow-sky-900/10 ${
                i % 2 === 0 ? '-translate-y-6 md:-translate-y-12' : 'translate-y-6 md:translate-y-12'
              }`}
            >
              <p className="text-lg md:text-xl font-medium leading-relaxed mb-10">
                &quot;{testimonial.quote}&quot;
              </p>
              <p className="text-sm font-mono font-medium opacity-90">
                * {testimonial.author} - {testimonial.role}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
