
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5"></div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
          Tus Metas, a un <span className="text-primary">Hábito de Distancia.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Usa la gamificación para construir hábitos duraderos. Gana XP, sube de nivel y alcanza tus metas con tu coach de IA. Empieza a construir la vida que deseas.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Comenzar Ahora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
