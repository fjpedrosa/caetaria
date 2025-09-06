/**
 * Restaurant Orders Scenario
 * Simulation for food ordering and delivery via WhatsApp
 */

import { ShoppingBag } from 'lucide-react';

import {
  BaseMessage,
  FlowDefinition,
  SimulationType
} from '../types/simulation.types';

import { BaseScenario } from './base-scenario';

/**
 * Restaurant Orders Scenario Implementation
 */
export default class RestaurantOrdersScenario extends BaseScenario {
  id: SimulationType = 'restaurant-orders';
  name = 'Pedidos a Domicilio';
  businessName = 'Pizza Express';
  description = 'Sistema de pedidos 24/7 sin comisiones';
  icon = ShoppingBag as any;
  duration = 30000;

  messages: BaseMessage[] = [
    this.createMessage(
      'ro-1',
      'customer',
      'Hola, quiero hacer un pedido a domicilio'
    ),
    this.createMessage(
      'ro-2',
      'bot',
      '¡Hola! 👋 Bienvenido a Pizza Express\n\n¡Perfecto! Estaré encantado de ayudarte con tu pedido 🍕\n\n¿Prefieres ver nuestra carta completa o te muestro las ofertas del día?'
    ),
    this.createMessage(
      'ro-3',
      'customer',
      'Las ofertas del día por favor'
    ),
    this.createMessage(
      'ro-4',
      'bot',
      '🔥 OFERTAS DEL DÍA 🔥\n\n1️⃣ MENÚ DÚO - 19,90€\n• 2 Pizzas medianas\n• 2 Bebidas\n• Pan de ajo gratis\n\n2️⃣ MENÚ FAMILIAR - 32,90€\n• 2 Pizzas familiares\n• 4 Bebidas\n• Alitas de pollo (6 uds)\n\n3️⃣ MARTES LOCO - 2x1\n• En todas las pizzas medianas\n• Solo hoy hasta las 23:00\n\n¿Cuál te interesa? O prefieres ver la carta completa 📋'
    ),
    this.createMessage(
      'ro-5',
      'customer',
      'Me interesa el menú dúo'
    ),
    this.createMessage(
      'ro-6',
      'bot',
      'Excelente elección! El MENÚ DÚO 🍕🍕\n\nElige tus 2 pizzas medianas:\n• 🍕 Margarita\n• 🥓 Carbonara\n• 🍖 BBQ\n• 🌶️ Diabla\n• 🧀 4 Quesos\n• 🥬 Vegetariana\n• 🍄 Campesina\n• 🐟 Marinera\n\n¿Cuáles prefieres?'
    ),
    this.createMessage(
      'ro-7',
      'customer',
      'Una BBQ y una 4 Quesos'
    ),
    this.createMessage(
      'ro-8',
      'bot',
      '¡Perfecto! BBQ y 4 Quesos 👌\n\n¿Y las bebidas? Puedes elegir 2:\n• Coca-Cola\n• Coca-Cola Zero\n• Fanta Naranja\n• Fanta Limón\n• Aquarius\n• Cerveza\n• Agua'
    ),
    this.createMessage(
      'ro-9',
      'customer',
      'Dos Coca-Colas normales'
    ),
    this.createMessage(
      'ro-10',
      'bot',
      '📝 Tu pedido:\n• Pizza BBQ mediana\n• Pizza 4 Quesos mediana\n• 2x Coca-Cola\n• Pan de ajo (GRATIS)\n\n💰 Total: 19,90€\n\n📍 ¿Cuál es tu dirección de entrega?'
    ),
    this.createMessage(
      'ro-11',
      'customer',
      'Calle Mayor 25, 3°B. El portal es el azul'
    ),
    this.createMessage(
      'ro-12',
      'bot',
      '✅ Dirección guardada: Calle Mayor 25, 3°B\n\n💳 Método de pago:\n• Efectivo (cambio exacto recomendado)\n• Tarjeta al repartidor\n• Pago online (te envío link seguro)\n\n¿Cómo prefieres pagar?'
    ),
    this.createMessage(
      'ro-13',
      'customer',
      'Con tarjeta al repartidor'
    ),
    this.createMessage(
      'ro-14',
      'bot',
      '¡Perfecto! Pedido confirmado ✅\n\n🎯 RESUMEN:\n• Menú Dúo: 19,90€\n• Dirección: Calle Mayor 25, 3°B\n• Pago: Tarjeta al repartidor\n\n⏱️ Tiempo estimado: 25-35 minutos\n\n📱 Te enviaré actualizaciones:\n• Cuando salga de cocina\n• Cuando el repartidor esté en camino\n• Cuando llegue a tu portal\n\n¿Alguna indicación especial para el repartidor?'
    ),
    this.createMessage(
      'ro-15',
      'customer',
      'No, todo perfecto. Gracias!'
    ),
    this.createMessage(
      'ro-16',
      'bot',
      '¡De nada! Tu pedido ya está en cocina 👨‍🍳\n\nN° Pedido: #2847\n\n🔔 Te avisaré en unos minutos cuando salga a reparto.\n\n¡Que aproveche! 🍕😋'
    )
  ];

  flows: FlowDefinition[] = [
    {
      id: 'menu-flow',
      trigger: 'auto',
      triggerDelay: 8000,
      steps: [
        {
          id: 'category',
          type: 'selection',
          title: '¿Qué te apetece hoy?',
          subtitle: 'Elige una categoría',
          options: [
            { id: 'pizzas', label: '🍕 Pizzas', value: 'pizzas' },
            { id: 'hamburgers', label: '🍔 Hamburguesas', value: 'hamburgers' },
            { id: 'pastas', label: '🍝 Pastas', value: 'pastas' },
            { id: 'salads', label: '🥗 Ensaladas', value: 'salads' },
            { id: 'desserts', label: '🍰 Postres', value: 'desserts' },
            { id: 'drinks', label: '🥤 Bebidas', value: 'drinks' },
            { id: 'offers', label: '🔥 Ofertas', value: 'offers' }
          ]
        },
        {
          id: 'products',
          type: 'multi-select',
          title: 'Selecciona tus productos',
          subtitle: 'Puedes elegir varios',
          options: [
            { id: 'pizza-marg', label: 'Pizza Margarita - 8,90€', value: 'pizza-marg' },
            { id: 'pizza-bbq', label: 'Pizza BBQ - 10,90€', value: 'pizza-bbq' },
            { id: 'pizza-4cheese', label: 'Pizza 4 Quesos - 11,90€', value: 'pizza-4cheese' },
            { id: 'pizza-veg', label: 'Pizza Vegetariana - 9,90€', value: 'pizza-veg' }
          ]
        },
        {
          id: 'size',
          type: 'selection',
          title: 'Tamaño de las pizzas',
          options: [
            { id: 'personal', label: 'Personal (20cm) - Normal', value: 'personal' },
            { id: 'medium', label: 'Mediana (28cm) +2€', value: 'medium' },
            { id: 'familiar', label: 'Familiar (35cm) +4€', value: 'familiar' }
          ]
        },
        {
          id: 'extras',
          type: 'multi-select',
          title: '¿Algún extra?',
          subtitle: 'Opcional',
          options: [
            { id: 'extra-cheese', label: 'Extra queso +1,50€', value: 'extra-cheese' },
            { id: 'stuffed-crust', label: 'Borde relleno +2€', value: 'stuffed-crust' },
            { id: 'garlic-bread', label: 'Pan de ajo +3,50€', value: 'garlic-bread' },
            { id: 'wings', label: 'Alitas (6 uds) +5,90€', value: 'wings' }
          ]
        },
        {
          id: 'delivery-address',
          type: 'input',
          title: 'Dirección de entrega',
          placeholder: 'Calle, número, piso...',
          validation: (value: string) => {
            if (!value || value.length < 10) {
              return 'Por favor, introduce una dirección completa';
            }
            return true;
          }
        },
        {
          id: 'delivery-time',
          type: 'selection',
          title: '¿Cuándo lo quieres?',
          options: [
            { id: 'asap', label: 'Lo antes posible (25-35 min)', value: 'asap' },
            { id: 'in-1h', label: 'En 1 hora', value: '60' },
            { id: 'in-2h', label: 'En 2 horas', value: '120' },
            { id: 'scheduled', label: 'Programar hora exacta', value: 'scheduled' }
          ]
        },
        {
          id: 'payment',
          type: 'selection',
          title: 'Método de pago',
          options: [
            { id: 'cash', label: '💵 Efectivo', value: 'cash' },
            { id: 'card', label: '💳 Tarjeta al repartidor', value: 'card' },
            { id: 'online', label: '📱 Pago online', value: 'online' }
          ]
        },
        {
          id: 'order-confirmation',
          type: 'confirmation',
          title: '¡Pedido confirmado! 🎉',
          subtitle: 'Llegará en 25-35 minutos'
        }
      ]
    }
  ];
}