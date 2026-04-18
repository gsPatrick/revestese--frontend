import Script from 'next/script';
import { Cormorant_Garamond, Raleway } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FilterProvider } from '@/context/FilterContext';
import SiteShell from '@/components/SiteShell/SiteShell';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-next',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway-next',
  display: 'swap',
});

export const metadata = {
  title: 'Reveste-se — Moda Circular | Brechó Premium',
  description: 'Dê nova vida ao seu guarda-roupa com peças únicas e sustentáveis. Reveste-se é moda circular de verdade — curada, autêntica e consciente.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      style={{
        '--font-cormorant-next': cormorant.style.fontFamily,
        '--font-raleway-next': raleway.style.fontFamily,
      }}
    >
      <head>
        <Script id="meta-pixel-reveste" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1469352720999754');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${cormorant.variable} ${raleway.variable}`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1469352720999754&ev=PageView&noscript=1"
          />
        </noscript>

        <AuthProvider>
          <CartProvider>
            <FilterProvider>
              <SiteShell>{children}</SiteShell>
            </FilterProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
