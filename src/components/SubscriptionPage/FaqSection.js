'use client'; // <-- ESSENCIAL: Marca este componente como um Client Component

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FaqSection.module.css';
import { HiChevronDown } from 'react-icons/hi';

const faqData = [
  {
    question: "Como funciona o Clube de Assinatura?",
    answer: "Todo mês, nossa equipe de curadores seleciona os melhores livros e materiais de arte baseados na faixa etária do plano escolhido. Você recebe uma caixa surpresa em sua casa, cheia de criatividade!"
  },
  {
    question: "Posso escolher os livros que vou receber?",
    answer: "A magia do clube está na surpresa! Os livros são selecionados por nossa equipe para garantir uma nova e excitante descoberta a cada mês. No entanto, o plano Premium permite algumas preferências."
  },
  {
    question: "Como funciona o cancelamento?",
    answer: "Você pode cancelar sua assinatura a qualquer momento, sem taxas ou burocracia. O cancelamento pode ser feito diretamente na sua área de 'Minha Conta' em nosso site."
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "Aceitamos os principais cartões de crédito (Visa, MasterCard, American Express) e Pix. O pagamento é recorrente, cobrado automaticamente todo mês ou ano, dependendo do seu plano."
  }
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className={styles.accordionItem}>
      <motion.button
        className={styles.accordionHeader}
        onClick={onClick}
        whileHover={{ backgroundColor: 'var(--reveste-bg-muted)' }}
      >
        <span className={styles.questionText}>{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiChevronDown className={styles.chevronIcon} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.accordionContent}
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Perguntas Frequentes</h2>
      <div className={styles.accordionContainer}>
        {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default FaqSection;