'use client';

import React, { useRef, useEffect } from 'react';
import styles from './OpeningStatement.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const OpeningStatement = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    const words = textRef.current.querySelectorAll('span.word');
    gsap.fromTo(words,
      { y: 80, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8,
        ease: 'back.out(1.4)', stagger: 0.1, delay: 0.3,
      }
    );

    gsap.fromTo(brandRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1, scale: 1, duration: 1.2,
        ease: 'elastic.out(1, 0.75)', delay: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className={styles.statementSection}>
      <h1 ref={textRef} className={styles.statementText}>
        <span className="word">Toda</span>{' '}
        <span className={`${styles.highlight} word`}>peça</span>{' '}
        <span className="word">carrega</span>{' '}
        <span className="word">uma</span>{' '}
        <span className="word">nova</span>{' '}
        <span className={`${styles.highlight} word`}>história</span>.
      </h1>
      <h2 ref={brandRef} className={styles.brandName}>
        Reveste-se
      </h2>
    </section>
  );
};

export default OpeningStatement;
