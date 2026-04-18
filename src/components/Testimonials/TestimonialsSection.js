'use client';

import React, { useRef } from 'react'; 
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './TestimonialsSection.module.css';
import { BsQuote, BsFillPlayCircleFill, BsPauseCircleFill } from 'react-icons/bs';

const testimonialsData = [
  {
    name: "Juliana R. & Filho",
    location: "São Paulo, SP",
    testimonial: "Encontrei um blazer incrível que estava procurando há meses. Chegou impecável, melhor do que esperava. O processo foi super simples e seguro!",
    imagePath: "/imagens/depoimento1.jpg",
    bookImagePath: "/imagens/livro-infantil.png",
    audioPath: "/audios/juliana_depoimento.mp3",
    bgColorVar: 'var(--reveste-bg-alt)',
    borderColorVar: 'var(--reveste-border)'
  },
  {
    name: "Carlos M.",
    location: "Belo Horizonte, MG",
    testimonial: "Comprei um casaco vintage que se tornou minha peça favorita. A curadoria é excelente — tudo verificado e bem descrito. Voltarei com certeza!",
    imagePath: "/imagens/depoimento2.jpg",
    bookImagePath: "/imagens/livro-adulto.png",
    audioPath: "/audios/carlos_depoimento.mp3",
    bgColorVar: 'var(--reveste-bg-surface)',
    borderColorVar: 'var(--reveste-border-strong)'
  },
  {
    name: "Ana P. & Família",
    location: "Curitiba, PR",
    testimonial: "Adoro a proposta do Reveste-se. Comprar aqui é consumir com consciência. As peças são únicas e a entrega foi super rápida. Recomendo a todas!",
    imagePath: "/imagens/depoimento3.jpg",
    bookImagePath: "/imagens/livro-familia.png",
    audioPath: "/audios/ana_depoimento.mp3",
    bgColorVar: 'var(--reveste-bg-muted)',
    borderColorVar: 'var(--reveste-border)'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const TestimonialsSection = () => {
  const audioRefs = useRef([]);
  const [isPlaying, setIsPlaying] = React.useState({});

  const toggleAudio = (index, audioPath) => {
    if (!audioRefs.current[index]) return;

    if (isPlaying[index]) {
      audioRefs.current[index].pause();
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    } else {
      Object.keys(isPlaying).forEach(key => {
        if (isPlaying[key] && audioRefs.current[parseInt(key)] && parseInt(key) !== index) {
          audioRefs.current[parseInt(key)].pause();
          setIsPlaying(prev => ({ ...prev, [key]: false }));
        }
      });
      
      audioRefs.current[index].play()
        .then(() => setIsPlaying(prev => ({ ...prev, [index]: true })))
        .catch(error => console.error("Erro ao tocar áudio:", error));
    }
  };

  React.useEffect(() => {
    const initialPlayingState = {};
    testimonialsData.forEach((_, index) => { initialPlayingState[index] = false; });
    setIsPlaying(initialPlayingState);
  }, []);

  return (
    <section className={styles.testimonialsSection}>
      <motion.h2
        className={styles.sectionTitle}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        O que nossos sonhadores dizem
      </motion.h2>
      <motion.div
        className={styles.testimonialsGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {testimonialsData.map((item, index) => (
          <motion.div
            key={index}
            className={styles.testimonialCard}
            variants={itemVariants}
            style={{ backgroundColor: item.bgColorVar }}
            whileHover={{ y: -10, rotate: -2, boxShadow: "0 20px 30px rgba(0,0,0,0.12)" }}
          >
            <div className={styles.cardContent}>
              <div className={styles.authorAndBook}>
                <div className={styles.authorInfo}>
                  <Image
                    src={item.imagePath}
                    alt={`Foto de ${item.name}`}
                    // --- ALTERADO: Tamanho da foto do autor ---
                    width={120} 
                    height={120}
                    className={styles.authorImage}
                    style={{ borderColor: item.borderColorVar }}
                  />
                  <div className={styles.authorText}>
                    <span className={styles.authorName}>{item.name}</span>
                    <span className={styles.authorLocation}>{item.location}</span>
                  </div>
                </div>
                <div className={styles.bookDisplay}>
                   <p className={styles.bookLabel}>Compartilhando sobre:</p>
                   <Image
                     src={item.bookImagePath}
                     alt={`Livro ${item.name}`}
                     // --- ALTERADO: Tamanho da imagem do livro ---
                     width={120} 
                     height={150}
                     className={styles.bookImage}
                     unoptimized={item.bookImagePath.includes('placehold.co')} 
                   />
                </div>
              </div>
              
              <p className={styles.testimonialText}>“{item.testimonial}”</p>

              <div className={styles.audioPlayer}>
                <audio ref={el => audioRefs.current[index] = el} src={item.audioPath} preload="metadata"></audio>
                <button 
                  onClick={() => toggleAudio(index, item.audioPath)}
                  className={styles.playPauseButton}
                  aria-label={isPlaying[index] ? "Pausar áudio" : "Ouvir depoimento"}
                >
                  {isPlaying[index] ? <BsPauseCircleFill /> : <BsFillPlayCircleFill />}
                </button>
                <span className={styles.audioLabel}>{isPlaying[index] ? "Pausar" : "Ouvir depoimento"}</span>
              </div>
            </div>
            
            <BsQuote className={styles.quoteIcon} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;