'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import CouponPopup from '@/components/CouponPopup/CouponPopup';
import WhatsAppCta from '@/components/WhatsAppCta/WhatsAppCta';
import FreteGratisBanner from '@/components/FreteGratisBanner/FreteGratisBanner';

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <FreteGratisBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <CouponPopup />
      <WhatsAppCta />
    </>
  );
}
