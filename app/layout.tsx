import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LoopTracer — Automatización para gestorías sin cambiar herramientas',
  description: 'Implementamos en días un asistente IA que busca en tus PDF/Excel, responde con cita y permisos por rol. Ahorra horas sin mover un dedo.',
  openGraph: {
    title: 'LoopTracer — Automatización para gestorías sin cambiar herramientas',
    description: 'Implementamos en días un asistente IA que busca en tus PDF/Excel, responde con cita y permisos por rol. Ahorra horas sin mover un dedo.',
    images: ['/og.jpg'],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LoopTracer — Automatización para gestorías sin cambiar herramientas',
    description: 'Implementamos en días un asistente IA que busca en tus PDF/Excel, responde con cita y permisos por rol. Ahorra horas sin mover un dedo.',
    images: ['/og.jpg'],
  },
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