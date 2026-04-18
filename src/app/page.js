import HeroSection from '@/components/Hero/HeroSection';
import TrackView from '@/components/Analytics/TrackView';
import ScrollVideo from '@/components/ScrollVideo/ScrollVideo';
import TrustBar from '@/components/TrustBar/TrustBar';
import EditorialSection from '@/components/Editorial/EditorialSection';
import MercadoPagoBanner from '@/components/MercadoPagoBanner/MercadoPagoBanner';
import CollectionsSection from '@/components/Collections/CollectionsSection';
import CuradoriaSection from '@/components/Curadoria/CuradoriaSection';
import HowItWorksSection from '@/components/HowItWorks/HowItWorksSection';
import ConsigneSection from '@/components/Consigne/ConsigneSection';

export default function Home() {
  return (
    <main>
      <TrackView tipo="home" />
      <HeroSection />
      <ScrollVideo />
      <TrustBar />
      <EditorialSection />
      <CollectionsSection />
      <CuradoriaSection />
      <HowItWorksSection />
      <MercadoPagoBanner />
      <ConsigneSection />
    </main>
  );
}
