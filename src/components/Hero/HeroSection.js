'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './HeroSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const marqueeItems = [
  'Moda Circular', 'Peças Únicas', 'Vista com Propósito', 'Brechó Premium',
  'Sustentabilidade', 'Compre Consciente', 'Dê Nova Vida', 'Estilo & Essência',
  'Moda Circular', 'Peças Únicas', 'Vista com Propósito', 'Brechó Premium',
  'Sustentabilidade', 'Compre Consciente', 'Dê Nova Vida', 'Estilo & Essência',
];

const HeroSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const logoRef = useRef(null);
  const highlightWordRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.inOut', delay: 0.3 }
    );

    gsap.fromTo(
      logoRef.current,
      { scale: 0.85, opacity: 0, y: 40 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'elastic.out(1, 0.7)',
        delay: 0.6,
        onComplete: () => {
          gsap.to(logoRef.current, {
            y: 'random(-12, 12)',
            x: 'random(-5, 5)',
            rotation: 'random(-3, 3)',
            duration: 'random(4, 7)',
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        },
      }
    );

    if (titleRef.current) {
      const titleWords = titleRef.current.querySelectorAll('span:not(br)');
      gsap.fromTo(
        titleWords,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7,
          ease: 'power3.out', stagger: 0.1, delay: 1,
        }
      );
    }

    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 1.4 }
      );
    }

    if (buttonsRef.current) {
      gsap.fromTo(
        buttonsRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.15, delay: 1.6 }
      );
    }
  }, []);

  const titleParts = [
    { text: 'Vista', isWord: true },
    { text: 'o', isWord: true },
    { text: 'passado.', isWord: true },
    { text: null, isBreak: true },
    { text: 'Construa', isWord: true },
    { text: 'o', isWord: true },
    { text: null, isBreak: true },
    { text: 'futuro.', isWord: true, isAnimated: true },
  ];

  const titleElements = titleParts.map((part, index) => {
    if (part.isBreak) {
      return <br key={`break-${index}`} className={styles.titleLineBreak} />;
    } else if (part.isAnimated) {
      return (
        <span key={index} ref={highlightWordRef} className={styles.highlightWord}>
          {part.text}
        </span>
      );
    } else {
      return (
        <span key={index} className={styles.titleWord}>
          {part.text}
        </span>
      );
    }
  });

  return (
    <>
      {/* Marquee strip — above the hero */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeContent}>
            {marqueeItems.map((item, i) => (
              <span key={i} className={styles.marqueeText}>
                {item} <span>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section ref={sectionRef} className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroImageContainer}>
            <Image
              ref={logoRef}
              src="/imagens/logo.svg"
              alt="Reveste-se — Moda Circular"
              width={520}
              height={520}
              priority
              className={styles.heroImage}
            />
          </div>

          <div className={styles.heroTextContainer}>
            <p className={styles.heroTagline}>Moda Circular & Brechó Premium</p>
            <h1 ref={titleRef} className={styles.heroTitle}>
              {titleElements}
            </h1>
            <p ref={descriptionRef} className={styles.heroDescription}>
              Peças únicas, curadas com intenção. No Reveste-se cada roupa tem história — e a próxima parte dela é com você. Vista consciência, estilo e propósito.
            </p>
            <div ref={buttonsRef} className={styles.heroButtons}>
              <motion.div
                className={styles.buttonWrapper}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Link href="/catalog" className={styles.primaryButton}>
                  Explorar Peças
                </Link>
              </motion.div>
              <motion.div
                className={styles.buttonWrapper}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Link href="/about" className={styles.secondaryButton}>
                  Nossa História
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
