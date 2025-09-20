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
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const caseStudies: CaseStudy[] = [
    {
      id: 'gestoria',
      title: 'Conectamos Todas tus Herramientas',
      images: ['/service-integration.png'],
      description: 'Integramos todas tus herramientas de trabajo en un ecosistema unificado. Conectamos emails, CRM, ERP, bases de datos y aplicaciones para que trabajen en sincronía, eliminando duplicaciones y optimizando procesos.',
      isBest: true
    },
    {
      id: 'documentos',
      title: 'Implementamos IA en tus Procesos',
      images: ['/service-ai.png'],
      description: 'Implementamos inteligencia artificial en tus procesos empresariales para automatizar tareas repetitivas. Desde chatbots inteligentes hasta sistemas de análisis predictivo que optimizan la toma de decisiones y reducen tiempos operativos.'
    },
    {
      id: 'ventas',
      title: 'Desarrollamos Micro SaaS y Sistemas a Medida',
      images: [
        '/service-saas-1.png',
        '/service-saas-2.png'
      ],
      description: 'Creamos software personalizado y plataformas SaaS adaptadas a tu modelo de negocio. Desarrollamos aplicaciones web, sistemas de gestión empresarial y soluciones tecnológicas 100% a medida partiendo de lo que ya utilizas.'
    }
  ];

  const faqs = [
    {
      question: "¿Qué tipos de automatizaciones hacéis?",
      answer: "Cada empresa es diferente, por lo que somos muy flexibles. Desarrollamos desde automatizaciones simples como envío de emails automáticos hasta sistemas complejos con IA, integraciones personalizadas o incluso micro SaaS completos. Es cuestión de estudiar tu caso."
    },
    {
      question: "¿Voy a tener que gastar mucho?",
      answer: "Esto no es un gasto es una inversión, y te garantizamos que la recuperarás en pocos meses. Los precios pueden variar mucho, ya que cada desarrollo es muy personalizado. Si deseas una cifra exacta, puedes solicitar un presupuesto gratuito ahora mismo."
    },
    {
      question: "¿Tendré que cambiar mis herramientas y procesos de toda la vida?",
      answer: "No. Nos adaptamos a tu forma de trabajo al 100%. Conectamos tus herramientas y optimizamos los procesos sin que tengas que cambiar nada. Estamos aquí para ahorrarte tiempo y problemas."
    },
    {
      question: "¿Cuánto tendré que esperar?",
      answer: "Depende de la complejidad de la automatización y la demanda de trabajo del momento, pero para la mayoría de casos no necesitamos más de 2 semanas. Hemos optimizado mucho nuestro sistema de trabajo gracias a la Inteligencia Artificial."
    },
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación mínima
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: '',
          notes: 'Contacto desde formulario simplificado',
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


  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };


  return (
    <main className="min-h-screen bg-dark-bg text-text-primary font-inter">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="LoopTracer"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="ml-3 text-lg sm:text-xl font-bold text-white tracking-wide">
                LoopTracer
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <a href="#servicios" className="text-white/90 hover:text-white transition-colors text-sm sm:text-base font-medium">
                Servicios
              </a>
              <a href="#faq" className="text-white/90 hover:text-white transition-colors text-sm sm:text-base font-medium">
                FAQ
              </a>
              <a href="#contacto" className="text-white/90 hover:text-white transition-colors text-sm sm:text-base font-medium">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section Mejorado */}
      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center backdrop-blur-sm">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight tracking-wide text-white">
              ¿QUIERES AHORRAR <span className="text-emerald-400">TIEMPO</span> Y DINERO?
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-text-secondary mb-6 sm:mb-8 font-medium px-2">
              Déjalo en manos de los que sabemos hacerlo
            </p>

            <div className="relative">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text mb-6 sm:mb-8">
                AUTOMATIZA TU NEGOCIO
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>


      {/* Casos de Éxito */}
      <section id="servicios" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 sm:mb-12 text-center px-2">
          Nuestros Servicios
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {caseStudies.map((caseStudy) => (
            <div key={caseStudy.id} className="relative group cursor-pointer" onClick={() => openCaseModal(caseStudy)}>
              <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-105 min-h-[44px] touch-manipulation">
                <h3 className="text-base sm:text-lg font-semibold text-center mb-3 sm:mb-4 text-emerald-400 leading-tight">
                  {caseStudy.title}
                </h3>
                
                <div className="aspect-video bg-gray-700/50 rounded-lg mb-4 relative overflow-hidden">
                  <img 
                    src={caseStudy.images[0]}
                    alt={caseStudy.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 items-center justify-center hidden">
                    <div className="text-emerald-400 text-center">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-sm">Imagen próximamente</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver más
                    </span>
                  </div>
                </div>
                
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {caseStudy.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-text-secondary italic">
          Analizamos tu caso y aplicamos solo lo que multiplique tu productividad
        </p>
      </section>

      {/* Video de presentación */}
      <section className="mb-6 mt-6 px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-emerald-400">
              OPTIMIZA TU TIEMPO
            </h3>
            <div className="aspect-video bg-gray-900/50 rounded-xl overflow-hidden border border-white/10">
              <video
                className="w-full h-full object-cover"
                controls
                preload="metadata"
                poster="/video-thumbnail.png"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <p className="text-center text-text-secondary p-8">
                  Tu navegador no soporta la reproducción de video.
                  <br />
                  <a href="/demo-video.mp4" className="text-emerald-400 underline">
                    Descargar video
                  </a>
                </p>
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 sm:mb-12 text-center px-2">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800/30 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/30 transition-colors min-h-[64px] touch-manipulation"
              >
                <span className="font-medium text-text-primary text-sm sm:text-base pr-2 leading-relaxed">{faq.question}</span>
                <span className={`text-emerald-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''} text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center`}>
                  ↓
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-4 sm:px-6 pb-4">
                  <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 px-2">
            ¿Dos minutos y lo vemos?
          </h2>

          <button
            onClick={handleWhatsAppClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium px-6 sm:px-8 py-4 rounded-2xl text-base sm:text-lg shadow-lg transition-colors duration-200 mb-4 sm:mb-6 min-h-[56px] touch-manipulation"
          >
            Contactar por WhatsApp
          </button>

          <p className="text-text-secondary mb-6 sm:mb-8 px-2 text-sm sm:text-base">
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
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50 text-base min-h-[56px]"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-emerald-500/50 text-base min-h-[56px]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-medium px-6 py-4 rounded-lg transition-colors duration-200 text-base min-h-[56px] touch-manipulation"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>

          <p className="text-xs text-text-secondary text-center px-2">
            Al enviar aceptas ser contactado para información comercial.
          </p>
        </form>
      </section>

      {/* Botón WhatsApp Flotante */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-16 h-16 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group touch-manipulation"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-9 h-9 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
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
                  <img 
                    src={selectedCase.images[selectedImageIndex]}
                    alt={`${selectedCase.title} - ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 items-center justify-center hidden">
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


      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm sm:text-base">
            <span className="text-emerald-400">LoopTracer</span> <span className="text-text-secondary">— Claro y directo.</span>
          </p>
        </div>
      </footer>
    </main>
  );
}