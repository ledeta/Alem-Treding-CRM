import './globals.css';
import '../styles/mobile.css';
import { Providers } from '@/components/Providers';
import AdminBottomNav from '@/components/AdminBottomNav';

export const metadata = {
  title: 'ALEM TRADING',
  description: 'Enterprise Customer Relationship Management Platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ width: '100%', height: '100%', margin: 0, padding: 0, overscrollBehavior: 'none' }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0,
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <Providers>
          {children}
        </Providers>
        {/* Global Bottom Navigation for Admin */}
        <AdminBottomNav />
      </body>
    </html>
  );
}
