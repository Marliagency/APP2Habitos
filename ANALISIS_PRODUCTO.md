# QYRO — Análisis Completo de Producto
### Base para Buyer Persona y Estrategia de Marketing

---

## 1. ¿QUÉ ES QYRO?

**QYRO** es una aplicación web progresiva (PWA) de gestión de vida y bienestar que funciona como un **sistema operativo personal**. Su propósito central es unificar en una sola plataforma todo lo que una persona necesita para construir hábitos, mejorar su salud física, monitorear su nutrición, entrenar, reflexionar y ser más productiva.

La app corre completamente en el navegador (sin backend propio), almacena los datos localmente en el dispositivo del usuario y ofrece integración opcional con inteligencia artificial (Claude de Anthropic u OpenAI) para análisis personalizados y recomendaciones.

**Tagline:** *"Tu sistema operativo personal"*

---

## 2. PROBLEMA QUE RESUELVE

La mayoría de las personas que quieren mejorar su vida usan entre 5 y 8 apps distintas: una para hábitos, otra para el gym, otra para contar calorías, una más para tareas, otra para journaling. El resultado es **fragmentación**, pérdida de contexto entre áreas y abandono prematuro.

**QYRO resuelve esto consolidando todo en un único ecosistema coherente**, donde los hábitos alimentan los objetivos, los entrenamientos actualizan las métricas de cuerpo, el journal nutre el estado de ánimo del dashboard, y la IA tiene visibilidad de todo para dar recomendaciones realmente útiles.

---

## 3. MÓDULOS Y FUNCIONALIDADES

### 3.1 Dashboard Central
- **Life Score (0–100):** puntuación agregada que refleja el desempeño semanal en hábitos, entrenamientos, nutrición y estado de ánimo.
- **Anillos de Actividad:** visualización estilo Apple Activity Rings para hábitos, entrenamientos y nutrición.
- **KPIs Semanales:** % hábitos completados, número de entrenamientos, calorías promedio, nivel de ánimo.
- **Accesos rápidos:** diario, tareas, nutrición, objetivos.
- **Resumen semanal en tarjeta:** estado de la semana de un vistazo.

### 3.2 Vista "Hoy"
- Lista de hábitos del día con barra de progreso global.
- Registro de ánimo y energía del día.
- Seguimiento de macronutrientes del día (calorías, proteína, carbohidratos, grasa).
- Mensaje de cierre cuando todos los hábitos están completados ("All done!").

### 3.3 Hábitos
- Creación de hábitos personalizados o desde una biblioteca de **+30 presets** curados.
- Categorías: mente, cuerpo, enfoque, conocimiento, nutrición, social, otros.
- Frecuencia configurable: diaria, semanal, X veces por semana.
- Tipos: booleano (sí/no) o conteo (cantidad con unidad).
- Recordatorios con horario.
- Seguimiento de rachas (actual y más larga).
- Tasas de completado a 7 y 30 días.
- Opción de marcar como "saltado" con motivo.

### 3.4 Entrenamientos
- Constructor de entrenamientos con series, pesos, repeticiones y RPE.
- Tipos de serie: calentamiento, trabajo, dropset, fallo, AMRAP, myo-rep.
- Biblioteca de ejercicios con grupos musculares y equipamiento.
- Seguimiento de **Récords Personales (PRs)** con cálculo de 1RM.
- Plantillas y planes semanales.
- Recomendaciones de sobrecarga progresiva.
- Métricas corporales (peso, composición).
- Puntuación de fatiga.

### 3.5 Nutrición
- Registro de comidas por categoría: desayuno, almuerzo, cena, snacks.
- **Múltiples métodos de entrada:**
  - Análisis de foto con IA
  - Entrada por voz
  - Escaneo de código de barras
  - Entrada manual
- Seguimiento de macros: calorías, proteína, carbohidratos, grasa, fibra, azúcar, sodio.
- Objetivos nutricionales personalizados (calculados con fórmula Mifflin-St Jeor).
- Plantillas de comidas reutilizables.
- Historial de peso corporal con notas.

### 3.6 Journal / Diario
- Entradas de diario con título y contenido libre.
- Registro de ánimo (1–5) y energía (1–5).
- Etiquetas temáticas: gratitud, reto, logro, aprendizaje, reflexión, relaciones, salud, trabajo, objetivos.
- **Prompts generados por IA** como seguimiento de la entrada.
- Calendario de ánimo con mapa de calor (56+ días).
- Gráficas de tendencias de ánimo a 30 días.

### 3.7 Tareas
- Gestión de tareas con niveles de prioridad: baja, media, alta, urgente.
- Estados: por hacer, en progreso, hecha, archivada.
- Fechas límite, subtareas, etiquetas.
- Tareas recurrentes (diaria, semanal, mensual).
- Búsqueda y filtrado avanzado.

### 3.8 Objetivos
- **Asistente de configuración de objetivos** en 6 intenciones de vida:
  - Perder grasa
  - Ganar músculo
  - Mejorar salud general
  - Aumentar productividad
  - Reducir estrés
  - Rendimiento atlético
- Perfil corporal (edad, sexo, altura, peso, nivel de actividad).
- Presupuesto de tiempo semanal para hábitos y entrenamientos.
- **Derivación automática** de objetivos nutricionales, ejercicios recomendados, hábitos sugeridos y prompts de diario.
- Puntuación de progreso hacia el objetivo.

### 3.9 Analytics
- Radar de "Life Score" por área.
- Mapa de calor de ánimo (56 días).
- Volumen y frecuencia de entrenamiento.
- Distribución muscular trabajada.
- Top PRs y progresión de 1RM por ejercicio.
- Tendencias de ánimo y energía.

### 3.10 Asistente IA
- Conversación en lenguaje natural con Claude (Anthropic) u OpenAI.
- Accede en tiempo real a: hábitos, entrenamientos, nutrición, ánimo, objetivos.
- Puede **crear hábitos directamente** desde la conversación.
- Prompts predefinidos: "Analiza mi semana", "Rutina matutina", "Plan nutricional", etc.
- Recomendaciones personalizadas basadas en el historial real del usuario.

---

## 4. FLUJO DE USUARIO

### Onboarding (8 pasos)
1. Pantalla de splash con branding
2. Pantalla de bienvenida (registro / login)
3. Registro con email y contraseña
4. Selección de sexo biológico
5. Fecha de nacimiento
6. Altura (cm)
7. Peso actual y peso objetivo (kg)
8. Nivel de actividad física
9. Objetivo principal de la app
10. Pantalla de completado → acceso al dashboard

### Bucle Diario
Dashboard → Vista "Hoy" → Completar hábitos → Registrar comidas → Anotar en el diario → Revisar KPIs

### Bucle Semanal
Dashboard semanal → Analytics → Ajustar objetivos → Conversación con IA → Planificar siguiente semana

---

## 5. MECANISMOS DE ENGAGEMENT Y GAMIFICACIÓN

| Mecanismo | Descripción |
|---|---|
| **Life Score** | Puntuación 0–100 que motiva a mantener todas las áreas activas |
| **Rachas** | Conteo de días consecutivos con hábitos cumplidos |
| **Anillos de actividad** | Feedback visual inmediato de progreso diario |
| **Tasas de completado** | % a 7 y 30 días por hábito |
| **Tendencias** | Indicadores de subida/bajada del score semanal |
| **Calendario de ánimo** | Mapa de calor que hace visible el patrón emocional |
| **Prompts de IA** | Preguntas generadas para profundizar en el diario |
| **Logros semanales** | Visualización de rachas y mejores semanas |
| **Mensaje de cierre** | Celebración cuando se completan todos los hábitos del día |

---

## 6. STACK TÉCNICO (RESUMEN)

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | TailwindCSS + Framer Motion |
| Estado | Zustand + React Query |
| Persistencia | IndexedDB (local, sin backend) |
| Gráficas | Recharts + D3 |
| IA | Claude (Anthropic) / OpenAI API |
| PWA | Vite PWA Plugin |
| Idioma | Español (es-ES) |
| Plataforma | Web + móvil (PWA instalable) |

---

## 7. MODELO DE NEGOCIO ACTUAL

- **Freemium sin restricciones visibles:** todas las funciones están disponibles sin pago.
- **Sin backend propio:** los datos se guardan localmente en el dispositivo.
- **IA bajo modelo BYOK (Bring Your Own Key):** el usuario debe aportar su propia API Key de Claude u OpenAI para usar el asistente.
- **Sin suscripción activa:** la monetización aún no está implementada en el código.

**Oportunidad clara:** el modelo BYOK limita el acceso a IA para usuarios no técnicos. Una capa de suscripción que incluya IA sin configuración técnica sería el paso natural de monetización.

---

## 8. FORTALEZAS DEL PRODUCTO

1. **Todo en uno real:** pocas apps integran hábitos + gym + nutrición + diario + tareas + IA en una sola experiencia coherente.
2. **IA con contexto completo:** el asistente conoce TODO el perfil del usuario, no solo un área.
3. **Privacidad por diseño:** datos 100% locales, sin envío a servidores propios.
4. **Onboarding personalizado:** el wizard inicial genera objetivos derivados automáticamente.
5. **Diseño mobile-first:** PWA instalable, funciona como app nativa en el teléfono.
6. **Idioma español:** mercado hispanohablante desatendido en el segmento premium de wellness.
7. **Presets curados:** +30 hábitos listos para usar reducen la fricción inicial.
8. **Analítica rica:** el usuario puede ver su progreso con gráficas detalladas.

---

## 9. DEBILIDADES / ÁREAS DE MEJORA

1. **Sin sincronización en la nube:** si el usuario cambia de dispositivo pierde sus datos.
2. **IA requiere API Key propia:** barrera técnica significativa para el usuario promedio.
3. **Sin componente social:** no hay comunidad, retos compartidos ni comparación con amigos.
4. **Sin notificaciones push nativas** (limitación de PWA en iOS/Android sin app nativa).
5. **Sin monetización activa:** no genera ingresos directos actualmente.
6. **Dependencia de auto-entrada de datos:** el usuario debe registrar todo manualmente (excepto con IA de foto).

---

## 10. ANÁLISIS DE BUYER PERSONA

### Persona Principal — "El Optimizador Consciente"

**Perfil demográfico:**
- Edad: 22–38 años
- Sexo: mixto (leve inclinación masculina por el módulo de gym, femenina por journal/nutrición)
- Ubicación: ciudades medianas y grandes de habla hispana (México, España, Argentina, Colombia, Chile)
- Nivel socioeconómico: medio-alto
- Educación: universitaria o técnica superior
- Ocupación: profesional, emprendedor, freelancer, estudiante universitario avanzado

**Perfil psicográfico:**
- Se identifica con el movimiento de auto-mejora (self-improvement)
- Sigue contenido de productividad, bienestar y fitness en redes sociales
- Ha probado otras apps de hábitos o gym y las abandonó por fragmentación o falta de contexto
- Valora la privacidad de sus datos
- Le interesa la tecnología y no le asusta configurar una API Key (early adopter)
- Busca resultados visibles y medibles, no motivación vacía
- Tiene objetivos concretos: bajar % de grasa, ganar masa muscular, ser más consistente, reducir ansiedad
- Siente que "debería estar más organizado/a" y la app responde a esa culpa productiva
- Es disciplinado/a o aspira a serlo: no busca que la app lo haga todo, busca que le ayude a no olvidar y a ver el progreso

**Comportamientos digitales:**
- Usa TikTok, YouTube o podcasts de productividad, fitness o filosofía estoica
- Sigue cuentas de "morning routines", "clean eating", "powerlifting", "habit stacking"
- Ha visto el libro *Atomic Habits* de James Clear o contenido relacionado
- Compara apps antes de quedarse con una (lee reviews, ve demos)
- Dispuesto a pagar por herramientas que realmente use

**Pain points que QYRO resuelve directamente:**
- "Tengo 5 apps distintas y no las uso todas"
- "Empiezo hábitos y los abandono en 2 semanas"
- "No sé si mi entrenamiento está progresando"
- "Como sin control porque no registro lo que como"
- "Siento que no avanzo aunque me esfuerzo"
- "Quiero una app que entienda mis metas, no solo que registre datos"

---

### Persona Secundaria — "La Persona en Transición"

**Perfil:**
- Edad: 28–45 años
- Acaba de tomar una decisión de vida importante: empezar a cuidarse, dejar el sedentarismo, manejar el estrés post-trabajo, o retomar el gym tras años de pausa.
- Menos técnica que la persona principal.
- Necesita más estructura y guía.
- Valora que la app le diga *qué hacer*, no solo registrar lo que hace.
- Es el perfil que más se beneficiaría de la IA integrada sin BYOK.

---

## 11. POSICIONAMIENTO DE MARCA

**Posicionamiento sugerido:**
> *QYRO no es una app de hábitos. Es el lugar donde tu versión mejorada vive.*

**Contra quién se posiciona:**

| Competidor | Diferencial de QYRO |
|---|---|
| Habitica | Sin gamificación infantil; datos reales y analítica seria |
| MyFitnessPal | Integra hábitos, gym, ánimo y IA; no solo calorías |
| Strong / Hevy | Integra todo el estilo de vida, no solo el gym |
| Notion / Obsidian | Interfaz de bienestar específica, no blank canvas |
| Whoop / Garmin | Sin hardware requerido; igual nivel de insight |
| ChatGPT | IA con contexto REAL de tu vida, no sesión genérica |

---

## 12. ESTRATEGIA DE MARKETING — RECOMENDACIONES

### 12.1 Canales prioritarios

1. **TikTok / Instagram Reels** — Demostraciones de la app en acción (morning routine con QYRO, análisis semanal con IA, dashboard después de 30 días). Formato: screen recordings + voz en off + música trending.

2. **YouTube** — Tutoriales de 5–10 min: "Cómo uso QYRO para mis objetivos de 2025", "La app que reemplazó mis 6 apps de fitness". Colaboraciones con creadores de productividad hispanohablantes.

3. **Reddit / comunidades** — Subreddits: r/habitica, r/productivity, r/leangains, r/getmotivated (versiones en español). Publicaciones orgánicas de usuarios reales.

4. **Newsletters de productividad en español** — Patrocinios en newsletters como Lazy Leverage, El Orden Correcto, etc.

5. **Product Hunt** — Lanzamiento en Product Hunt con landing en inglés para exposición global.

### 12.2 Mensajes clave por objetivo

| Objetivo del usuario | Mensaje |
|---|---|
| Ganar músculo | "Tu gym, tu dieta y tu progreso en un solo lugar. Qyro sabe cuánto levantaste ayer." |
| Perder grasa | "Foto a tu plato, IA que cuenta las calorías. Así de fácil con Qyro." |
| Ser más productivo | "¿5 apps distintas? Una sola. Qyro unifica tus hábitos, tareas y metas." |
| Reducir estrés | "El diario que sabe cómo te has sentido los últimos 30 días. Qyro te ayuda a entenderte." |
| Mejorar hábitos | "El 80% de la gente abandona sus hábitos en 2 semanas. Qyro cambia eso." |

### 12.3 Estrategia de contenido orgánico

**Pilares de contenido:**
1. **Demostración** — Capturas reales de la app usándose (dashboard real, análisis de IA, streak de 30 días).
2. **Educación** — "Por qué fallas en tus hábitos" / "Cómo trackear calorías sin obsesionarte".
3. **Inspiración** — Transformaciones de uso (antes: 5 apps y caos / después: QYRO y claridad).
4. **Comunidad** — Retos semanales, publicar el "Life Score" de la semana.
5. **Detrás de escena** — El proceso de construir la app, features en desarrollo, decisiones de diseño.

### 12.4 Monetización recomendada

**Plan freemium:**
- **Gratis:** Hábitos, Tareas, Diario básico, Dashboard.
- **QYRO Pro (~$7–9 USD/mes):**
  - IA integrada sin necesidad de API Key propia.
  - Sincronización en la nube.
  - Analytics avanzados (más de 30 días).
  - Exportación de datos (PDF, CSV).
  - Widgets de sistema.

**Argumento de venta del Pro:** *"La IA que conoce toda tu vida, sin configurar nada."*

---

## 13. RESUMEN EJECUTIVO

QYRO es un producto con propuesta de valor sólida y diferenciada en un mercado hispanohablante que carece de opciones premium de gestión de vida integrada. Su fortaleza principal es la **cohesión**: todo comunica con todo, y la IA tiene visibilidad de toda la vida del usuario.

El perfil de usuario ideal es una persona de 22–38 años, urbana, hispanohablante, orientada a la auto-mejora, que ha sentido la frustración de usar múltiples apps sin consistencia. Esta persona está dispuesta a pagar por una solución que realmente funcione.

La estrategia de marketing debe apostar por **contenido visual en redes sociales** que muestre la app en uso real, con énfasis en el "antes y después" de tener todo fragmentado versus unificado. La IA integrada (sin barreras técnicas) es el principal gancho de conversión a versión de pago.

**Próximos pasos críticos:**
1. Resolver la sincronización en la nube (sin esto, la retención a largo plazo es frágil).
2. Lanzar IA sin BYOK como feature Pro para monetizar.
3. Crear landing page en español con capturas reales y propuesta de valor clara.
4. Producir 10–15 videos cortos de demostración real para TikTok/Instagram.
5. Lanzar en Product Hunt con soporte de comunidad.

---

*Documento generado: Mayo 2026*
*Basado en análisis completo del código fuente de QYRO v1.0*
