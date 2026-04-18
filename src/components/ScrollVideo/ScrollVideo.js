'use client';

import { useEffect, useRef } from 'react';
import styles from './ScrollVideo.module.css';

/*
  Velocidade constante via LERP
  ─────────────────────────────
  O scroll só atualiza um "alvo" (progressRef).
  Um loop rAF independente aproxima video.currentTime do alvo
  com fator de suavização fixo (LERP_FACTOR).
  Isso significa que qualquer velocidade de scroll resulta
  no vídeo avançando devagar e de forma uniforme.
*/

const SCROLL_MULTIPLIER = 2.5;
const LERP_FACTOR       = 0.012; // quanto mais baixo, mais lento e suave

const lerp = (a, b, t) => a + (b - a) * t;

export default function ScrollVideo() {
  const containerRef  = useRef(null);
  const videoRef      = useRef(null);
  const rafRef        = useRef(null);
  const progressRef   = useRef(0); // alvo atualizado pelo scroll

  useEffect(() => {
    const container = containerRef.current;
    const video     = videoRef.current;
    if (!container || !video) return;

    // Scroll só grava o progresso alvo — sem tocar no vídeo diretamente
    const onScroll = () => {
      const rect            = container.getBoundingClientRect();
      const scrollableRange = container.offsetHeight - window.innerHeight;
      const scrolled        = Math.max(0, -rect.top);
      progressRef.current   = Math.min(1, scrolled / scrollableRange);
    };

    // Loop rAF: anda devagar em direção ao alvo independente do scroll
    const tick = () => {
      if (video.duration) {
        const target = progressRef.current * video.duration;
        const next   = lerp(video.currentTime, target, LERP_FACTOR);
        // Só escreve se a diferença for perceptível (>0.5ms)
        if (Math.abs(next - video.currentTime) > 0.0005) {
          video.currentTime = next;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    video.load();
    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ height: `${SCROLL_MULTIPLIER * 100}vh` }}
    >
      {/* Transition wedge from hero (light) → video (dark) */}
      <div className={styles.topWedge} aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 1440,0 1440,64 0,0" fill="var(--reveste-bg, #FAFAF8)" />
        </svg>
      </div>

      <div className={styles.stickyWrapper}>

        {/* Left column: copy */}
        <div className={styles.leftCol}>
          <div className={styles.copyInner}>
            <span className={styles.eyebrow}>Nossa história em movimento</span>
            <h2 className={styles.headline}>
              Moda que<br />
              <em>recomeça.</em>
            </h2>
            <p className={styles.body}>
              Cada peça tem uma origem. Cada compra tem um impacto. Role para ver o ciclo da moda circular em ação.
            </p>
            <div className={styles.scrollHint}>
              <span className={styles.scrollLine} />
              <span className={styles.scrollLabel}>Role para avançar</span>
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
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
