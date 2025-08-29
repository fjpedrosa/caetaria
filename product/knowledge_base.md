📚 Knowledge Base – Caetaria

⸻

📌 Resumen Ejecutivo
 • Problema: Pymes y profesionales usan WhatsApp para gestionar clientes, pero la Cloud API es inaccesible para no técnicos (requiere VPS, programación, configuración compleja). Además, el número vinculado a Cloud API no puede usarse en la app oficial.
 • Solución: SaaS con app compañera + dashboard web que permite:
 • Onboarding guiado en minutos.
 • Envío de plantillas y automatización de flujos.
 • Integración de IA (respuestas automáticas, reservas).
 • Multiagente y gestión simple desde móvil.
 • Diferenciación: Experiencia ultra simple, verticalización sectorial (dentistas, restaurantes, ocio infantil), integración IA desde el inicio.
 • Modelo: SaaS con tiers fijos incluyendo tier gratuito para adopción inicial.

⚠️ **Insights Críticos Post-Análisis**:
 • **Propuesta de valor debe enfocarse en ROI medible** ("Aumenta ventas 30%") no en facilidad técnica
 • **CAC real proyectado €80-150** (no €30 como se estimó inicialmente)
 • **Timeline realista para MVP: 3-4 meses** con un solo desarrollador
 • **Presupuesto mínimo necesario: €8,000-10,000** para llegar a product-market fit

⸻

🧑‍🤝‍🧑 Problema & Cliente Objetivo
 • Clientes objetivo: Dentistas, restaurantes, clínicas estéticas, centros de ocio infantil, pequeños e-commerce.
 • Dolores:
 • Reservas y citas gestionadas manualmente por llamadas o WhatsApp tradicional.
 • WhatsApp Business App se queda corto (no soporta automatización real ni flujos IA).
 • Cloud API es demasiado técnico.

⸻

💡 Propuesta de Valor & Diferenciación

**Propuesta Original**: "WhatsApp Cloud en 5 minutos, sin programar"

**Propuesta Revisada**: "Aumenta tus ventas 30% automatizando WhatsApp"
 • Beneficios medibles:
 • ROI demostrable con métricas reales
 • Reducción de tiempo de respuesta 90%
 • Aumento de conversión de leads 40%
 • Cero mensajes perdidos
 • Diferenciación real:
 • App móvil compañera (competencia no tiene)
 • Verticalización profunda por sector
 • Onboarding guiado específico por industria
 • Integraciones nativas con herramientas del sector

⸻

📊 Mercado
 • WhatsApp = canal dominante en LATAM y España.
 • Mercado de WhatsApp Business API SaaS ya ocupado por Wati, Zoko, 360dialog, Respond.io.
 • Oportunidad: ninguno enfocado en UX ultra simple + app móvil compañera.
 • TAM inicial: cientos de miles de pymes en España/LATAM que dependen de WhatsApp como canal primario.

⸻

💰 Modelo de Negocio & Pricing

**Modelo Original**:
 • Starter: €20/mes
 • Pro: €40/mes
 • Enterprise: Custom

**Modelo Revisado (basado en validación de mercado)**:
 • **Free**: €0/mes - 100 mensajes, 1 usuario (hook de adopción)
 • **Growth**: €15/mes - 1,000 mensajes, integraciones básicas
 • **Professional**: €35/mes - 3,000 mensajes, IA incluida, multiusuario
 • **Scale**: €75/mes - Mensajes ilimitados, API access, prioridad soporte

**Justificación del cambio**:
 • Tier gratuito esencial para reducir fricción inicial
 • Precio de entrada más bajo aumenta conversión
 • Estructura permite upsell natural por uso

⸻

🚀 Go-To-Market (Revisado)

**Estrategia: FOCO en UN canal primero** (no dual)

**Opción A - Inbound Focus (Recomendada)**:
 • Presupuesto: €1,500-2,000/mes (no €200-300)
 • Un vertical, una ciudad (ej: Restaurantes en Madrid)
 • Campañas Google Ads + Meta Ads ultra-targeted
 • KPIs realistas:
   • CTR: 1-1.5% (no 2%)
   • Conversión landing: 2-4% (no 10%)
   • CPL: €50-80 (no €30)
   • CAC real: €100-150

**Opción B - Outbound Only** (si presupuesto limitado):
 • 100% LinkedIn + cold email
 • 50 prospects/día manual outreach
 • Herramientas: €200/mes
 • Conversión realista: 1-2%

**Decisión clave**: NO hacer ambas en paralelo - dispersa recursos y atención

⸻

⚙️ Operaciones & Recursos Clave
 • Infraestructura: Next.js 15, Clean Architecture, Vertical Slices, Redux/RTKQ, shadcn/ui.
 • Integración con BSPs (Twilio, Respond.io) para onboarding y mensajería.
 • Herramientas outbound: Instantly.ai / Lemlist.
 • Soporte: canal directo (Slack/WhatsApp grupo) para beta testers.

⸻

⚖️ Legal / Regulatorio
 • Restricciones Meta: no replicar WhatsApp oficial → app compañera + dashboard.
 • GDPR: cold email solo B2B segmentado + opt-out claro.
 • Uso de datos: transparencia en analítica, sin PII en tracking.

⸻

📈 Finanzas Básicas & KPIs (Actualizado con Realismo)

**Métricas Originales vs Realistas**:
 • CAC: ~~€30~~ → **€80-150** (realista)
 • LTV: ~~€360~~ → **€250-400** (considerando churn real)
 • LTV/CAC: ~~1:10~~ → **1:3 (objetivo)** 1:2 (mínimo viable)

**KPIs Críticos Nuevos**:
 • **Time to Value**: <30 minutos desde registro
 • **Activation Rate**: >60% completan onboarding
 • **Weekly Active Users**: >40% de usuarios
 • **Churn mensual**: <10% (crítico para LTV)
 • **NPS**: >40 (indicador de PMF)
 • **Payback Period**: <6 meses

**Métricas de Validación Pre-MVP**:
 • Problem validation: >70% confirma dolor
 • Pricing validation: >30% acepta pagar
 • Lead quality: >40% con score >60

⸻

🛣 Roadmap Realista 0–12 meses

**Fase 1 (Mes 1): Validación**
 • 30+ customer interviews
 • Landing con A/B testing
 • €1,000 en ads para validación real
 • Decision point: Continue/Pivot/Kill

**Fase 2 (Mes 2-4): MVP Development**
 • Core backend + WhatsApp integration
 • Dashboard básico funcional
 • NO incluir IA inicialmente (no es crítico)
 • 3-5 beta testers (no 20)

**Fase 3 (Mes 5-6): Beta Privada**
 • 10 usuarios beta máximo (manejable)
 • Iteración sobre feedback real
 • Primeros 3-5 clientes pagando
 • Refinamiento de producto

**Fase 4 (Mes 7-9): Product-Market Fit**
 • 30-50 clientes objetivo
 • MRR €1,000-2,000
 • Automatización de procesos
 • Decisión: Scale/Funding/Exit

**Fase 5 (Mes 10-12): Escala Inicial**
 • 100+ clientes si PMF confirmado
 • Verticalización solo si hay tracción
 • Hiring primeras personas si revenue lo permite

⸻

⚠️ Riesgos & Mitigaciones (Ampliado)

**Riesgos Originales**:
 • Legal/Meta: riesgo prohibición → app compañera, no cliente
 • Spam/GDPR: outbound muy segmentado + opt-out
 • Costes IA/mensajes: empaquetar en tiers con límites
 • Falsos positivos validación: onboarding ficticio debe reflejar fricción real

**Riesgos Críticos Adicionales Identificados**:
 • **Competencia copia app móvil**: Barrera baja, fácil de replicar en 6 meses
   → Mitigación: Crear network effects y data moat
 • **CAC > LTV**: Riesgo de unit economics negativos
   → Mitigación: Foco obsesivo en retención y referrals
 • **Complejidad técnica subestimada**: WhatsApp API + multitenancy complejo
   → Mitigación: Considerar partnership con BSP existente
 • **Churn alto primeros meses**: Producto inmaduro puede quemar mercado
   → Mitigación: Beta muy controlada, no escalar prematuramente
 • **Funding necesario**: Puede necesitar capital antes de break-even
   → Mitigación: Revenue-based financing o bootstrap más lento

⸻

💡 Ideas / Alternativas / Pivotes
 • Verticalizar 100%: “WhatsApp para Dentistas”, “WhatsApp para Restaurantes”.
 • Ofrecer IA avanzada como add-on (ej. ChatGPT integrado).
 • Futuro BSP propio → control de costes.
 • Canal inbound SEO con blog de casos sectoriales (Payload CMS).

⸻

❓ Supuestos Críticos & Preguntas para Validación

**Preguntas Originales**:
 • ¿Los usuarios aceptan un pricing de €20–40/mes?
 • ¿El onboarding ficticio refleja suficientemente la fricción real?
 • ¿Dentistas/restaurantes/ocio infantil son los segmentos con mayor urgencia?
 • ¿La IA es el driver principal de adopción o solo un nice-to-have?

**Preguntas Críticas Adicionales**:
 • ¿Cuál es el VERDADERO costo de adquisición con conversión real <2%?
 • ¿Qué % de pymes YA pagan por herramientas similares?
 • ¿Cuánto tiempo/dinero pierden REALMENTE por no automatizar?
 • ¿Prefieren solución completa o integración con herramientas existentes?
 • ¿El fundador puede dedicar 100% o necesita mantener ingresos?
 • ¿Qué pasa cuando Wati/Respond.io lancen app móvil?
 • ¿Hay disposición para pagar setup inicial además de mensualidad?
 • ¿Es mejor white-label para agencias que venta directa?

⸻

📚 Fuentes
 • Meta Docs: WhatsApp Cloud API – condiciones de uso.
 • Wati, Zoko, 360dialog, Respond.io – modelos y precios de mercado.
 • GDPR (cold email B2B, interés legítimo).
 • Dominio: caetaria.com
