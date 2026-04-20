'use client';

import styles from './ScrollVideo.module.css';

export default function ScrollVideo() {
  return (
    <section className={styles.container}>

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

        {/* Right column: video — autoplay, loop, muted */}
        <div className={styles.rightCol}>
          <div className={styles.videoFrame}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              className={styles.video}
              src="/videos/brand-scroll.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
