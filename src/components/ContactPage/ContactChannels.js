'use client';

import React from 'react';
import styles from './ContactPage.module.css';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { BsEnvelopeHeart } from 'react-icons/bs';

const channels = [
  {
    icon: <FaWhatsapp />,
    title: 'WhatsApp',
    description: 'Atendimento rápido para dúvidas sobre peças, trocas e envios. Respondemos em minutos.',
    href: 'https://wa.me/5518998184907?text=Ol%C3%A1%21+Tenho+uma+d%C3%BAvida+sobre+o+Reveste-se.',
    bgColor: 'var(--reveste-bg-surface)',
    iconColor: '#25D366'
  },
  {
    icon: <BsEnvelopeHeart />,
    title: 'E-mail',
    description: 'Para assuntos mais detalhados — parcerias, consignação e atendimento pós-venda.',
    href: 'mailto:contato@reveste-se.com.br',
    bgColor: 'var(--reveste-bg-surface)',
    iconColor: 'var(--reveste-crimson)'
  },
  {
    icon: <FaInstagram />,
    title: 'Instagram',
    description: 'Acompanhe as novas chegadas, bastidores da curadoria e o universo do Reveste-se.',
    href: 'https://www.instagram.com/revestesemoda?igsh=OHBwaDltdmxqd2xw&utm_source=qr',
    bgColor: 'var(--reveste-bg-surface)',
    iconColor: 'var(--reveste-gold-dark)'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const ContactChannels = () => {
  return (
    <motion.div
      className={styles.channelsContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {channels.map((channel, index) => (
        <motion.a
          key={index}
          href={channel.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.channelCard}
          variants={itemVariants}
          whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.12)" }}
          style={{ backgroundColor: channel.bgColor }}
        >
          <div className={styles.channelIcon} style={{ color: channel.iconColor }}>
            {channel.icon}
          </div>
          <h3 className={styles.channelTitle}>{channel.title}</h3>
          <p className={styles.channelDescription}>{channel.description}</p>
          <div className={styles.channelLink}>
            Entrar em contato →
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
};

export default ContactChannels;