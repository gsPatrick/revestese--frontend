'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ajuda.module.css';
import { BsChevronDown, BsWhatsapp } from 'react-icons/bs';
import { FaLeaf } from 'react-icons/fa';

const SECTIONS = [
  {
    id: 'como-comprar',
    title: 'Como Comprar',
    icon: '🛍️',
    questions: [
      {
        q: 'Como funciona o processo de compra?',
        a: 'É simples! Navegue pelo catálogo, escolha a peça que deseja, adicione ao carrinho e finalize a compra. Aceitamos cartão de crédito, débito e Pix via MercadoPago.',
      },
      {
        q: 'Preciso criar uma conta para comprar?',
        a: 'Sim, é necessário criar uma conta gratuita para finalizar o pedido. Isso nos permite manter o histórico das suas compras e agilizar futuras aquisições.',
      },
      {
        q: 'As peças são autênticas e verificadas?',
        a: 'Todas as peças passam por curadoria rigorosa antes de entrarem no acervo. Verificamos autenticidade, estado de conservação e higienização de cada item.',
      },
      {
        q: 'Posso reservar uma peça?',
        a: 'No momento não trabalhamos com reservas. O acervo é de quantidade única por peça — quem adicionar ao carrinho e finalizar a compra primeiro garante o item.',
      },
    ],
  },
  {
    id: 'pagamento',
    title: 'Pagamento',
    icon: '💳',
    questions: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Aceitamos cartão de crédito (parcelamento disponível), cartão de débito e Pix. Todos os pagamentos são processados com segurança pelo MercadoPago.',
      },
      {
        q: 'É possível parcelar a compra?',
        a: 'Sim! Oferecemos parcelamento em até 12x no cartão de crédito. As condições e eventuais juros são exibidos no momento do checkout.',
      },
      {
        q: 'O pagamento é seguro?',
        a: 'Sim. Utilizamos o MercadoPago, uma das plataformas de pagamento mais seguras do Brasil. Seus dados financeiros nunca ficam armazenados em nossos servidores.',
      },
      {
        q: 'Tenho um cupom de desconto. Como aplico?',
        a: 'Na etapa de finalização do pedido há um campo para inserção do cupom. Digite o código e o desconto será aplicado automaticamente.',
      },
    ],
  },
  {
    id: 'envio',
    title: 'Envio',
    icon: '📦',
    questions: [
      {
        q: 'Quais são as opções de envio?',
        a: 'Trabalhamos com os principais serviços de entrega (PAC, SEDEX e transportadoras). As opções disponíveis e os prazos são calculados com base no seu CEP durante o checkout.',
      },
      {
        q: 'Qual o prazo de entrega?',
        a: 'O prazo varia conforme a modalidade escolhida e sua localização. Em média, entregas para capitais levam de 3 a 7 dias úteis. Você receberá o código de rastreio por e-mail.',
      },
      {
        q: 'Como rastrear meu pedido?',
        a: 'Após o envio, você receberá um e-mail com o código de rastreamento. Também é possível acompanhar o status diretamente na área "Meus Pedidos" da sua conta.',
      },
      {
        q: 'Enviam para todo o Brasil?',
        a: 'Sim! Realizamos entregas para todo o território nacional.',
      },
    ],
  },
  {
    id: 'trocas',
    title: 'Trocas e Devoluções',
    icon: '🔄',
    questions: [
      {
        q: 'Posso devolver ou trocar uma peça?',
        a: 'Aceitamos devoluções em até 7 dias corridos após o recebimento, conforme o Código de Defesa do Consumidor, desde que a peça esteja nas mesmas condições em que foi enviada.',
      },
      {
        q: 'Como solicitar uma devolução?',
        a: 'Entre em contato com a nossa equipe pelo WhatsApp ou e-mail informando o número do pedido e o motivo da devolução. Orientaremos todo o processo.',
      },
      {
        q: 'A peça chegou diferente do descrito. O que faço?',
        a: 'Pedimos desculpas pelo inconveniente! Entre em contato imediatamente pelo WhatsApp com fotos da peça. Resolveremos com prioridade — devolução ou reembolso total garantido.',
      },
      {
        q: 'O frete da devolução é pago por quem?',
        a: 'Se o motivo for um erro nosso (peça diferente da descrição), arcamos com o frete de devolução. Em outros casos, o frete é de responsabilidade do cliente.',
      },
    ],
  },
  {
    id: 'faq',
    title: 'Perguntas Frequentes',
    icon: '❓',
    questions: [
      {
        q: 'O que é moda circular?',
        a: 'Moda circular é um modelo que prioriza a reutilização de roupas e acessórios, prolongando sua vida útil e reduzindo o impacto ambiental da indústria têxtil. Cada peça que você compra na Reveste-se é um passo contra o desperdício.',
      },
      {
        q: 'As peças são higienizadas?',
        a: 'Sim! Todas as peças passam por higienização antes de serem fotografadas e listadas. Garantimos que cada item chegue limpo e pronto para uso.',
      },
      {
        q: 'Posso vender minhas peças para vocês?',
        a: 'Sim! Temos um programa de consignação. Entre em contato via WhatsApp para saber como funciona e quais peças aceitamos.',
      },
      {
        q: 'Como entrar em contato com vocês?',
        a: 'Pelo WhatsApp, e-mail (contato@reveste-se.com.br) ou pelo formulário na nossa página de Contato. Respondemos em até 24 horas.',
      },
    ],
  },
];

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
      <button className={styles.question} onClick={() => setOpen(v => !v)}>
        <span>{question}</span>
        <BsChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      <div className={styles.answerWrap} style={{ maxHeight: open ? '500px' : '0' }}>
        <p className={styles.answer}>{answer}</p>
      </div>
    </div>
  );
}

export default function AjudaPage() {
  const [activeSection, setActiveSection] = useState('como-comprar');

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}><FaLeaf /> Central de Ajuda</span>
        <h1 className={styles.heroTitle}>Como podemos ajudar?</h1>
        <p className={styles.heroSub}>
          Encontre respostas para as dúvidas mais comuns ou fale direto com a nossa equipe.
        </p>
        <a
          href="https://wa.me/5518998184907?text=Olá! Preciso de ajuda com meu pedido."
          target="_blank" rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <BsWhatsapp /> Falar no WhatsApp
        </a>
      </div>

      <div className={styles.layout}>
        {/* Sidebar nav */}
        <nav className={styles.sidebar}>
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`${styles.sideLink} ${activeSection === s.id ? styles.sideLinkActive : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span>{s.icon}</span> {s.title}
            </a>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>
          {SECTIONS.map(section => (
            <section key={section.id} id={section.id} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>
              <div className={styles.accordion}>
                {section.questions.map((faq, i) => (
                  <AccordionItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>
          ))}

          {/* CTA final */}
          <div className={styles.cta}>
            <h3>Ainda com dúvidas?</h3>
            <p>Nossa equipe está pronta para te ajudar. Resposta em até 24h.</p>
            <div className={styles.ctaBtns}>
              <a href="https://wa.me/5518998184907" target="_blank" rel="noopener noreferrer" className={styles.ctaWhatsapp}>
                <BsWhatsapp /> WhatsApp
              </a>
              <Link href="/contact" className={styles.ctaContact}>Formulário de contato</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
