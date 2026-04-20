'use client';
import React, { useRef, useEffect } from 'react';
import styles from './Timeline.module.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const timelineData = [
  { year: "2021", title: "O Início de Tudo", description: "Uma ideia simples: dar nova vida às peças que o mundo descartaria. O brecho Reveste-se nasce da vontade de transformar a moda em algo mais consciente." },
  { year: "2022", title: "As Primeiras Peças", description: "Com curadoria cuidadosa, as primeiras coleções chegam — cada peça com história, estilo e um novo propósito." },
  { year: "2023", title: "Moda Circular na Prática", description: "Lançamos nosso sistema de consignação, conectando quem quer renovar o guarda-roupa com quem busca peças únicas." },
  { year: "Hoje", title: "Reveste-se", description: "Continuamos crescendo, acreditando que moda sustentável é moda de verdade — uma peça de cada vez." },
];

const Timeline = () => {
  const timelineRef = useRef(null);

  useEffect(() => {
    const items = timelineRef.current.querySelectorAll(`.${styles.timelineItem}`);
    items.forEach(item => {
      gsap.fromTo(item,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    const line = timelineRef.current.querySelector(`.${styles.line}`);
    gsap.fromTo(line,
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: items.length * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: true,
        }
      }
    );
  }, []);

  return (
    <section className={styles.timelineSection}>
      <h2 className={styles.sectionTitle}>A Jornada Começa...</h2>
      <div ref={timelineRef} className={styles.timelineContainer}>
        <div className={styles.line}></div>
        {timelineData.map((item, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <span className={styles.timelineYear}>{item.year}</span>
              <h3 className={styles.timelineTitle}>{item.title}</h3>
              <p className={styles.timelineDescription}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;