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

  const deadline = process.env.NEXT_PUBLIC_OFFER_DEADLINE || '2025-09-15';

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

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
            Automatizamos tu gestoría sin cambiar tu forma de trabajar.
          </h1>
          
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            Analizamos tus flujos de trabajo actuales y adaptándonos a ellos te hacemos ahorrar horas sin mover un dedo.
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-start text-left max-w-2xl mx-auto">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-4 flex-shrink-0"></span>
              <p className="text-text-primary">Desarrollamos desde flujos simples hasta programas completos</p>
            </div>
            <div className="flex items-center justify-start text-left max-w-2xl mx-auto">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-4 flex-shrink-0"></span>
              <p className="text-text-primary">Implementamos Inteligencia Artificial si la necesitas</p>
            </div>
            <div className="flex items-center justify-start text-left max-w-2xl mx-auto">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-4 flex-shrink-0"></span>
              <p className="text-text-primary">No tenemos límites, llegamos hasta donde necesites, siempre y cuando creamos que es rentable en tu caso</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          Cómo trabajamos
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-emerald-500 font-semibold text-xl">1</span>
            </div>
            <p className="text-text-primary leading-relaxed">
              Analizamos los procesos para encontrar los cuellos de botella de tu gestoría.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-emerald-500 font-semibold text-xl">2</span>
            </div>
            <p className="text-text-primary leading-relaxed">
              Planificamos las automatizaciones que más optimicen tu forma de trabajo y multipliquen tu eficiencia.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-emerald-500 font-semibold text-xl">3</span>
            </div>
            <p className="text-text-primary leading-relaxed">
              Desarrollamos, implementamos y resolvemos todas las dudas de tu equipo.
            </p>
          </div>
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

      {/* Modal de Información */}
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