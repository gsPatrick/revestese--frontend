import AboutHero from '@/components/AboutPage/AboutHero';
import OurMission from '@/components/AboutPage/OurMission';
import ComfortSection from '@/components/AboutPage/ComfortSection';
import FinalCta from '@/components/AboutPage/FinalCta';

export const metadata = {
  title: 'Sobre Nós — Reveste-se | Moda Circular',
  description: 'Conheça a história, os valores e a missão do Reveste-se — o brechó premium de moda circular que acredita que cada peça merece uma nova história.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <OurMission />
      <ComfortSection />
      <FinalCta />
    </main>
  );
}
