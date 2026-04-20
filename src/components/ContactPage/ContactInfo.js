'use client';

import React from 'react';
import styles from './ContactPage.module.css';
import { motion } from 'framer-motion';
import { BsEnvelope, BsPhone, BsPinMap, BsTiktok } from 'react-icons/bs';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';

const contactMethods = [
  { icon: <BsEnvelope />, title: 'E-mail', content: 'contato@reveste-se.com.br', href: 'mailto:contato@reveste-se.com.br' },
  { icon: <BsPhone />, title: 'WhatsApp', content: '(18) 99818-4907', href: 'tel:+5518998184907' },
  { icon: <BsPinMap />, title: 'Localização', content: 'Presidente Epitácio — SP', href: '#' },
];

const socialLinks = [
  { icon: <FaInstagram />, label: 'Instagram', href: 'https://www.instagram.com/reveste.se' },
  { icon: <FaFacebookF />, label: 'Facebook', href: 'https://www.facebook.com/revestese' },
  { icon: <BsTiktok />, label: 'TikTok', href: 'https://www.tiktok.com/@reveste.se' },
];

const ContactInfo = () => {
  return (
    <div className={styles.infoContainer}>
      <h3>Onde nos encontrar</h3>
      <div className={styles.infoCardsWrapper}>
        {contactMethods.map((method, index) => (
          <motion.a
            key={index}
            href={method.href}
            className={styles.infoCard}
            whileHover={{ y: -4 }}
          >
            <div className={styles.infoIcon}>{method.icon}</div>
            <div className={styles.infoText}>
              <h4>{method.title}</h4>
              <p>{method.content}</p>
            </div>
          </motion.a>
        ))}
      </div>
      <div className={styles.socialsWrapper}>
        <h4>Siga o movimento</h4>
        <div className={styles.socialIcons}>
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -3 }}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
