import { MessageCircle, Settings, UserPlus } from '@/lib/icons';

const steps = [
  {
    title: 'Regístrate',
    description: 'Cuenta gratis en 2 minutos',
    icon: UserPlus
  },
  {
    title: 'Conecta',
    description: 'Vincula tu WhatsApp Business',
    icon: Settings
  },
  {
    title: 'Automatiza',
    description: 'Tu bot responde automáticamente',
    icon: MessageCircle
  }
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Simple Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Comienza en 3 simples pasos
          </h2>
        </div>

        {/* Simple Steps - Layout Horizontal */}
        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-6">
              {/* Icon simple al lado */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Texto simple */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}