
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Users } from 'lucide-react';

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Retos a tu Medida',
    description: 'Define retos con duración personalizada y sigue tu progreso en un calendario interactivo.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Sube de Nivel',
    description: 'Gana XP por cada día completado, sube de rango y mantén tus rachas de días consecutivos.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Tu Coach IA',
    description: 'Chatea con tu coach de IA para obtener orientación y retos personalizados que te mantengan motivado.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">¿Por qué Habitica?</h2>
          <p className="mt-2 text-muted-foreground">
            Fusionamos la ciencia de los hábitos con la diversión de un juego para que construyas tu mejor versión.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
