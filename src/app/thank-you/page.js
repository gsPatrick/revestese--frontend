'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/components/ThankYouPage/ThankYouPage.module.css';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { BsCheck2Circle } from 'react-icons/bs';
import Image from 'next/image';
import Link from 'next/link';

// Componente para um confete individual
const ConfettiPiece = React.forwardRef((props, ref) => (
  <div ref={ref} className={styles.confetti} style={{'--color': props.color}}></div>
));
ConfettiPiece.displayName = 'ConfettiPiece';


const ThankYouPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'DDS-1059';

  const cardRef = useRef(null);
  const confettiContainerRef = useRef(null);
  const elementsToAnimateRef = useRef([]);

  // Redirecionamento e Animações
  useEffect(() => {
    // Redirecionamento
    const timer = setTimeout(() => {
      router.push('/my-account/orders');
    }, 8000); // Aumentado para 8s para dar tempo para as animações

    // --- ANIMAÇÕES COM GSAP ---
    const card = cardRef.current;
    const confettiPieces = confettiContainerRef.current.children;

    // Timeline GSAP para orquestrar as animações
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(card, 
      { opacity: 0, scale: 0.7, y: 100 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    )
    .fromTo(elementsToAnimateRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'power2.out' },
      "-=0.5" // Começa um pouco antes da animação do card terminar
    )
    .fromTo(confettiPieces,
      { y: 0, scale: 0, opacity: 0 },
      {
        y: () => "random(-150, 150)",
        x: () => "random(-150, 150)",
        scale: () => "random(0.5, 1.2)",
        opacity: 1,
        rotate: () => "random(-360, 360)",
        duration: 1.5,
        ease: 'power3.out',
        stagger: {
          each: 0.01,
          from: "center"
        }
      },
      "-=1" // Começa durante a animação de entrada do texto
    )
    .to(confettiPieces, {
        opacity: 0,
        duration: 1,
        ease: 'power2.in'
    }, ">-0.5"); // Fade out dos confetes


    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className={styles.mainContainer}>
      {/* Container para os confetes que ficarão atrás do card */}
      <div ref={confettiContainerRef} className={styles.confettiContainer}>
        {Array.from({ length: 100 }).map((_, i) => (
            <ConfettiPiece key={i} color={`hsl(${Math.random() * 360}, 100%, 75%)`} />
        ))}
      </div>

      <div ref={cardRef} className={styles.card}>
        <div ref={el => elementsToAnimateRef.current[0] = el} className={styles.iconWrapper}>
          <BsCheck2Circle className={styles.checkIcon} />
        </div>
        
        <h1 ref={el => elementsToAnimateRef.current[1] = el} className={styles.title}>Pagamento Confirmado!</h1>
        
        <p ref={el => elementsToAnimateRef.current[2] = el} className={styles.subtitle}>
          Obrigada por fazer parte da moda circular! Sua peça especial está a caminho.
        </p>
        
        <div ref={el => elementsToAnimateRef.current[3] = el} className={styles.orderDetails}>
          <p>Seu Pedido Mágico:</p>
          <span>{orderId}</span>
        </div>

        <p ref={el => elementsToAnimateRef.current[4] = el} className={styles.infoText}>
          Enviamos uma coruja-correio (também conhecida como email) com todos os detalhes.
          Enquanto isso, que tal dar uma olhada nos seus pedidos?
        </p>

        <motion.div ref={el => elementsToAnimateRef.current[5] = el}>
            <Link href="/my-account/orders" className={styles.actionButton}>
              Ver Meus Pedidos
            </Link>
        </motion.div>
        
        <div className={styles.redirectInfo}>
          Você será redirecionado em alguns segundos...
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ animation: 'progressAnimation 8s linear forwards' }}></div>
          </div>
        </div>

        <Image src="/imagens/estrela2.svg" alt="" width={80} height={80} className={`${styles.decorativeImage} ${styles.star1}`} />
        <Image src="/imagens/lapisduplo.svg" alt="" width={60} height={60} className={`${styles.decorativeImage} ${styles.pencil1}`} />
      </div>
    </main>
  );
};

export default ThankYouPage;