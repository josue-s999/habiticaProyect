
'use client';

import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Simple, Intuitivo y Poderoso</h2>
            <p className="mt-4 text-muted-foreground">
              Comienza tu viaje en tres sencillos pasos. Nuestra plataforma está diseñada para que te enfoques en lo que importa: tu progreso.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">1. Elige tu Reto</h3>
                  <p className="text-muted-foreground">Selecciona un reto o crea uno con ayuda de la IA para que se adapte a tus metas.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">2. Registra tu Avance</h3>
                  <p className="text-muted-foreground">Con un clic, marca tus tareas completadas y anota tus experiencias en el diario.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">3. Gana y Conecta</h3>
                  <p className="text-muted-foreground">Observa cómo crecen tu XP y rachas. Únete a los foros para compartir tu viaje.</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <Image
              src="https://picsum.photos/600/400"
              alt="Panel de la aplicación Habitica"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="app interface"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
