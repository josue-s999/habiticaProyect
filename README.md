# Habitica - Tu Coach de Hábitos Gamificado

Habitica es una aplicación web diseñada para ayudarte a construir y mantener hábitos positivos de una manera divertida y motivadora. La aplicación utiliza la gamificación, asignando rangos a medida que completas retos en diversas categorías, y cuenta con un coach de IA personalizado para guiarte en tu viaje.

## 🎯 El Problema que Resolvemos

Muchas personas luchan por construir y mantener hábitos positivos. Los principales obstáculos suelen ser:

*   **Falta de Motivación:** La emoción inicial se desvanece y la rutina se vuelve monótona.
*   **Objetivos Poco Claros:** Metas vagas como "quiero ser más saludable" son difíciles de convertir en acciones diarias.
*   **Estancamiento:** La falta de un camino claro de progreso hace que los usuarios se sientan estancados y abandonen.
*   **Enfoque Aislado:** Intentar cambiar hábitos en solitario puede ser un desafío sin un sistema de apoyo o guía.

**Habitica** ataca estos problemas de frente combinando la ciencia de la formación de hábitos con la gamificación para mantener a los usuarios comprometidos, y un coach de IA que proporciona planes de acción claros y personalizados.

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con un stack moderno y robusto, enfocado en el rendimiento y la experiencia de desarrollo.

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://reactjs.org/)
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Base de Datos**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Inteligencia Artificial**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
-   **Fechas**: `date-fns`
-   **Formularios**: `react-hook-form` con `zod` para validación.

## 📁 Estructura del Proyecto

El código fuente está organizado de la siguiente manera para mantener la claridad y escalabilidad.

```
src
├── ai
│   ├── flows/            # Flujos de Genkit para la lógica de IA.
│   └── genkit.ts         # Configuración global de Genkit.
├── app
│   ├── (main)/           # Rutas principales de la aplicación (protegidas).
│   │   ├── home/         # Página de inicio con los retos del usuario.
│   │   ├── ranks/        # Página del sistema de rangos.
│   │   └── layout.tsx    # Layout principal con sidebar y header.
│   ├── login/            # Ruta para la página de inicio de sesión/registro.
│   ├── page.tsx          # Página de aterrizaje (landing page).
│   ├── globals.css       # Estilos globales y temas de ShadCN/UI.
│   └── layout.tsx        # Layout raíz de la aplicación.
├── components
│   ├── auth/             # Componentes para autenticación (formularios, botones).
│   ├── landing/          # Componentes de la página de aterrizaje.
│   ├── ui/               # Componentes base de ShadCN/UI (Button, Card, etc.).
│   └── *.tsx             # Componentes específicos (AIChatPanel, HabitProgress, etc.).
├── hooks
│   ├── use-auth.tsx      # Hook para gestionar el estado de autenticación y datos del usuario.
│   └── use-toast.ts      # Hook para mostrar notificaciones (toasts).
├── lib
│   ├── constants.ts      # Constantes (definiciones de rangos).
│   ├── firebase.ts       # Inicialización y configuración de Firebase.
│   ├── types.ts          # Definiciones de tipos y esquemas de Zod.
│   └── utils.ts          # Funciones de utilidad (cálculo de rachas y rangos).
└── ...
```

## ✨ Características Principales

### 1. Autenticación de Usuarios
-   **Registro e Inicio de Sesión**: Soporte para crear cuentas con correo electrónico y contraseña.
-   **Inicio de Sesión con Google**: Integración con Firebase Authentication para un inicio de sesión rápido.
-   **Gestión de Sesión**: La sesión del usuario se mantiene activa gracias al hook `useAuth`.

### 2. Gestión de Hábitos como Retos
-   **Crear y Eliminar Retos**: Los usuarios pueden añadir nuevos retos o eliminarlos.
-   **Retos Detallados**: Cada reto tiene un nombre, categoría, descripción y una duración específica.
-   **Interfaz Colapsable**: Los retos se pueden minimizar para mantener la interfaz limpia y organizada.

### 3. Seguimiento Diario Interactivo
-   **Seguimiento de Progreso**: Visualiza el avance con una barra de progreso y el conteo de días.
-   **Marcar Días Completados**: Cada día registrado se puede marcar como completado.
-   **Diario de Experiencia**: Los usuarios pueden añadir una nota de texto para cada día del reto.
-   **Historial Compacto**: Por defecto, se muestran las entradas más recientes, con la opción de "Ver historial completo".

### 4. Gamificación por Rangos
-   **Sistema de Rangos por Categorías**: En lugar de solo XP, los usuarios suben de rango al completar un número específico de retos en diferentes categorías (ej. "Salud", "Crecimiento Personal").
-   **Visualización de Progreso**: Una página dedicada a "Rangos" muestra todos los rangos disponibles, los requisitos para alcanzarlos y el progreso actual del usuario.
-   **Rachas (Streaks)**: La aplicación calcula y muestra la racha de días consecutivos completando un hábito.

### 5. Coach de IA Conversacional
-   **Chat con IA**: Un panel de chat permite a los usuarios conversar con "Habitica", un coach de IA amigable y motivador.
-   **Sugerencias Personalizadas**: La IA sugiere retos concretos (nombre, categoría, descripción y duración) que el usuario puede añadir a su lista con un solo clic.

### 6. Comunidad y Soporte
-   **Comunidad de WhatsApp**: Enlaces estratégicos invitan al usuario a unirse a una comunidad de WhatsApp para compartir su progreso y recibir apoyo.

### 7. Tematización Dinámica
-   **Temas por Género**: Al registrarse, los usuarios pueden seleccionar su sexo, lo que asigna un tema de color (azul para masculino, rosa para femenino).
-   **Modo Claro y Oscuro**: Un interruptor permite al usuario cambiar entre un tema claro y uno oscuro en cualquier momento.

## 👥 División de la Página de Aterrizaje

Para facilitar la presentación y el desarrollo, la página de aterrizaje se ha dividido en los siguientes componentes modulares:

-   **Responsable: Harry Gongora**
    -   **Componente:** `src/components/landing/HeroSection.tsx`
    -   **Descripción:** Es la sección principal de bienvenida. Contiene el título, el eslogan y el botón principal de llamada a la acción.

-   **Responsable: Josué Sinisterra**
    -   **Componente:** `src/components/landing/FeaturesSection.tsx`
    -   **Descripción:** Muestra las características clave de la aplicación (Retos, Gamificación, Coach IA) en tarjetas informativas.

-   **Responsable: Oscar Valle**
    -   **Componente:** `src/components/landing/HowItWorksSection.tsx`
    -   **Descripción:** Explica el funcionamiento de la aplicación en tres sencillos pasos, facilitando la comprensión del usuario.

-   **Responsable: Kevin Quintero**
    -   **Componente:** `src/components/landing/CtaSection.tsx`
    -   **Descripción:** Se encarga de la llamada a la acción final para animar al registro e invitar a la comunidad de WhatsApp.

Con esto, tienes una visión completa de la arquitectura y funcionalidades del proyecto Habitica.
