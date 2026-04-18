'use client';

import React, { useRef, useEffect } from 'react';
import styles from './ContactPage.module.css';
import gsap from 'gsap';

const ContactHero = () => {
  const titleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      [titleRef.current, textRef.current],
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.2, delay: 0.3 }
    );
  }, []);

  return (
    <div className={styles.heroContainer}>
      <h1 ref={titleRef} className={styles.heroTitle}>
        Fale com o <span className={styles.highlight}>Reveste-se</span>.
      </h1>
      <p ref={textRef} className={styles.heroText}>
        Tem uma dúvida sobre uma peça? Quer saber sobre trocas ou envio? Estamos aqui para te ajudar. Cada mensagem é respondida com cuidado — porque para nós, você não é só um cliente, é parte da nossa comunidade circular.
      </p>
    </div>
  );
};

export default ContactHero;
