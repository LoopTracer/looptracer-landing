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
  const [reserveFormData, setReserveFormData] = useState({
    name: '',
    email: ''
  });
  const [isReserving, setIsReserving] = useState(false);

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
      description: 'Implementamos inteligencia artificial in tus procesos empresariales para automatizar tareas repetitivas. Desde chatbots inteligentes hasta sistemas de análisis predictivo que optimizan la toma de decisiones y reducen tiempos operativos.'
    },
    {
      id: 'ventas',
      title: 'Desarrollamos SaaS y Sistemas a Medida',
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

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reserveFormData.name.trim() || !reserveFormData.email.trim()) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setIsReserving(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reserveFormData.name,
          email: reserveFormData.email,
          phone: '',
          notes: 'Reserva plaza lanzamiento LoopTracer',
          ...utms,
          path: window.location.pathname,
          userAgent: navigator.userAgent
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        alert('¡Reserva confirmada! Te contactaremos el 1 de Octubre con todos los detalles.');
        setReserveFormData({ name: '', email: '' });
        setIsModalOpen(false);
      } else {
        alert('Ha habido un error. Inténtalo de nuevo.');
      }
    } catch (error) {
      alert('Ha habido un error. Inténtalo de nuevo.');
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg text-text-primary font-inter">
      {/* Barra de oferta fija */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-center text-lg md:text-xl font-medium text-white">
            ¿Nuevo en LoopTracer? -{'>'} {' '}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="underline hover:no-underline font-semibold transition-all duration-200 hover:text-emerald-100"
            >
              Descubrir
            </button>
          </p>
        </div>
      </div>

      {/* Hero Section Mejorado */}
      <section className="pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm">           
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-wide text-white">
              ¿QUIERES AHORRAR <span className="text-emerald-400">TIEMPO</span> Y DINERO?
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-8 font-medium">
              Déjalo en manos de los que sabemos hacerlo
            </p>

            <div className="relative">
              <div className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text mb-8">
                AUTOMATIZA TU NEGOCIO
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo */}
      <div className="mb-2 mt-2">
        <img 
          src="/logo.png" 
          alt="LoopTracer" 
          className="h-60 md:h-72 mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
      </div>

      {/* Casos de Éxito */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-12 text-center">
          Nuestros Servicios
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {caseStudies.map((caseStudy) => (
            <div key={caseStudy.id} className="relative group cursor-pointer" onClick={() => openCaseModal(caseStudy)}>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-105">
                <h3 className="text-lg font-semibold text-center mb-4 text-emerald-400">
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
                
                <p className="text-text-secondary text-sm leading-relaxed">
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

      {/* Modal de Información LoopTracer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-dark-bg border border-white/20 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-center relative">
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-center">
                  ◆ LoopTracer - Reserva tu Plaza de Lanzamiento
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-0 text-text-secondary hover:text-text-primary transition-colors text-3xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-6">
              {/* Información GestorIA */}
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-2xl p-6 border border-white/20">
                <div className="space-y-8">
                  {/* ¿Qué es? */}
                  <div>
                    <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center">
                      <span className="mr-3">◆</span>
                      ¿QUÉ ES GESTOR-IA?
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-4 border border-blue-500/20">
                        <h5 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                          <span className="mr-2">◉</span>
                          Gestión Empresarial
                        </h5>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Proporciona datos actualizados sobre la situación de tu empresa y tus trabajadores.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-4 border border-purple-500/20">
                        <h5 className="text-lg font-bold text-purple-400 mb-3 flex items-center">
                          <span className="mr-2">◉</span>
                          Aumento de Productividad
                        </h5>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Soluciona dudas de trabajadores aportando toda la información interna necesaria. Cuenta con conexiones a tus herramientas de trabajo.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl p-4 border border-orange-500/20">
                        <h5 className="text-lg font-bold text-orange-400 mb-3 flex items-center">
                          <span className="mr-2">◉</span>
                          Atención al Cliente 24h
                        </h5>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Ofrece respuestas inmediatas a preguntas de clientes con posibilidad de conectar directamente a Email, WhatsApp...
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-text-primary font-medium">
                        IA multi-rol con conexión a múltiples herramientas
                      </p>
                    </div>
                  </div>

                  {/* ¿Cómo funciona? */}
                  <div className="border-t border-white/10 pt-8">
                    <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center">
                      <span className="mr-3">◆</span>
                      ¿CÓMO FUNCIONA?
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          <span className="text-sm leading-none">1</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-2">Acceso según tu rol</h5>
                          <p className="text-text-secondary text-sm">
                            Accedes al programa con los datos que te proporcionamos. Dependiendo de tu rol (Jefe, trabajador o cliente) tienes acceso a unas funciones u otras.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          <span className="text-sm leading-none">2</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-2">Configura tu información</h5>
                          <p className="text-text-secondary text-sm">
                            Alimentas GestorIA con toda tu información señalando qué roles tendrán acceso a cada documento.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          <span className="text-sm leading-none">3</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-2">Sube tus archivos</h5>
                          <p className="text-text-secondary text-sm">
                            Arrastras tus archivos de forma intuitiva y el programa los procesa internamente para añadirlos a su base de datos vectorial para un mayor rendimiento.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          <span className="text-sm leading-none">4</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-2">Listo para empezar</h5>
                          <p className="text-text-secondary text-sm">
                            Haces tus preguntas y vas ajustando el programa a tu gusto: añades o eliminas documentos, analizas métricas de uso, conectamos tus canales de comunicación y multiplicamos la productividad conectando herramientas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculadora de Ahorro */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-white/20">
                <h4 className="text-3xl font-bold text-white mb-8 text-center">
                  ¿CUÁNTO PUEDE AHORRAR GESTOR-IA A TU EMPRESA?
                </h4>
                
                <div className="space-y-6">
                  {/* Tarjeta 1: Gerente/Dueño */}
                  <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-blue-400 mb-3 flex items-center">
                          ◉ Asistencia al Gerente/Dueño
                        </h5>
                        <div className="text-text-secondary text-sm space-y-1">
                          <p>▲ Consultas de métricas empresariales</p>
                          <p>▲ Gestión automática de agenda</p>
                          <p>▲ Acceso instantáneo a datos de trabajadores</p>
                          <p className="text-xs opacity-75">Cálculo: 1h × 50€/h × 22 días laborales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-400">1100€</div>
                        <div className="text-sm text-text-secondary">al mes</div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Trabajadores */}
                  <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-purple-400 mb-3 flex items-center">
                          ◉ Asistencia a Trabajadores
                        </h5>
                        <div className="text-text-secondary text-sm space-y-1">
                          <p>▲ Consultas sobre procedimientos internos</p>
                          <p>▲ Información sobre clientes y fundamentos empresa</p>
                          <p>▲ Resolución de dudas sin interrumpir supervisores</p>
                          <p className="text-xs opacity-75">Cálculo: 3 empleados × 30min × 25€/h × 22 días</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-purple-400">825€</div>
                        <div className="text-sm text-text-secondary">al mes</div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3: Atención al Cliente */}
                  <div className="bg-gradient-to-r from-orange-900/40 to-orange-800/30 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-orange-400 mb-3 flex items-center">
                          ◉ Atención al Cliente 24/7
                        </h5>
                        <div className="text-text-secondary text-sm space-y-1">
                          <p>▲ Respuestas automáticas/semiautomáticas vía WhatsApp/Email</p>
                          <p>▲ Resolución de consultas comunes sin intervención</p>
                          <p>▲ Disponibilidad total fuera de horario laboral</p>
                          <p className="text-xs opacity-75">Cálculo: 2'5h/día ahorrada × 25€/h × 22 días</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-orange-400">1375€</div>
                        <div className="text-sm text-text-secondary">al mes</div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Total */}
                  <div className="bg-gradient-to-r from-emerald-900/50 to-emerald-800/40 rounded-xl p-8 border-2 border-emerald-500/50">
                    <div className="text-center">
                      <h5 className="text-2xl font-bold text-emerald-400 mb-4">
                        ◆ VALOR TOTAL MENSUAL GENERADO
                      </h5>
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        <span className="text-4xl font-black text-emerald-400">3300€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qué Incluye la Oferta */}
              <div className="bg-gradient-to-r from-emerald-600/30 to-emerald-500/30 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    <span>◆</span>
                    <span>SOLO SEPTIEMBRE 2025</span>
                  </div>
                  
                  <h4 className="text-3xl font-black text-white mb-8">
                    ¿QUÉ INCLUYE LA OFERTA?
                  </h4>
                  
                  <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-xl p-4 border border-white/20">
                    <div className="space-y-6 text-left">
                      {/* Item 1 */}
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-400 text-xl">▲</span>
                          <span className="text-lg text-white">
                            Instalación completamente gratis de <a href="#gestoria" className="text-emerald-400 font-bold underline hover:text-emerald-300 transition-colors">GestorIA</a>
                          </span>
                        </div>
                        <span className="text-xl text-red-400 line-through font-semibold">690€</span>
                      </div>

                      {/* Item 2 */}
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-400 text-xl">▲</span>
                          <span className="text-lg text-white">15 días de prueba a 0€</span>
                        </div>
                        <span className="text-xl text-red-400 line-through font-semibold">120€</span>
                      </div>

                      {/* Item 3 */}
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-400 text-xl">▲</span>
                          <span className="text-lg text-white">
                            20% mensual de por vida: <span className="text-red-400 line-through">239€</span> → <span className="text-emerald-400 font-bold">199€</span>
                          </span>
                        </div>
                        <span className="text-xl text-red-400 line-through font-semibold">40€/mes</span>
                      </div>
                    </div>

                    {/* Total Ahorro */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-emerald-800/50 to-emerald-700/50 rounded-xl border border-emerald-500/30">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white mb-2">
                          En el primer mes ahorras <span className="text-emerald-400 text-3xl">810€</span>
                        </p>
                        <p className="text-sm text-emerald-300 italic">
                          ◆ Más 40€ mensuales para siempre
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Lanzamiento */}
              <div className="pt-6 border-t border-white/10 bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 -mx-6 px-6 pb-8 rounded-b-2xl">
                <div className="text-center space-y-8">
                  {/* Copy de lanzamiento */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg mb-4">
                      <span>🚀</span>
                      <span>LANZAMIENTO: 1 DE OCTUBRE 2025</span>
                    </div>
                    
                    <h4 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      ◆ Reserva tu Plaza de Lanzamiento
                    </h4>
                    
                    <div className="max-w-2xl mx-auto space-y-3 text-text-secondary">
                      <p className="text-lg leading-relaxed">
                        <strong className="text-emerald-400">Solo los primeros 50 clientes</strong> que reserven antes del <strong className="text-white">1 de Octubre</strong> podrán acceder a estas condiciones exclusivas de lanzamiento.
                      </p>
                      <p className="text-base">
                        ◉ Sin compromiso de permanencia<br/>
                        ◉ Reserva 100% gratuita y sin compromiso<br/>
                        ◉ Te contactamos el día del lanzamiento con toda la información
                      </p>
                      <p className="text-sm italic border-t border-white/10 pt-4 mt-4">
                        Después del lanzamiento, el precio vuelve al estándar: <span className="text-red-400 font-semibold">239€/mes + 690€ implementación</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Formulario de reserva */}
                  <form onSubmit={handleReserveSubmit} className="max-w-md mx-auto space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Tu nombre completo *"
                        value={reserveFormData.name}
                        onChange={(e) => setReserveFormData({...reserveFormData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <input
                        type="email"
                        placeholder="Tu mejor email *"
                        value={reserveFormData.email}
                        onChange={(e) => setReserveFormData({...reserveFormData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isReserving}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-lg shadow-xl hover:scale-105 transform"
                    >
                      {isReserving ? 'Reservando...' : '◆ RESERVAR MI PLAZA GRATUITA'}
                    </button>
                    
                    <p className="text-xs text-text-secondary">
                      Al reservar aceptas ser contactado el día del lanzamiento con información sobre GestorIA
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center">
            <span className="text-emerald-400">LoopTracer</span> <span className="text-text-secondary">— Claro y directo.</span>
          </p>
        </div>
      </footer>
    </main>
  );
}