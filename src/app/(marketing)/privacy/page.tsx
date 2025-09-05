import type { Metadata } from 'next';

import { SmoothScrollNav } from '@/modules/shared/presentation/components/ui/smooth-scroll-nav';

// Enable ISR with 1 hour cache for legal content
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Política de Privacidad - Plataforma WhatsApp Cloud API',
  description: 'Conoce cómo recopilamos, usamos y protegemos tus datos en nuestra plataforma WhatsApp Cloud API. Prácticas de privacidad conformes con RGPD.',
  openGraph: {
    title: 'Política de Privacidad - Plataforma WhatsApp Cloud API',
    description: 'Prácticas transparentes de privacidad para nuestra plataforma de mensajería empresarial.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = '15 de enero de 2025';

interface TableOfContentsItem {
  id: string;
  title: string;
  subsections?: { id: string; title: string; }[];
}

const tableOfContents: TableOfContentsItem[] = [
  { id: 'introduction', title: 'Introducción' },
  { id: 'information-we-collect', title: 'Información que Recopilamos' },
  { id: 'how-we-use-information', title: 'Cómo Usamos tu Información' },
  { id: 'whatsapp-compliance', title: 'Cumplimiento de WhatsApp Business API' },
  { id: 'data-sharing', title: 'Compartir y Divulgar Datos' },
  { id: 'international-transfers', title: 'Transferencias Internacionales de Datos' },
  { id: 'gdpr-compliance', title: 'Cumplimiento RGPD (Usuarios Europeos)' },
  { id: 'data-security', title: 'Seguridad de Datos' },
  { id: 'data-retention', title: 'Retención de Datos' },
  { id: 'your-rights', title: 'Tus Derechos y Opciones' },
  { id: 'cookies', title: 'Cookies y Tecnologías de Seguimiento' },
  { id: 'children-privacy', title: 'Privacidad de Menores' },
  { id: 'changes-to-policy', title: 'Cambios a esta Política' },
  { id: 'contact-us', title: 'Contáctanos' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Política de Privacidad
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Estamos comprometidos a proteger tu privacidad y garantizar transparencia en cómo manejamos tus datos.
            </p>
            <p className="text-sm text-gray-500">
              Última actualización: <time dateTime="2025-01-15">{LAST_UPDATED}</time>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents */}
              <aside className="lg:col-span-1">
                <SmoothScrollNav items={tableOfContents} />
              </aside>

              {/* Content */}
              <main className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm p-8 lg:p-12 prose prose-lg max-w-none">

                  {/* Introduction */}
                  <section id="introduction" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Bienvenido a la Plataforma WhatsApp Cloud API ("Plataforma", "Servicio", "nosotros", o "nuestro").
                      Esta Política de Privacidad explica cómo The Kroko Company y sus afiliadas recopilan, usan, divulgan,
                      y protegen tu información cuando usas nuestra Plataforma WhatsApp Cloud API y servicios relacionados.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Estamos comprometidos con el cumplimiento de las leyes de protección de datos aplicables, incluyendo el
                      Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos (LOPD) española.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section id="information-we-collect" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Información que Recopilamos</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Información de Cuenta</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Nombre de empresa, información de contacto y detalles de facturación</li>
                      <li>Credenciales de cuenta WhatsApp Business y números de teléfono</li>
                      <li>Credenciales de cuenta de usuario y datos de autenticación</li>
                      <li>Información de pago (procesada de forma segura a través de proveedores terceros)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Datos de Mensajes</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Mensajes de WhatsApp enviados y recibidos a través de nuestra plataforma</li>
                      <li>Metadatos de mensajes (marcas de tiempo, estado de entrega, información de remitente/destinatario)</li>
                      <li>Archivos multimedia compartidos a través del servicio de mensajería</li>
                      <li>Registros de interacción con bots e historial de conversaciones</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Información Técnica</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Direcciones IP, información del dispositivo y tipos de navegador</li>
                      <li>Registros de uso de API y datos de eventos webhook</li>
                      <li>Métricas de rendimiento y análisis del sistema</li>
                      <li>Registros de errores e información de depuración</li>
                    </ul>
                  </section>

                  {/* How We Use Information */}
                  <section id="how-we-use-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cómo Usamos tu Información</h2>
                    <p className="text-gray-700 mb-4">Usamos la información recopilada para los siguientes propósitos:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Proporcionar y mantener nuestros servicios de WhatsApp Cloud API</li>
                      <li>Procesar y enrutar mensajes entre tú y tus clientes</li>
                      <li>Generar análisis e informes de rendimiento</li>
                      <li>Procesamiento de facturación y pagos</li>
                      <li>Soporte al cliente y asistencia técnica</li>
                      <li>Mejorar nuestros servicios y desarrollar nuevas funciones</li>
                      <li>Garantizar la seguridad de la plataforma y prevenir fraudes</li>
                      <li>Cumplir con obligaciones legales y requisitos regulatorios</li>
                    </ul>
                  </section>

                  {/* WhatsApp Compliance */}
                  <section id="whatsapp-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cumplimiento de WhatsApp Business API</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Como Proveedor de Soluciones WhatsApp Business, cumplimos con la Política Empresarial de WhatsApp y
                      los requisitos de manejo de datos:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Los mensajes se procesan según los estándares de cifrado de WhatsApp</li>
                      <li>No almacenamos el contenido de mensajes más tiempo del necesario para la entrega del servicio</li>
                      <li>Se requiere consentimiento opt-in del cliente antes de iniciar conversaciones</li>
                      <li>Mantenemos registros de auditoría para monitoreo de cumplimiento</li>
                      <li>Todas las plantillas de mensajes cumplen con el proceso de aprobación de WhatsApp</li>
                    </ul>
                  </section>

                  {/* Data Sharing */}
                  <section id="data-sharing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Compartir y Divulgar Datos</h2>
                    <p className="text-gray-700 mb-4">Podemos compartir tu información en las siguientes circunstancias:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Proveedores de Servicios:</strong> Proveedores terceros que asisten en la entrega del servicio</li>
                      <li><strong>WhatsApp/Meta:</strong> Según lo requerido para la funcionalidad de WhatsApp Business API</li>
                      <li><strong>Cumplimiento Legal:</strong> Cuando lo requiera la ley o para proteger nuestros derechos</li>
                      <li><strong>Transferencias Empresariales:</strong> En conexión con fusiones o adquisiciones</li>
                      <li><strong>Consentimiento:</strong> Cuando hayas dado consentimiento explícito</li>
                    </ul>
                  </section>

                  {/* International Transfers */}
                  <section id="international-transfers" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Transferencias Internacionales de Datos</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Tus datos pueden ser transferidos y procesados en países fuera de tu región.
                      Aseguramos que existen salvaguardas apropiadas, incluyendo:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Cláusulas Contractuales Estándar para transferencias de datos de la UE</li>
                      <li>Decisiones de adecuación donde sean aplicables</li>
                      <li>Normas Corporativas Vinculantes para transferencias dentro del grupo</li>
                      <li>Esquemas de certificación y códigos de conducta</li>
                    </ul>
                  </section>

                  {/* GDPR Compliance */}
                  <section id="gdpr-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cumplimiento RGPD (Usuarios Europeos)</h2>
                    <p className="text-gray-700 mb-4">Para usuarios en el Espacio Económico Europeo, tienes los siguientes derechos:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Derecho de Acceso:</strong> Solicitar copias de tus datos personales</li>
                      <li><strong>Derecho de Rectificación:</strong> Corregir información inexacta</li>
                      <li><strong>Derecho al Olvido:</strong> Solicitar la eliminación de tus datos</li>
                      <li><strong>Derecho a Limitar el Procesamiento:</strong> Limitar cómo usamos tus datos</li>
                      <li><strong>Derecho a la Portabilidad de Datos:</strong> Transferir tus datos a otro servicio</li>
                      <li><strong>Derecho de Oposición:</strong> Oponerse a ciertos tipos de procesamiento</li>
                    </ul>
                  </section>


                  {/* Data Security */}
                  <section id="data-security" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Seguridad de Datos</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Implementamos medidas de seguridad estándar de la industria para proteger tu información:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Cifrado de extremo a extremo para transmisión de mensajes</li>
                      <li>Auditorías de seguridad regulares y pruebas de penetración</li>
                      <li>Controles de acceso y capacitación de empleados</li>
                      <li>Centros de datos seguros con monitoreo 24/7</li>
                      <li>Procedimientos de respuesta a incidentes y notificación de brechas</li>
                    </ul>
                  </section>

                  {/* Data Retention */}
                  <section id="data-retention" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Retención de Datos</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Retenemos tu información solo el tiempo necesario para los propósitos descritos en esta política:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Datos de Cuenta:</strong> Retenidos durante la duración de tu cuenta más 7 años para cumplimiento legal</li>
                      <li><strong>Datos de Mensajes:</strong> Eliminados automáticamente después de 30 días a menos que se requieran para resolución de disputas</li>
                      <li><strong>Datos Analíticos:</strong> Datos agregados retenidos por 2 años para mejora del servicio</li>
                      <li><strong>Datos Legales:</strong> Retenidos según lo requieran las leyes y regulaciones aplicables</li>
                    </ul>
                  </section>

                  {/* Your Rights */}
                  <section id="your-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tus Derechos y Opciones</h2>
                    <p className="text-gray-700 mb-4">Puedes ejercer tus derechos de privacidad a través de:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Configuración de cuenta en tu panel de control</li>
                      <li>Contactar a nuestro Delegado de Protección de Datos en privacy@thekrokocompany.com</li>
                      <li>Usar nuestro sistema automatizado de solicitud de datos</li>
                      <li>Contactar al soporte al cliente para asistencia</li>
                    </ul>
                  </section>

                  {/* Cookies */}
                  <section id="cookies" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies y Tecnologías de Seguimiento</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Usamos cookies y tecnologías similares para mejorar tu experiencia:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Cookies Esenciales:</strong> Requeridas para la funcionalidad de la plataforma</li>
                      <li><strong>Cookies Analíticas:</strong> Nos ayudan a entender el uso de la plataforma</li>
                      <li><strong>Cookies de Preferencia:</strong> Recuerdan tus configuraciones y preferencias</li>
                      <li><strong>Cookies de Marketing:</strong> Usadas para publicidad relevante (solo con consentimiento)</li>
                    </ul>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children-privacy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacidad de Menores</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Nuestros servicios no están destinados a personas menores de 18 años. No recopilamos
                      intencionalmente información personal de niños. Si crees que hemos recopilado inadvertidamente
                      información de un menor, por favor contáctanos inmediatamente.
                    </p>
                  </section>

                  {/* Changes to Policy */}
                  <section id="changes-to-policy" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambios a esta Política</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios materiales
                      a través de correo electrónico, notificaciones de plataforma, o publicando la política actualizada en nuestro sitio web.
                      Tu uso continuado de nuestros servicios constituye aceptación de la política actualizada.
                    </p>
                  </section>

                  {/* Contact Us */}
                  <section id="contact-us" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contáctanos</h2>
                    <p className="text-gray-700 mb-4">
                      Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas de datos, por favor contáctanos:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-700 mb-2"><strong>Delegado de Protección de Datos</strong></p>
                      <p className="text-gray-700 mb-2">Email: privacy@thekrokocompany.com</p>
                      <p className="text-gray-700 mb-2">Dirección: Madrid, España</p>
                      <p className="text-gray-700">Teléfono: +34 900 123 456</p>
                    </div>
                  </section>

                </div>
              </main>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
