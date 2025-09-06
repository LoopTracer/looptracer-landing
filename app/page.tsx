'use client';

import { useState, useEffect } from 'react';

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface CaseStudy {
  id: string;
  title: string;
  images: string[];
  description: string;
  isBest?: boolean;
}

export default function Home() {
  const [utms, setUtms] = useState<UTMParams>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const caseStudies: CaseStudy[] = [
    {
      id: 'gestoria',
      title: 'GestorIA',
      images: [
        '/case-gestoria-1.jpg',
        '/case-gestoria-2.jpg',
        '/case-gestoria-3.jpg',
        '/case-gestoria-4.jpg'
      ],
      description: 'Asistente de IA que revoluciona la gestión documental y consultas en gestorías. Responde dudas de clientes y empleados citando documentos específicos.',
      isBest: true
    },
    {
      id: 'documentos',
      title: 'Gestión Doc y Firma Automática',
      images: [
        '/case-docs-1.jpg',
        '/case-docs-2.jpg',
        '/case-docs-3.jpg'
      ],
      description: 'Sistema automatizado de gestión documental con firma electrónica integrada. Reduce el tiempo de procesamiento en un 80%.'
    },
    {
      id: 'ventas',
      title: 'Punto de Ventas',
      images: [
        '/case-ventas-1.jpg',
        '/case-ventas-2.jpg',
        '/case-ventas-3.jpg',
        '/case-ventas-4.jpg',
        '/case-ventas-5.jpg'
      ],
      description: 'Terminal de punto de venta integrado con gestión de inventario, facturación automática y analytics en tiempo real.'
    }
  ];

  const faqs = [
    {
      question: "¿Qué tipos de automatizaciones hacéis?",
      answer: "Desarrollamos desde automatizaciones simples como envío de emails automáticos hasta sistemas complejos con IA como nuestro GestorIA. Incluye: gestión documental, procesamiento de datos, integración entre herramientas, chatbots inteligentes, y mucho más."
    },
    {
      question: "¿Voy a tener que gastar mucho?",
      answer: "Nuestros proyectos se adaptan a tu presupuesto. Ofrecemos desde soluciones básicas por 200€/mes hasta desarrollos personalizados. El ROI suele recuperarse en 2-6 meses gracias al ahorro de tiempo y errores."
    },
    {
      question: "¿Tendré que cambiar mis herramientas y procesos?",
      answer: "No. Nos adaptamos a tu forma de trabajar actual. Conectamos tus herramientas existentes y mejoramos los procesos sin que tengas que cambiar nada. Es nuestra filosofía: automatizar sin interrumpir."
    }
  ];

  useEffect(() => {
    // Capturar UTMs de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmData: UTMParams = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
    };
    setUtms(utmData);

    // Enviar pageview
    sendPageview(utmData);
  }, []);

  const sendPageview = async (utmData: UTMParams) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pageview',
          path: window.location.pathname,
          ...utmData,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.log('Error enviando pageview:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    // Enviar evento de click
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp_click',
          path: window.location.pathname,
          ...utms,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.log('Error enviando whatsapp_click:', error);
    }

    // Construir mensaje WhatsApp
    let prefillMessage = process.env.NEXT_PUBLIC_WHATSAPP_PREFILL || 'Hola, me interesa LoopTracer.';
    prefillMessage = prefillMessage.replace('{nombre}', '').replace('{empresa}', '');
    
    if (utms.utm_source || utms.utm_campaign) {
      const campaign = `${utms.utm_source || ''}/${utms.utm_campaign || ''}`.replace(/^\/|\/$/g, '');
      if (campaign) {
        prefillMessage += ` (campaña: ${campaign})`;
      }
    }

    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE}?text=${encodeURIComponent(prefillMessage)}`;
    
    // Esperar 120ms y redirigir
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 120);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación mínima
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...utms,
          path: window.location.pathname,
          userAgent: navigator.userAgent
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        alert('Gracias. Te contactamos en breve.');
        setFormData({ name: '', email: '', phone: '', notes: '' });
      } else {
        alert('Ha habido un error. Inténtalo de nuevo.');
      }
    } catch (error) {
      alert('Ha habido un error. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCaseModal = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
    setSelectedImageIndex(0);
  };

  const closeCaseModal = () => {
    setSelectedCase(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedCase) {
      setSelectedImageIndex((prev) => 
        prev === selectedCase.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedCase) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedCase.images.length - 1 : prev - 1
      );
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-dark-bg text-text-primary font-inter">
      {/* Barra de oferta fija */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-center text-lg md:text-xl font-medium text-white">
            ¿Es la primera vez que trabajas con nosotros? ¡Estás de suerte! ...{' '}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="underline hover:no-underline font-semibold transition-all duration-200 hover:text-emerald-100"
            >
              "Saber más"
            </button>
          </p>
        </div>
      </div>

      {/* Hero Section Mejorado */}
      <section className="pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-wide text-white">
              ¿QUIERES AHORRAR TIEMPO Y DINERO?
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-8 font-medium">
              Déjalo en manos de los que sabemos hacerlo
            </p>

            <div className="relative">
              <div className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text mb-8">
                AUTOMATIZA TU NEGOCIO
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Casos de Éxito */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          Casos de Éxito
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {caseStudies.map((caseStudy) => (
            <div key={caseStudy.id} className="relative group cursor-pointer" onClick={() => openCaseModal(caseStudy)}>
              {caseStudy.isBest && (
                <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  ⭐ Top
                </div>
              )}
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="text-lg font-semibold text-center mb-4 text-emerald-400">
                  {caseStudy.title}
                </h3>
                
                <div className="aspect-video bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                    <div className="text-4xl text-emerald-400 group-hover:scale-110 transition-transform">
                      {caseStudy.id === 'gestoria' ? '🤖' : caseStudy.id === 'documentos' ? '📋' : '🛒'}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver más
                    </span>
                  </div>
                </div>
                
                <p className="text-text-secondary text-sm leading-relaxed">
                  {caseStudy.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-text-secondary italic">
          Esto solo son algunos ejemplos...
        </p>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          Preguntas Frecuentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800/30 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/30 transition-colors"
              >
                <span className="font-medium text-text-primary">{faq.question}</span>
                <span className={`text-emerald-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}>
                  ↓
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-6">
            ¿Dos minutos y lo vemos?
          </h2>
          
          <button
            onClick={handleWhatsAppClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium px-8 py-4 rounded-2xl text-lg shadow-lg transition-colors duration-200 mb-6"
          >
            Contactar por WhatsApp
          </button>
          
          <p className="text-text-secondary mb-8">
            o déjanos tus datos y te contactamos
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nombre *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Teléfono *"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
          
          <div>
            <textarea
              placeholder="Notas (opcional)"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
          
          <p className="text-xs text-text-secondary text-center">
            Al enviar aceptas ser contactado para información comercial.
          </p>
        </form>
      </section>

      {/* Botón WhatsApp Flotante */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </button>

      {/* Modal de Casos de Éxito */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative bg-dark-bg border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-text-primary">{selectedCase.title}</h3>
              <button
                onClick={closeCaseModal}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                    <span className="text-text-secondary">Imagen {selectedImageIndex + 1} de {selectedCase.images.length}</span>
                  </div>
                </div>
                
                {selectedCase.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      →
                    </button>
                  </>
                )}
                
                <div className="flex justify-center mt-4 space-x-2">
                  {selectedCase.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImageIndex ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-text-secondary leading-relaxed">{selectedCase.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Información LoopTracer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-dark-bg border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-text-primary">
                  🎁 LoopTracer - Oferta Exclusiva de Lanzamiento
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* ¿Qué es LoopTracer primero? */}
              <div className="space-y-4">
                <h4 className="text-xl font-medium text-text-primary">
                  ¿Qué es LoopTracer GestorIA?
                </h4>
                <div className="text-text-secondary space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-text-primary">Tu asistente de IA que conoce toda la información de tu gestoría. </strong> 
                    Subes tus PDF, Excel, procedimientos, FAQs... y él responde cualquier pregunta diferenciando por roles y realiza tareas de forma independiente. Preparado para preguntas de la Administración (Métricas, datos internos...), de los Trabajadores (Procesos, dudas...), de los clientes (gestiona al completo la atención al cliente)...
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-text-primary">✅ Lo que hace:</strong>
                      <ul className="text-text-secondary mt-1 space-y-1 text-xs">
                        <li>• Responde dudas de clientes (opción de conectar Whatsapp o email)</li>
                        <li>• Se conecta con otras herramientas para realizar tareas</li>
                        <li>• Acelera el aprendizaje de los nuevos empleados</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-text-primary">❌ Lo que NO hace:</strong>
                      <ul className="text-text-secondary mt-1 space-y-1 text-xs">
                        <li>• Cambiar tu forma de trabajar</li>
                        <li>• Filtrar tu información</li>
                        <li>• Salir de Europa</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Oferta principal destacada */}
              <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 border-2 border-emerald-500/50 rounded-xl p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <span>🔥</span>
                    <span>SOLO SEPTIEMBRE 2025</span>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-text-primary">
                    Instalación Gratis + 4 Meses con Descuento
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-center items-center space-x-4">
                      <span className="text-xl text-text-secondary line-through">Instalación: 690€</span>
                      <span className="text-3xl font-bold text-emerald-400">GRATIS</span>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                      <span className="text-lg text-text-secondary line-through">Mensualidad: 239€</span>
                      <span className="text-2xl font-bold text-emerald-400">199€/mes*</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/60 rounded-lg p-4 text-sm">
                    <p className="text-emerald-400 font-semibold mb-2">🎯 Incluye:</p>
                    <ul className="text-text-secondary space-y-1 text-left">
                      <li>• <strong className="text-white">1 mes GRATIS</strong> de prueba</li>
                      <li>• <strong className="text-white">Implementación gratuita</strong> (valor 690€)</li>
                      <li>• <strong className="text-white">20% descuento</strong> meses 2, 3 y 4</li>
                      <li>• Sin permanencia</li>
                    </ul>
                    <p className="text-xs text-text-secondary mt-3">*Después del mes gratis: 199€ (meses 2-4), luego 239€/mes.</p>
                  </div>
                </div>
              </div>

              {/* ROI - Retorno de la Inversión */}
              <div className="bg-emerald-900/20 rounded-lg p-6 border border-emerald-500/20">
                <h5 className="text-xl font-semibold text-emerald-400 mb-4 text-center">💰 ¿Cuánto dinero te ahorra realmente?</h5>
                
                <div className="space-y-5">
                  {/* Cálculo principal */}
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <p className="text-text-primary text-lg font-medium mb-2">
                      Solo con <strong className="text-emerald-400">3 empleados</strong> ahorrando <strong className="text-emerald-400">30min/día</strong>:
                    </p>
                    <div className="text-2xl font-bold text-emerald-400">
                      825€/mes recuperados vs 199€ coste = <span className="text-white">+626€/mes</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">(3 personas × 30min × 25€/h × 22 días laborales)</p>
                  </div>

                  {/* Beneficios específicos */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-400 font-bold">👑</span>
                        </div>
                        <h6 className="font-semibold text-text-primary">Control Total</h6>
                      </div>
                      <ul className="text-text-secondary text-xs space-y-1">
                        <li>• Info de clientes al instante</li>
                        <li>• Métricas empresariales claras</li>
                        <li>• Sin depender de empleados</li>
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-400 font-bold">⚡</span>
                        </div>
                        <h6 className="font-semibold text-text-primary">Empleados Más Rápidos</h6>
                      </div>
                      <ul className="text-text-secondary text-xs space-y-1">
                        <li>• Juniors aprenden sin molestar</li>
                        <li>• Consultas resueltas al momento</li>
                        <li>• Menos interrupciones</li>
                      </ul>
                    </div>

                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-orange-400 font-bold">🤖</span>
                        </div>
                        <h6 className="font-semibold text-text-primary">Atención 24/7</h6>
                      </div>
                      <ul className="text-text-secondary text-xs space-y-1">
                        <li>• Respuestas automáticas</li>
                        <li>• WhatsApp/Email integrado</li>
                        <li>• Clientes más satisfechos</li>
                      </ul>
                    </div>
                  </div>

                  {/* Comparativa antes/después */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                      <h6 className="font-semibold text-red-400 mb-2 text-center">❌ Sin LoopTracer</h6>
                      <ul className="text-text-secondary space-y-1 text-xs">
                        <li>• Empleados preguntando constantemente</li>
                        <li>• Búsquedas en archivos interminables</li>
                        <li>• Clientes esperando respuestas</li>
                        <li>• Jefe sobrecargado con consultas</li>
                      </ul>
                    </div>
                    
                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4">
                      <h6 className="font-semibold text-emerald-400 mb-2 text-center">✅ Con LoopTracer</h6>
                      <ul className="text-text-secondary space-y-1 text-xs">
                        <li>• Respuestas inmediatas y citadas</li>
                        <li>• Empleados autónomos y eficientes</li>
                        <li>• Clientes atendidos 24/7</li>
                        <li>• Jefe enfocado en estrategia</li>
                      </ul>
                    </div>
                  </div>

                  {/* Resultado final */}
                  <div className="text-center bg-gradient-to-r from-emerald-800/30 to-emerald-700/30 rounded-lg p-4 border border-emerald-500/30">
                    <p className="text-text-primary font-semibold">
                      🎯 <strong className="text-emerald-400">Resultado:</strong> Tu gestoría funciona mejor, tus empleados son más productivos 
                      y tú recuperas <strong className="text-white">+626€/mes mínimo</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA urgente */}
              <div className="pt-4 border-t border-white/10 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 -mx-6 px-6 pb-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-text-primary font-bold text-lg">
                      ⏰ Solo durante el mes de Septiembre
                    </p>
                    <p className="text-sm text-text-secondary">
                      Después vuelve al precio normal: <span className="text-red-400 font-semibold">239€/mes + 690€ implementación</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      handleWhatsAppClick();
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold px-12 py-4 rounded-xl transition-all duration-300 text-lg shadow-xl hover:shadow-emerald-500/30 transform hover:scale-105"
                  >
                    🚀 QUIERO MI MES GRATIS
                  </button>
                  
                  <p className="text-xs text-text-secondary">
                    ✅ Sin permanencia • ✅ Cancelas cuando quieras • ✅ Datos 100% en Europa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-text-secondary">
            LoopTracer — Claro y directo.
          </p>
        </div>
      </footer>
    </main>
  );
}