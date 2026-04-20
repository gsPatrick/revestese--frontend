'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ScrollVideo.module.css';
import { BsVolumeUp, BsVolumeMute } from 'react-icons/bs';

export default function ScrollVideo() {
  const videoRef    = useRef(null);
  const sectionRef  = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  /* Quando a seção entra no viewport, tenta ativar o som.
     Browsers permitem unmute após interação do usuário (scroll já conta). */
  useEffect(() => {
    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /* Garante que o vídeo está tocando */
          video.play().catch(() => {});

          /* Tenta ativar o som — alguns browsers bloqueiam sem interação prévia */
          try {
            video.muted = false;
            setIsMuted(false);
          } catch (_) {
            /* Se falhar, continua mudo — usuário pode clicar no botão */
          }

          /* Para de observar após a primeira vez */
          observer.unobserve(section);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    video.muted = next;
    setIsMuted(next);
  };

  return (
    <section ref={sectionRef} className={styles.container}>

      {/* Transition wedge from hero (light) → video (dark) */}
      <div className={styles.topWedge} aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 1440,0 1440,64 0,0" fill="var(--reveste-bg, #FAFAF8)" />
        </svg>
      </div>

      <div className={styles.inner}>

        {/* Left column: copy */}
        <div className={styles.leftCol}>
          <div className={styles.copyInner}>
            <span className={styles.eyebrow}>Nossa história em movimento</span>
            <h2 className={styles.headline}>
              Moda que<br />
              <em>recomeça.</em>
            </h2>
            <p className={styles.body}>
              Cada peça tem uma origem. Cada compra tem um impacto. Conheça o ciclo da moda circular em ação.
            </p>
            <div className={styles.scrollHint}>
              <span className={styles.scrollLine} />
              <span className={styles.scrollLabel}>Assista ao vivo</span>
            </div>
          </div>
        </div>

        {/* Right column: video */}
        <div className={styles.rightCol}>
          <div className={styles.videoFrame}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              className={styles.video}
              src="/videos/brand-scroll.mp4"
              autoPlay
              loop
              muted          /* começa mudo para autoplay funcionar em todos os browsers */
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            />

            {/* Botão de som — fica sobre o vídeo */}
            <button
              className={`${styles.soundBtn} ${!isMuted ? styles.soundBtnActive : ''}`}
              onClick={toggleMute}
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
              title={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? <BsVolumeMute /> : <BsVolumeUp />}
              <span>{isMuted ? 'Sem som' : 'Com som'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
