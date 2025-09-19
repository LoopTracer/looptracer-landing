import './globals.css'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'LoopTracer - Automatización Empresarial e Integración de Sistemas | Software a Medida',
  description: 'Conectamos tus herramientas, implementamos IA en procesos y desarrollamos software personalizado. Automatización sin cambiar tu forma de trabajo. Multiplica tu productividad.',
  keywords: 'automatización empresarial, integración sistemas, software a medida, desarrollo saas, inteligencia artificial empresas, conectar herramientas, automatización procesos, software personalizado',
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'LoopTracer - Automatización e Integración de Sistemas para Empresas',
    description: '⚡ Conectamos todas tus herramientas en un ecosistema unificado. Implementamos IA y desarrollamos software a medida. Sin cambiar tu forma de trabajo.',
    images: ['/logo.png'],
    locale: 'es_ES',
    type: 'website',
    siteName: 'LoopTracer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoopTracer - Automatización Empresarial y Software a Medida',
    description: '🔧 Integramos herramientas, implementamos IA y creamos software personalizado. Automatiza sin cambiar procesos. Multiplica productividad.',
    images: ['/logo.png'],
    creator: '@LoopTracer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}