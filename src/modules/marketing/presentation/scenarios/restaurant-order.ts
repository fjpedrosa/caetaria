/**
 * Restaurant Order Scenario
 * Showcases WhatsApp Product Catalog and Shopping Cart features
 */

import type { ConversationScenario } from '@/modules/marketing/domain/types/whatsapp-features.types';

export const restaurantOrderScenario: ConversationScenario = {
  id: 'restaurant-orders',
  title: 'Pedidos de Restaurante',
  businessName: 'Burger Express',
  businessType: 'Restaurante Delivery',
  description: 'Sistema de pedidos con catálogo de productos y carrito de compras',
  features: ['Product Catalog', 'Shopping Cart', 'List Messages', 'Quick Reply Buttons'],
  duration: 35000,
  messages: [
    {
      id: '1',
      type: 'text',
      sender: 'customer',
      content: 'Hola, quiero pedir comida a domicilio',
      timestamp: Date.now(),
      status: 'read',
      delay: 1000
    },
    {
      id: '2',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'welcome-order',
        type: 'marketing',
        header: {
          type: 'image',
          content: '/images/burger-banner.jpg'
        },
        body: '🍔 ¡Bienvenido a Burger Express!\n\n¡Tenemos las mejores hamburguesas de la ciudad! 🎉\n\n🚚 Delivery GRATIS en pedidos superiores a 20€\n⏱️ Tiempo estimado: 25-35 minutos\n🔥 Ofertas especiales del día disponibles',
        footer: 'Abierto hasta las 23:00',
        buttons: [
          {
            id: 'catalog',
            text: '🍔 Ver Menú',
            icon: '🍔'
          },
          {
            id: 'offers',
            text: '🏷️ Ofertas del día',
            icon: '🏷️'
          },
          {
            id: 'track',
            text: '📍 Seguir pedido',
            icon: '📍'
          }
        ]
      }
    },
    {
      id: '3',
      type: 'text',
      sender: 'customer',
      content: 'Ver Menú',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '4',
      type: 'list',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      listMessage: {
        id: 'menu-categories',
        header: '📋 Nuestro Menú',
        body: 'Explora nuestras deliciosas categorías. Cada producto incluye foto, descripción y precio.\n\nToca el botón para ver todas las opciones 👇',
        footer: 'Precios incluyen IVA',
        buttonText: 'Ver Categorías',
        sections: [
          {
            title: '🍔 HAMBURGUESAS',
            rows: [
              {
                id: 'classic',
                title: 'Hamburguesas Clásicas',
                description: 'Beef, Cheese, BBQ',
                icon: '🍔'
              },
              {
                id: 'gourmet',
                title: 'Hamburguesas Gourmet',
                description: 'Trufa, Wagyu, Foie',
                icon: '🥩'
              },
              {
                id: 'veggie',
                title: 'Opciones Vegetarianas',
                description: 'Beyond, Lentejas, Quinoa',
                icon: '🥗'
              }
            ]
          },
          {
            title: '🍟 ACOMPAÑAMIENTOS',
            rows: [
              {
                id: 'fries',
                title: 'Patatas y Snacks',
                description: 'Fritas, Bravas, Onion Rings',
                icon: '🍟'
              },
              {
                id: 'salads',
                title: 'Ensaladas',
                description: 'César, Mixta, Coleslaw',
                icon: '🥗'
              }
            ]
          },
          {
            title: '🥤 BEBIDAS',
            rows: [
              {
                id: 'sodas',
                title: 'Refrescos',
                description: 'Coca-Cola, Fanta, Sprite',
                icon: '🥤'
              },
              {
                id: 'beers',
                title: 'Cervezas',
                description: 'Nacional, Importada, Artesanal',
                icon: '🍺'
              }
            ]
          }
        ]
      }
    },
    {
      id: '5',
      type: 'text',
      sender: 'customer',
      content: 'Hamburguesas Gourmet',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '6',
      type: 'text',
      sender: 'bot',
      content: '¡Excelente elección! 🌟 Te muestro nuestras hamburguesas gourmet premium:',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '7',
      type: 'catalog',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      catalog: [
        {
          id: 'wagyu-deluxe',
          name: 'Wagyu Deluxe',
          description: 'Carne Wagyu 200g, queso cheddar añejo, cebolla caramelizada, salsa trufa',
          price: 18.90,
          currency: '€',
          imageUrl: '/images/wagyu-burger.jpg',
          category: 'Gourmet',
          inStock: true,
          badge: 'Más vendida'
        },
        {
          id: 'truffle-supreme',
          name: 'Truffle Supreme',
          description: 'Angus 180g, queso brie, rúcula, aceite de trufa negra, pan brioche',
          price: 16.50,
          currency: '€',
          imageUrl: '/images/truffle-burger.jpg',
          category: 'Gourmet',
          inStock: true,
          badge: 'Chef recomienda'
        },
        {
          id: 'foie-royale',
          name: 'Foie Royale',
          description: 'Black Angus 200g, foie gras, cebolla confitada, reducción de oporto',
          price: 22.90,
          currency: '€',
          imageUrl: '/images/foie-burger.jpg',
          category: 'Gourmet',
          inStock: true,
          badge: 'Premium'
        },
        {
          id: 'blue-cheese',
          name: 'Blue Cheese Master',
          description: 'Doble carne 250g, queso azul, bacon crujiente, miel de mostaza',
          price: 15.90,
          currency: '€',
          imageUrl: '/images/blue-burger.jpg',
          category: 'Gourmet',
          inStock: true
        },
        {
          id: 'mexican-fire',
          name: 'Mexican Fire',
          description: 'Carne especiada 180g, jalapeños, guacamole, nachos, salsa picante',
          price: 14.90,
          currency: '€',
          imageUrl: '/images/mexican-burger.jpg',
          category: 'Gourmet',
          inStock: false,
          badge: 'Agotado'
        },
        {
          id: 'bbq-bacon',
          name: 'BBQ Bacon Explosion',
          description: 'Doble bacon, carne 200g, aros de cebolla, salsa BBQ casera',
          price: 17.50,
          currency: '€',
          imageUrl: '/images/bbq-burger.jpg',
          category: 'Gourmet',
          inStock: true,
          badge: 'Nuevo'
        }
      ]
    },
    {
      id: '8',
      type: 'text',
      sender: 'customer',
      content: '🛒 Añadido al carrito:\n• Wagyu Deluxe x1\n• Truffle Supreme x2',
      timestamp: Date.now(),
      status: 'read',
      delay: 5000
    },
    {
      id: '9',
      type: 'text',
      sender: 'bot',
      content: '¡Genial! He añadido esas hamburguesas a tu carrito 🛒\n\n¿Quieres añadir algún acompañamiento o bebida?',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '10',
      type: 'quick-reply',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1000,
      quickReplyButtons: [
        {
          id: 'add-fries',
          text: '🍟 Añadir patatas',
          icon: '🍟'
        },
        {
          id: 'add-drinks',
          text: '🥤 Añadir bebidas',
          icon: '🥤'
        },
        {
          id: 'view-cart',
          text: '🛒 Ver carrito',
          icon: '🛒'
        }
      ]
    },
    {
      id: '11',
      type: 'text',
      sender: 'customer',
      content: 'Ver carrito',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '12',
      type: 'cart',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500,
      cart: {
        items: [
          {
            product: {
              id: 'wagyu-deluxe',
              name: 'Wagyu Deluxe',
              description: 'Carne Wagyu 200g, queso cheddar añejo',
              price: 18.90,
              currency: '€',
              imageUrl: '/images/wagyu-burger.jpg',
              category: 'Gourmet',
              inStock: true
            },
            quantity: 1
          },
          {
            product: {
              id: 'truffle-supreme',
              name: 'Truffle Supreme',
              description: 'Angus 180g, queso brie, aceite de trufa',
              price: 16.50,
              currency: '€',
              imageUrl: '/images/truffle-burger.jpg',
              category: 'Gourmet',
              inStock: true
            },
            quantity: 2
          }
        ],
        total: 51.90,
        currency: '€',
        itemCount: 3
      }
    },
    {
      id: '13',
      type: 'text',
      sender: 'customer',
      content: 'Proceder al pago',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '14',
      type: 'flow',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      flow: {
        id: 'checkout-flow',
        title: 'Datos de Entrega',
        description: 'Por favor, completa los datos para el envío',
        steps: [
          {
            id: 'name',
            type: 'text-input',
            label: 'Nombre',
            placeholder: 'Tu nombre completo',
            required: true
          },
          {
            id: 'phone',
            type: 'text-input',
            label: 'Teléfono',
            placeholder: '+34 600 000 000',
            required: true,
            validation: {
              pattern: '^\\+?[0-9]{9,15}$',
              message: 'Introduce un número de teléfono válido'
            }
          },
          {
            id: 'address',
            type: 'text-input',
            label: 'Dirección de entrega',
            placeholder: 'Calle, número, piso...',
            required: true
          },
          {
            id: 'payment',
            type: 'single-select',
            label: 'Método de pago',
            required: true,
            options: [
              { id: 'cash', label: '💵 Efectivo', value: 'cash' },
              { id: 'card', label: '💳 Tarjeta al recibir', value: 'card' },
              { id: 'online', label: '💳 Pago online', value: 'online' }
            ]
          },
          {
            id: 'notes',
            type: 'text-input',
            label: 'Instrucciones de entrega',
            placeholder: 'Ej: Timbre 2B, portal azul',
            required: false
          }
        ],
        submitButton: {
          text: 'Confirmar Pedido',
          color: '#25D366'
        }
      }
    },
    {
      id: '15',
      type: 'text',
      sender: 'customer',
      content: '✅ Pedido confirmado',
      timestamp: Date.now(),
      status: 'read',
      delay: 6000
    },
    {
      id: '16',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'order-confirmation',
        type: 'utility',
        header: {
          type: 'text',
          content: '✅ PEDIDO CONFIRMADO #2024-0815'
        },
        body: '¡Tu pedido está en camino! 🚚\n\n📦 **Resumen del pedido:**\n• 1x Wagyu Deluxe - 18.90€\n• 2x Truffle Supreme - 33.00€\n\n💰 **Total:** 51.90€\n📍 **Dirección:** Calle Mayor 15, 2B\n⏱️ **Tiempo estimado:** 25-35 minutos\n\n🎁 ¡Hemos añadido una bebida GRATIS por tu primera compra!',
        footer: 'Gracias por tu pedido',
        callToAction: {
          type: 'url',
          text: '📍 Seguir pedido en tiempo real',
          value: 'https://track.burgerexpress.com/2024-0815'
        }
      }
    },
    {
      id: '17',
      type: 'text',
      sender: 'bot',
      content: '💡 *¿Sabías que?*\n\nCon el Catálogo de Productos de WhatsApp, tus clientes pueden navegar, seleccionar y comprar sin salir del chat. Esto aumenta las ventas en un 45% y reduce el abandono del carrito en un 60%.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    }
  ]
};