'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './SubscriptionSection.module.css';
import { BsCheckCircleFill } from 'react-icons/bs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SubscriptionSection = () => {
  const benefits = [
    'Peças curadas exclusivas todo mês',
    'Acesso antecipado a novidades do acervo',
    'Desconto especial em todas as compras',
    'Entrega para todo o Brasil com frete reduzido',
    'Flexibilidade: pause ou cancele quando quiser',
  ];

  return (
    <motion.section
      className={styles.subscriptionSection}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className={styles.subscriptionContent}>

        <motion.div className={styles.imagePanel} variants={itemVariants}>
          <Image
            src="/imagens/pinte-sonhos.jpg"
            alt="Clube de Assinatura Reveste-se"
            width={400}
            height={400}
            priority
            className={styles.decorativeImage}
          />
        </motion.div>

        <div className={styles.textPanel}>
          <motion.p variants={itemVariants} className={styles.sectionSubheading}>
            Moda circular mensalmente
          </motion.p>
          <motion.h2 variants={itemVariants} className={styles.sectionTitle}>
            Clube de Assinatura <span className={styles.revesteSeTitleWord}>Reveste-se</span>
          </motion.h2>
          <motion.p variants={itemVariants} className={styles.sectionDescription}>
            Receba peças únicas e sustentáveis selecionadas especialmente para o seu estilo. Cada caixa é uma experiência — histórias que você herda e continua. Moda circular, de verdade.
          </motion.p>

          <ul className={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                className={styles.benefitItem}
                variants={itemVariants}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.08 * index }}
                >
                  <BsCheckCircleFill className={styles.benefitIcon} />
                </motion.div>
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div variants={itemVariants} className={styles.buttonWrapper}>
            <Link href="/subscription" className={styles.explorePlansButton}>
              Conhecer os Planos
            </Link>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};

export default SubscriptionSection;
