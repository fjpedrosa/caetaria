import type { Metadata } from 'next';

import { SmoothScrollNav } from '@/modules/shared/presentation/components/ui/smooth-scroll-nav';

// Enable ISR with 1 hour cache for legal content
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Términos de Servicio - Plataforma WhatsApp Cloud API',
  description: 'Términos y condiciones para usar nuestra plataforma empresarial WhatsApp Cloud API. Términos de uso de API, precios, facturación y acuerdos de servicio.',
  openGraph: {
    title: 'Términos de Servicio - Plataforma WhatsApp Cloud API',
    description: 'Términos y condiciones de servicio para nuestra plataforma de mensajería empresarial.',
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
  { id: 'introduction', title: 'Introducción y Aceptación' },
  { id: 'service-description', title: 'Descripción del Servicio' },
  { id: 'account-registration', title: 'Registro de Cuenta' },
  { id: 'acceptable-use', title: 'Política de Uso Aceptable' },
  { id: 'api-usage-terms', title: 'Términos de Uso de API' },
  { id: 'whatsapp-compliance', title: 'Cumplimiento de Políticas de WhatsApp Business' },
  { id: 'pricing-billing', title: 'Términos de Precios y Facturación' },
  { id: 'data-processing', title: 'Procesamiento de Datos y Privacidad' },
  { id: 'service-availability', title: 'Disponibilidad del Servicio y SLA' },
  { id: 'intellectual-property', title: 'Derechos de Propiedad Intelectual' },
  { id: 'user-responsibilities', title: 'Responsabilidades del Usuario' },
  { id: 'prohibited-activities', title: 'Actividades Prohibidas' },
  { id: 'termination', title: 'Terminación de Cuenta' },
  { id: 'limitation-liability', title: 'Limitación de Responsabilidad' },
  { id: 'indemnification', title: 'Indemnización' },
  { id: 'governing-law', title: 'Ley Aplicable y Jurisdicción' },
  { id: 'changes-to-terms', title: 'Cambios a los Términos' },
  { id: 'contact-information', title: 'Información de Contacto' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Términos de Servicio
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Por favor, lee estos términos cuidadosamente antes de usar nuestra Plataforma WhatsApp Cloud API.
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introducción y Aceptación</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Bienvenido a la Plataforma WhatsApp Cloud API operada por The Kroko Company ("Compañía", "nosotros", o "nuestro").
                      Estos Términos de Servicio ("Términos") rigen tu acceso y uso de nuestra plataforma, incluyendo nuestro sitio web,
                      APIs, y servicios relacionados (colectivamente, el "Servicio").
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Al acceder o usar nuestro Servicio, aceptas estar sujeto a estos Términos y nuestra Política de Privacidad.
                      Si no estás de acuerdo con alguna parte de estos términos, no puedes acceder al Servicio.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 font-medium">
                        Importante: Estos términos constituyen un acuerdo legalmente vinculante entre tú y The Kroko Company.
                      </p>
                    </div>
                  </section>

                  {/* Service Description */}
                  <section id="service-description" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción del Servicio</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Nuestra plataforma proporciona servicios de integración WhatsApp Business API de grado empresarial, incluyendo:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                      <li>Acceso a WhatsApp Business API y enrutamiento de mensajes</li>
                      <li>Plataforma de mensajería multicanal (WhatsApp, Telegram, Instagram, Facebook)</li>
                      <li>Desarrollo y gestión de chatbots con IA</li>
                      <li>Herramientas avanzadas de análisis y reportes</li>
                      <li>Gestión de webhooks e integraciones API</li>
                      <li>Creación y aprobación de plantillas de mensajes</li>
                      <li>Soporte al cliente y asistencia técnica</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      El Servicio se proporciona "tal cual" y puede ser modificado, actualizado o descontinuado a nuestra discreción
                      con notificación apropiada a los usuarios.
                    </p>
                  </section>

                  {/* Account Registration */}
                  <section id="account-registration" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Registro de Cuenta</h2>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Elegibilidad</h3>
                    <p className="text-gray-700 mb-4">Para usar nuestro Servicio, debes:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                      <li>Tener al menos 18 años o la mayoría de edad en tu jurisdicción</li>
                      <li>Tener la autoridad legal para celebrar este acuerdo</li>
                      <li>Representar una entidad empresarial legítima</li>
                      <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Seguridad de la Cuenta</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Eres responsable de mantener la seguridad de las credenciales de tu cuenta</li>
                      <li>Notifícanos inmediatamente sobre cualquier acceso no autorizado o violación de seguridad</li>
                      <li>Usa contraseñas seguras y habilita la autenticación de dos factores cuando esté disponible</li>
                      <li>No compartas las credenciales de tu cuenta con partes no autorizadas</li>
                    </ul>
                  </section>

                  {/* Acceptable Use Policy */}
                  <section id="acceptable-use" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Política de Uso Aceptable</h2>
                    <p className="text-gray-700 mb-4">Aceptas usar nuestro Servicio solo para fines legales y de acuerdo con:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Todas las leyes locales, nacionales e internacionales aplicables</li>
                      <li>La Política Empresarial y los Términos de Servicio de WhatsApp</li>
                      <li>Los Estándares de la Comunidad y las Políticas de Plataforma de Meta</li>
                      <li>Las mejores prácticas de la industria para comunicaciones empresariales</li>
                      <li>Las regulaciones de protección de datos y privacidad aplicables</li>
                    </ul>
                  </section>

                  {/* API Usage Terms */}
                  <section id="api-usage-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Términos de Uso de API</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Límites de Velocidad y Cuotas</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>El uso de la API está sujeto a límites de velocidad según tu plan de suscripción</li>
                      <li>El uso excesivo puede resultar en limitación temporal o suspensión</li>
                      <li>Contáctanos para discutir límites más altos para necesidades empresariales</li>
                      <li>Se aplican políticas de uso justo para prevenir el abuso del servicio</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Seguridad de la API</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Protege tus claves API y credenciales de autenticación</li>
                      <li>Implementa manejo adecuado de errores y mecanismos de reintento</li>
                      <li>Usa HTTPS para todas las comunicaciones API</li>
                      <li>Reporta vulnerabilidades de seguridad de manera responsable</li>
                    </ul>
                  </section>

                  {/* WhatsApp Compliance */}
                  <section id="whatsapp-compliance" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cumplimiento de Políticas de WhatsApp Business</h2>
                    <p className="text-gray-700 mb-4">
                      Como Proveedor de Soluciones WhatsApp Business, debes cumplir con todas las políticas de WhatsApp:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Obtener el consentimiento adecuado antes de iniciar conversaciones con usuarios</li>
                      <li>Respetar la privacidad del usuario y las solicitudes de exclusión</li>
                      <li>Usar plantillas de mensajes aprobadas para comunicaciones empresariales</li>
                      <li>Mantener información empresarial precisa y verificación</li>
                      <li>Seguir las pautas de mensajería y políticas de contenido de WhatsApp</li>
                      <li>Implementar soporte al cliente adecuado y resolución de disputas</li>
                    </ul>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-blue-800">
                        <strong>Aviso:</strong> Las violaciones de las políticas de WhatsApp pueden resultar en suspensión
                        o terminación de cuenta por parte de WhatsApp, lo cual está fuera de nuestro control.
                      </p>
                    </div>
                  </section>

                  {/* Pricing and Billing */}
                  <section id="pricing-billing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Términos de Precios y Facturación</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Planes de Suscripción</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Las tarifas de suscripción se facturan mensual o anualmente por adelantado</li>
                      <li>Todos los precios están en USD a menos que se especifique lo contrario</li>
                      <li>Pueden aplicarse impuestos y tarifas locales según tu ubicación</li>
                      <li>Los cambios de precio se comunicarán con 30 días de anticipación</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Cargos Basados en Uso</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Tarifas de entrega de mensajes según la estructura de precios de WhatsApp</li>
                      <li>Llamadas API adicionales más allá de los límites del plan</li>
                      <li>Uso de funciones premium y servicios adicionales</li>
                      <li>Servicios profesionales y desarrollo personalizado</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Términos de Pago</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>El pago es debido inmediatamente tras la generación de la factura</li>
                      <li>Los pagos tardíos pueden incurrir en cargos por intereses y suspensión del servicio</li>
                      <li>Los cargos disputados deben reportarse dentro de 30 días</li>
                      <li>Los reembolsos están sujetos a nuestra política de reembolsos</li>
                    </ul>
                  </section>

                  {/* Data Processing */}
                  <section id="data-processing" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Procesamiento de Datos y Privacidad</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Nuestras prácticas de procesamiento de datos están detalladas en nuestra Política de Privacidad. Al usar el Servicio, reconoces:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Procesamos datos como controlador para nuestros propios fines comerciales</li>
                      <li>Actuamos como procesador para los datos de mensajes de clientes</li>
                      <li>Las transferencias de datos cumplen con las leyes de privacidad aplicables</li>
                      <li>Eres responsable de obtener los consentimientos necesarios de tus clientes</li>
                      <li>Se aplican políticas de retención de datos según se describe en nuestra Política de Privacidad</li>
                    </ul>
                  </section>

                  {/* Service Availability */}
                  <section id="service-availability" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Disponibilidad del Servicio y SLA</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Compromiso de Tiempo de Actividad</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Nos esforzamos por un 99.9% de tiempo de actividad para nuestros servicios API principales</li>
                      <li>Las ventanas de mantenimiento programado se anunciarán con anticipación</li>
                      <li>Pueden estar disponibles créditos de servicio para interrupciones significativas</li>
                      <li>Las dependencias de servicios de terceros pueden afectar la disponibilidad</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitaciones</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>La disponibilidad de la plataforma WhatsApp está fuera de nuestro control</li>
                      <li>Los problemas de conectividad de red pueden afectar la entrega del servicio</li>
                      <li>Los eventos de fuerza mayor pueden causar interrupciones del servicio</li>
                      <li>El mantenimiento de emergencia puede realizarse sin previo aviso</li>
                    </ul>
                  </section>

                  {/* Intellectual Property */}
                  <section id="intellectual-property" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Derechos de Propiedad Intelectual</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Nuestros Derechos</h3>
                    <p className="text-gray-700 mb-4">
                      Todos los derechos, título e interés en nuestra plataforma, incluyendo software, documentación,
                      y materiales relacionados, permanecen como nuestra propiedad exclusiva.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Tus Derechos</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Retienes la propiedad de tu contenido y datos</li>
                      <li>Licencia limitada para usar nuestra plataforma según estos Términos</li>
                      <li>Derecho a exportar tus datos ante solicitud razonable</li>
                      <li>Licencia para cualquier comentario proporcionado a nosotros para mejora del servicio</li>
                    </ul>
                  </section>

                  {/* User Responsibilities */}
                  <section id="user-responsibilities" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsabilidades del Usuario</h2>
                    <p className="text-gray-700 mb-4">Como usuario de nuestro Servicio, eres responsable de:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Cumplimiento con todas las leyes y regulaciones aplicables</li>
                      <li>Obtener los permisos necesarios para comunicaciones con clientes</li>
                      <li>Mantener información de cuenta y negocio precisa</li>
                      <li>Implementar medidas de seguridad de datos apropiadas</li>
                      <li>Monitorear y gestionar tu uso de API y costos</li>
                      <li>Proporcionar soporte al cliente oportuno para tus usuarios finales</li>
                      <li>Reportar cualquier abuso de la plataforma o problemas de seguridad</li>
                    </ul>
                  </section>

                  {/* Prohibited Activities */}
                  <section id="prohibited-activities" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividades Prohibidas</h2>
                    <p className="text-gray-700 mb-4">No puedes usar nuestro Servicio para:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Enviar spam, mensajes no solicitados o contenido ilegal</li>
                      <li>Hacerse pasar por otros o proporcionar información falsa</li>
                      <li>Intentar obtener acceso no autorizado a nuestros sistemas</li>
                      <li>Violar derechos de propiedad intelectual</li>
                      <li>Participar en prácticas fraudulentas o engañosas</li>
                      <li>Distribuir malware o código dañino</li>
                      <li>Interferir con el funcionamiento normal de nuestro Servicio</li>
                      <li>Cualquier actividad que viole las leyes aplicables</li>
                    </ul>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Terminación de Cuenta</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Terminación por Tu Parte</h3>
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      <li>Puedes cancelar tu cuenta en cualquier momento a través de tu panel de control</li>
                      <li>Se requiere aviso de 30 días para cuentas empresariales</li>
                      <li>Sin reembolsos para tarifas de suscripción prepagadas</li>
                      <li>Exportación de datos disponible por 30 días después de la cancelación</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Terminación por Nuestra Parte</h3>
                    <p className="text-gray-700 mb-4">Podemos suspender o terminar tu cuenta por:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Violación de estos Términos o nuestras políticas</li>
                      <li>Falta de pago de tarifas o cargos</li>
                      <li>Comportamiento fraudulento o abusivo</li>
                      <li>Requisitos legales o regulatorios</li>
                      <li>Sospechas de violaciones de seguridad</li>
                    </ul>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="limitation-liability" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitación de Responsabilidad</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <p className="text-red-800 font-medium mb-4">AVISO LEGAL IMPORTANTE</p>
                      <p className="text-red-800 leading-relaxed mb-4">
                        EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, THE KROKO COMPANY NO SERÁ RESPONSABLE POR NINGÚN
                        DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENCIAL O PUNITIVO, INCLUYENDO SIN
                        LIMITACIÓN, PÉRDIDA DE GANANCIAS, DATOS, USO, FONDO DE COMERCIO U OTRAS PÉRDIDAS INTANGIBLES.
                      </p>
                      <p className="text-red-800 leading-relaxed">
                        NUESTRA RESPONSABILIDAD TOTAL POR CUALQUIER RECLAMO QUE SURJA DE O ESTÉ RELACIONADO CON ESTOS TÉRMINOS O EL
                        SERVICIO NO EXCEDERÁ LA CANTIDAD PAGADA POR TI EN LOS 12 MESES ANTERIORES AL RECLAMO.
                      </p>
                    </div>
                  </section>

                  {/* Indemnification */}
                  <section id="indemnification" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnización</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Aceptas indemnizar, defender y mantener indemne a The Kroko Company y sus funcionarios,
                      directores, empleados y agentes de y contra cualquier reclamo, responsabilidad, daño,
                      pérdida y gasto que surja de o esté de alguna manera conectado con:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Tu uso del Servicio</li>
                      <li>Tu violación de estos Términos</li>
                      <li>Tu violación de cualquier derecho de terceros</li>
                      <li>Cualquier contenido o datos que envíes a través del Servicio</li>
                      <li>Tus operaciones comerciales y comunicaciones con clientes</li>
                    </ul>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ley Aplicable y Jurisdicción</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Estos Términos se rigen y se interpretan de acuerdo con las leyes de España,
                      sin tener en cuenta los principios de conflicto de leyes. Cualquier disputa que surja de estos Términos o
                      tu uso del Servicio se resolverá a través de:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Negociaciones de buena fe entre las partes</li>
                      <li>Arbitraje vinculante si las negociaciones fallan</li>
                      <li>Tribunales de España para medidas cautelares</li>
                    </ul>
                  </section>

                  {/* Changes to Terms */}
                  <section id="changes-to-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambios a los Términos</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos sobre cambios
                      materiales a través de:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                      <li>Notificaciones por correo electrónico a tu dirección registrada</li>
                      <li>Notificaciones de plataforma en tu panel de control</li>
                      <li>Actualizaciones publicadas en nuestro sitio web</li>
                      <li>Aviso con 30 días de anticipación para cambios significativos</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      Tu uso continuado del Servicio después de que los cambios entren en vigor constituye aceptación
                      de los Términos actualizados.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section id="contact-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Información de Contacto</h2>
                    <p className="text-gray-700 mb-4">
                      Para preguntas sobre estos Términos o nuestro Servicio, por favor contáctanos:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-700 mb-2"><strong>The Kroko Company</strong></p>
                      <p className="text-gray-700 mb-2">Departamento Legal</p>
                      <p className="text-gray-700 mb-2">Email: legal@thekrokocompany.com</p>
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
