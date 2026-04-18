'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFilter } from '@/context/FilterContext';
import api from '@/services/api';
import styles from './Footer.module.css';
import { FaInstagram, FaFacebookF, FaTiktok, FaEnvelope, FaLeaf, FaPhoneAlt } from 'react-icons/fa';
import { BsShieldLockFill, BsArrowRepeat, BsHandbag } from 'react-icons/bs';

const Footer = () => {
  const { setCategoryAndNavigate } = useFilter();
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    api.get('/categorias')
      .then(r => setCategorias((r.data || []).filter(c => c.ativo !== false).slice(0, 6)))
      .catch(() => setCategorias([]));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <motion.footer
      className={styles.footerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }, hidden: { opacity: 0, y: 50 } }}
    >
      <div className={styles.wavySeparator}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className={styles.wavyFill} />
        </svg>
      </div>

      <motion.div className={styles.footerContent} variants={containerVariants}>

        <motion.div className={styles.footerColumn} variants={itemVariants}>
          <Link href="/" className={styles.footerLogoLink}>
            <span className={styles.footerLogoText}>Reveste-se</span>
          </Link>
          <p className={styles.footerDescription}>
            Moda circular curada com amor. Damos nova vida a peças únicas e autênticas, unindo estilo, sustentabilidade e consciência. Vista o passado. Construa o futuro.
          </p>
          <div className={styles.socialIcons}>
            <motion.a href="https://www.tiktok.com/@reveste.se" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1, y: -3 }} aria-label="TikTok"><FaTiktok /></motion.a>
            <motion.a href="https://www.facebook.com/revestese" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1, y: -3 }} aria-label="Facebook"><FaFacebookF /></motion.a>
            <motion.a href="https://www.instagram.com/reveste.se" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1, y: -3 }} aria-label="Instagram"><FaInstagram /></motion.a>
          </div>
        </motion.div>

        <motion.div className={styles.footerColumn} variants={itemVariants}>
          <h3 className={styles.footerTitle}>Navegação</h3>
          <ul className={styles.footerList}>
            <li><Link href="/" className={styles.footerLink}>Home</Link></li>
            <li><Link href="/catalog" className={styles.footerLink}>Catálogo</Link></li>
            <li><Link href="/subscription" className={styles.footerLink}>Assinatura</Link></li>
            <li><Link href="/about" className={styles.footerLink}>Sobre Nós</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Contato</Link></li>
          </ul>
        </motion.div>

        <motion.div className={styles.footerColumn} variants={itemVariants}>
          <h3 className={styles.footerTitle}>Categorias</h3>
          <ul className={styles.footerList}>
            {categorias.length > 0 ? (
              categorias.map(c => (
                <li key={c.id}>
                  <Link
                    href="/catalog"
                    className={styles.footerLink}
                    onClick={() => setCategoryAndNavigate(String(c.id))}
                  >
                    {c.nome}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link href="/catalog" className={styles.footerLink}>Ver acervo completo</Link>
              </li>
            )}
          </ul>
        </motion.div>

        <motion.div className={styles.footerColumn} variants={itemVariants}>
          <h3 className={styles.footerTitle}>Ajuda</h3>
          <ul className={styles.footerList}>
            <li><Link href="/how-to-buy" className={styles.footerLink}>Como Comprar</Link></li>
            <li><Link href="/payment" className={styles.footerLink}>Pagamento</Link></li>
            <li><Link href="/shipping" className={styles.footerLink}>Envio</Link></li>
            <li><Link href="/returns" className={styles.footerLink}>Trocas e Devoluções</Link></li>
            <li><Link href="/faq" className={styles.footerLink}>FAQ</Link></li>
          </ul>
          <h3 className={`${styles.footerTitle} ${styles.marginTop}`}>Contato</h3>
          <ul className={styles.footerList}>
            <li className={styles.contactItem}><FaPhoneAlt /><span>(11) 95472-8628</span></li>
            <li className={styles.contactItem}><FaEnvelope /><span>contato@reveste-se.com.br</span></li>
          </ul>
        </motion.div>

      </motion.div>

      <div className={styles.footerSecurity}>
        <div className={styles.securityItem}><BsShieldLockFill /><span>Compra segura com MercadoPago</span></div>
        <div className={styles.securityItem}><FaLeaf /><span>Moda circular certificada</span></div>
        <div className={styles.securityItem}><BsArrowRepeat /><span>Troca fácil & devolução garantida</span></div>
        <div className={styles.securityItem}><BsHandbag /><span>Peças autênticas verificadas</span></div>
      </div>

      <div className={styles.footerBottomBar}>
        <span>© {new Date().getFullYear()} Reveste-se. Todos os direitos reservados.</span>
        <span className={styles.developerCredit}>
          Desenvolvido por <a href="https://codebypatrick.dev" target="_blank" rel="noopener noreferrer">Patrick.Developer</a>
        </span>
      </div>
    </motion.footer>
  );
};

export default Footer;
