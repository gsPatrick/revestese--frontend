'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ScrollVideo.module.css';
import { BsVolumeUp, BsVolumeMute } from 'react-icons/bs';

const BASE = 'https://geral-revestese-api.r954jc.easypanel.host/api';
const DEFAULT_SRC = '/videos/brand-scroll.mp4';

export default function ScrollVideo() {
  const videoRef   = useRef(null);
  const sectionRef = useRef(null);
  const [isMuted,   setIsMuted]   = useState(true);
  const [videoSrc,  setVideoSrc]  = useState(DEFAULT_SRC);

  /* Busca a URL do vídeo customizado (configurado pelo admin) */
  useEffect(() => {
    fetch(`${BASE}/configuracoes/loja/publicas`)
      .then(r => r.json())
      .then(cfg => { if (cfg.BRAND_VIDEO_URL) setVideoSrc(cfg.BRAND_VIDEO_URL); })
      .catch(() => {});
  }, []);

  /* Som: ativa ao entrar na seção, muta ao sair, retoma ao voltar */
  useEffect(() => {
    const section = sectionRef.current;
    const video   = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Dentro da seção: toca e ativa som
          video.play().catch(() => {});
          try {
            video.muted = false;
            setIsMuted(false);
          } catch (_) {
            /* browser bloqueou — mantém mudo, botão ainda funciona */
          }
        } else {
          // Fora da seção: muta (não pausa — carregamento continua em background)
          video.muted = true;
          setIsMuted(true);
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

      {/* Wedge de transição hero (claro) → seção (preto) */}
      <div className={styles.topWedge} aria-hidden="true">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 1440,0 1440,64 0,0" fill="var(--reveste-bg, #FAFAF8)" />
        </svg>
      </div>

      <div className={styles.inner}>

        {/* Coluna esquerda: copy */}
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

        {/* Coluna direita: vídeo */}
        <div className={styles.rightCol}>
          <div className={styles.videoFrame}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              className={styles.video}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            />

            {/* Botão mute/unmute sobre o vídeo */}
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
