/**
 * Loyalty Program Scenario
 * Showcases automated notifications, points system, and rewards catalog
 */

import type { ConversationScenario } from '@/modules/marketing/domain/types/whatsapp-features.types';

export const loyaltyProgramScenario: ConversationScenario = {
  id: 'loyalty-program',
  title: 'Programa de Fidelización',
  businessName: 'Fashion Store',
  businessType: 'Tienda de Moda',
  description: 'Sistema de puntos y recompensas con notificaciones automatizadas',
  features: ['Points Updates', 'Rewards Catalog', 'Message Templates', 'Product Catalog'],
  duration: 35000,
  messages: [
    {
      id: '1',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1000,
      template: {
        id: 'purchase-complete',
        type: 'utility',
        header: {
          type: 'image',
          content: '/images/fashion-store-logo.jpg'
        },
        body: '🛍️ **¡Gracias por tu compra, Laura!**\n\n✅ Pedido #FS-2024-1891 confirmado\n📦 2 artículos por 89.90€\n🚚 Envío en 24-48 horas\n\n¡Has ganado puntos con esta compra! 🎉',
        footer: 'Fashion Store - Tu estilo, tu vida'
      }
    },
    {
      id: '2',
      type: 'points-update',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      pointsUpdate: {
        previousPoints: 450,
        pointsAdded: 90,
        newTotal: 540,
        reason: 'Compra #FS-2024-1891',
        tier: 'silver',
        nextTierPoints: 460
      },
      content: '🌟 **¡Actualización de Puntos!**\n\n📊 Puntos anteriores: 450\n➕ Puntos ganados: +90\n💎 **Total actual: 540 puntos**\n\n🏆 Nivel: **SILVER**\n📈 Te faltan 460 puntos para alcanzar el nivel GOLD\n\n¡Ya puedes canjear tus puntos por increíbles recompensas!'
    },
    {
      id: '3',
      type: 'quick-reply',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      content: '¿Qué te gustaría hacer con tus puntos?',
      quickReplyButtons: [
        {
          id: 'view-rewards',
          text: '🎁 Ver recompensas',
          icon: '🎁'
        },
        {
          id: 'point-history',
          text: '📊 Mi historial',
          icon: '📊'
        },
        {
          id: 'save-points',
          text: '💰 Seguir acumulando',
          icon: '💰'
        }
      ]
    },
    {
      id: '4',
      type: 'text',
      sender: 'customer',
      content: 'Ver recompensas',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '5',
      type: 'text',
      sender: 'bot',
      content: '¡Excelente! Con tus 540 puntos tienes acceso a estas recompensas exclusivas: 🎁',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '6',
      type: 'catalog',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      catalog: [
        {
          id: 'discount-10',
          name: '10% Descuento',
          description: 'Válido en tu próxima compra sin mínimo',
          price: 200,
          currency: 'puntos',
          imageUrl: '/images/10-discount.jpg',
          category: 'Descuentos',
          inStock: true,
          badge: 'Popular'
        },
        {
          id: 'discount-20',
          name: '20% Descuento',
          description: 'En compras superiores a 50€',
          price: 400,
          currency: 'puntos',
          imageUrl: '/images/20-discount.jpg',
          category: 'Descuentos',
          inStock: true,
          badge: 'Mejor valor'
        },
        {
          id: 'free-shipping',
          name: 'Envío Gratis',
          description: 'En tu próximo pedido',
          price: 150,
          currency: 'puntos',
          imageUrl: '/images/free-shipping.jpg',
          category: 'Servicios',
          inStock: true
        },
        {
          id: 'gift-card-25',
          name: 'Tarjeta Regalo 25€',
          description: 'Para ti o para regalar',
          price: 500,
          currency: 'puntos',
          imageUrl: '/images/gift-25.jpg',
          category: 'Tarjetas',
          inStock: true,
          badge: 'Disponible'
        },
        {
          id: 'vip-access',
          name: 'Acceso VIP Sale',
          description: 'Acceso anticipado a rebajas',
          price: 300,
          currency: 'puntos',
          imageUrl: '/images/vip-access.jpg',
          category: 'Exclusivo',
          inStock: true
        },
        {
          id: 'gift-card-50',
          name: 'Tarjeta Regalo 50€',
          description: 'Valor de 50€ en tienda',
          price: 1000,
          currency: 'puntos',
          imageUrl: '/images/gift-50.jpg',
          category: 'Tarjetas',
          inStock: false,
          badge: 'Necesitas 460 puntos más'
        }
      ]
    },
    {
      id: '7',
      type: 'text',
      sender: 'customer',
      content: 'Quiero canjear la Tarjeta Regalo de 25€',
      timestamp: Date.now(),
      status: 'read',
      delay: 4000
    },
    {
      id: '8',
      type: 'text',
      sender: 'bot',
      content: '¡Perfecta elección! 🎉 Voy a procesar tu canje...',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '9',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2500,
      template: {
        id: 'reward-redeemed',
        type: 'utility',
        header: {
          type: 'image',
          content: '/images/gift-card-success.jpg'
        },
        body: '🎁 **¡Recompensa Canjeada!**\n\n✅ Has canjeado: **Tarjeta Regalo 25€**\n💳 Código: **GIFT-2024-XK9P**\n📧 Te hemos enviado el código por email\n\n💎 Puntos utilizados: 500\n💰 **Saldo actual: 40 puntos**\n\nLa tarjeta es válida por 6 meses y puede usarse en tienda física y online.',
        footer: 'Gracias por ser parte de Fashion Store',
        callToAction: {
          type: 'url',
          text: '🛍️ Usar tarjeta ahora',
          value: 'https://fashionstore.com/apply-gift'
        }
      }
    },
    {
      id: '10',
      type: 'text',
      sender: 'bot',
      content: '--- Una semana después (notificación automatizada) ---',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    },
    {
      id: '11',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'special-offer',
        type: 'marketing',
        header: {
          type: 'image',
          content: '/images/flash-sale.jpg'
        },
        body: '⚡ **Flash Sale Exclusiva para ti, Laura!**\n\n🏆 Como miembro SILVER, tienes acceso anticipado a nuestra venta flash:\n\n• 30% dto. en nueva colección\n• 2x1 en accesorios\n• Puntos DOBLES en todas las compras\n\n⏰ Solo por 48 horas\n🎯 Usa el código: SILVER30',
        footer: 'Oferta válida hasta el 20/12/2024',
        buttons: [
          {
            id: 'shop-now',
            text: '🛍️ Comprar ahora',
            icon: '🛍️'
          },
          {
            id: 'save-offer',
            text: '💾 Guardar oferta',
            icon: '💾'
          }
        ]
      }
    },
    {
      id: '12',
      type: 'text',
      sender: 'customer',
      content: 'Comprar ahora',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '13',
      type: 'catalog',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      catalog: [
        {
          id: 'dress-summer',
          name: 'Vestido Verano Premium',
          description: 'Algodón orgánico, diseño exclusivo',
          price: 49.90,
          currency: '€',
          imageUrl: '/images/dress-summer.jpg',
          category: 'Nueva Colección',
          inStock: true,
          badge: '-30% + Puntos x2'
        },
        {
          id: 'bag-leather',
          name: 'Bolso Cuero Italiano',
          description: 'Hecho a mano, edición limitada',
          price: 89.90,
          currency: '€',
          imageUrl: '/images/bag-leather.jpg',
          category: 'Accesorios',
          inStock: true,
          badge: '2x1 + Puntos x2'
        },
        {
          id: 'shoes-comfort',
          name: 'Zapatos Comfort Plus',
          description: 'Tecnología ergonómica, todo el día',
          price: 69.90,
          currency: '€',
          imageUrl: '/images/shoes-comfort.jpg',
          category: 'Calzado',
          inStock: true,
          badge: '-30% + Puntos x2'
        }
      ]
    },
    {
      id: '14',
      type: 'text',
      sender: 'bot',
      content: '--- Notificación de cumpleaños (automatizada) ---',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    },
    {
      id: '15',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'birthday-surprise',
        type: 'marketing',
        header: {
          type: 'image',
          content: '/images/birthday-celebration.jpg'
        },
        body: '🎂 **¡Feliz Cumpleaños, Laura!** 🎉\n\nEn Fashion Store queremos celebrar contigo con estos regalos especiales:\n\n🎁 **500 puntos GRATIS** (ya añadidos)\n🎫 **Vale 40% descuento** sin mínimo\n🚚 **Envío gratis** todo el mes\n✨ **Acceso VIP** a pre-ventas\n\n¡Que tengas un día maravilloso!',
        footer: 'Regalos válidos por 30 días',
        buttons: [
          {
            id: 'use-birthday',
            text: '🎁 Usar mis regalos',
            icon: '🎁'
          },
          {
            id: 'thank-you',
            text: '💖 ¡Gracias!',
            icon: '💖'
          }
        ]
      }
    },
    {
      id: '16',
      type: 'points-update',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500,
      pointsUpdate: {
        previousPoints: 40,
        pointsAdded: 500,
        newTotal: 540,
        reason: '🎂 Regalo de cumpleaños',
        tier: 'silver',
        nextTierPoints: 460
      },
      content: '🎉 **¡500 puntos de regalo añadidos!**\n\n💎 **Nuevo saldo: 540 puntos**\n\n¡Feliz cumpleaños de parte de todo el equipo de Fashion Store! 🎂'
    },
    {
      id: '17',
      type: 'text',
      sender: 'bot',
      content: '💡 *¿Sabías que?*\n\nLos programas de fidelización por WhatsApp tienen un 85% más de engagement que el email. Las notificaciones automatizadas y personalizadas aumentan las compras repetidas en un 67% y el valor medio del pedido en un 42%.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    }
  ]
};