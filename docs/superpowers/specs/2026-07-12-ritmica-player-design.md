# Rítmica Player — Diseño

**Fecha:** 2026-07-12  
**Ruta:** `/formacion/ritmica`  
**Contexto:** Sección de Formación Musical de App Alabanza (Next.js 16, App Router, Tailwind, diseño brutalist)

---

## Objetivo

Digitalizar el capítulo "8. Figuras musicales y tiempo" del Curso Práctico de Generalidades Musicales (págs. 26–31), convirtiendo los 5 ejercicios rítmicos del PDF en una herramienta interactiva con audio reproducible y apoyo visual en tiempo real. Incluye también un constructor de patrones personalizados.

---

## Arquitectura de archivos

```
nextapp/src/app/(app)/formacion/ritmica/
  page.tsx              ← server component mínimo (sin await, sin fetch)
  RitmicaPage.tsx       ← client component principal ('use client')
  useMetronome.ts       ← hook Web Audio API con lookahead scheduler
  exercises.ts          ← data de los 5 ejercicios codificados del PDF
```

**Modificaciones a archivos existentes:**
- `formacion/page.tsx` → agregar card "Figuras y Tiempo" → `/formacion/ritmica`

---

## Modelo de datos (`exercises.ts`)

```typescript
type Figure = {
  syllable: string    // "Taaaa" | "Taa" | "Ta" | "Taka" | "Takadimi" | "mhm" | "Silencio"
  beats: number       // 4=redonda, 2=blanca, 1=negra, 0.5=corchea, 0.25=semi-corchea
  isSilence: boolean
}

type Measure = Figure[]  // suma de beats debe ser siempre 4 (métrica 4/4)

type Exercise = {
  id: string
  label: string       // "Calentamiento" | "Ejercicio 1" ... "Ejercicio 4"
  bpm: number         // 70 (todos empiezan en 70)
  measures: Measure[]
}
```

Los 5 ejercicios (Calentamiento + Ej. 1–4) se codifican exactamente como aparecen en el PDF.

---

## Motor de audio (`useMetronome.ts`)

**Web Audio API puro, sin dependencias externas.**

### Dos sonidos

| Sonido | Tipo onda | Frecuencia | Duración | Uso |
|--------|-----------|-----------|---------|-----|
| Click metrónomo | Cuadrada | 880 Hz (beat 1: 1200 Hz) | 15 ms | Cada beat de negra |
| Tono figura | Senoidal | 440 Hz | 80 ms con fade-out | Cada figura (no silencio) |

Ambos togeleables independientemente. El beat 1 de cada compás usa frecuencia más alta para marcar el acento.

### Scheduler lookahead (patrón Chris Wilson)

```
LOOKAHEAD_MS = 25ms   (intervalo setInterval)
SCHEDULE_AHEAD = 0.1s (ventana de programación)

scheduler():
  mientras nextNoteTime < currentTime + SCHEDULE_AHEAD:
    scheduleNote(currentEvent, nextNoteTime)
    avanzar al siguiente evento
  timerID = setTimeout(scheduler, LOOKAHEAD_MS)
```

- Las notas se programan con `AudioContext.currentTime` exacto → sin drift
- El update visual se dispara con `setTimeout(updateUI, delay_ms)` calculado desde `currentTime`
- `AudioContext` se crea en el primer click de Play (requisito iOS)

### Tiempo por subdivisión

En 4/4 a N BPM:
- 1 beat (negra) = `60 / N` segundos
- 1 semi-corchea = `60 / N / 4` segundos
- La redonda ocupa `4 * (60 / N)` segundos

---

## Componente principal (`RitmicaPage.tsx`)

### Secciones de UI

**1. Selector de ejercicio**  
Pills horizontales con scroll: `Calentamiento · Ej.1 · Ej.2 · Ej.3 · Ej.4 · Personalizado`

**2. Barra de controles** (sticky bottom en mobile, fija arriba en desktop)
```
[−5]  [BPM]  [+5]    [▶/■]    [🔔 toggle]  [♩ toggle]
```
- BPM: editable, mínimo 40, máximo 240, incrementos de 5
- ▶ Play / ■ Stop (no pause — reset al inicio)
- Toggle metrónomo: activo por defecto
- Toggle figuras: activo por defecto

**3. Grid de compases**  
- Cada compás = fila con número de compás y sus figuras
- Cada figura = caja con sílaba (Ta / Taa / Taaaa / Taka / Takadimi / mhm)
- Estado visual:
  - **Inactivo**: borde negro, fondo blanco
  - **Compás activo**: borde negro + fondo gris claro en la fila
  - **Figura activa**: fondo negro, sílaba en blanco
  - **Silencio activo**: borde punteado, sin fondo negro

**4. Sección "Personalizado"**  
- Paleta de figuras: botones para agregar Redonda / Blanca / Negra / Corchea / Semi-corchea / Silencio de Negra / Silencio de Corchea
- Contador de beats restantes en el compás actual (de 4)
- Botón "+ Compás" (solo si el compás actual está completo)
- Botón "× Eliminar" en cada compás
- Validación: no se puede agregar figura si excede 4 beats en el compás
- El player usa los mismos controles y scheduler

---

## Estado del componente

```typescript
const [exerciseId, setExerciseId]     // "calentamiento" | "ej1"... | "custom"
const [bpm, setBpm]                   // number, default 70
const [isPlaying, setIsPlaying]       // boolean
const [currentMeasure, setCurrentMeasure]  // number index
const [currentFigure, setCurrentFigure]    // number index within measure
const [metroOn, setMetroOn]           // boolean, default true
const [figureOn, setFigureOn]         // boolean, default true
const [customMeasures, setCustomMeasures]  // Measure[]
```

---

## Comportamiento del player

- **Play**: crea AudioContext si no existe, inicia scheduler desde compás 0 figura 0
- **Stop**: cancela scheduler, resetea `currentMeasure` y `currentFigure` a 0
- **Fin de ejercicio**: loop automático al inicio
- **Cambio de BPM mientras suena**: el scheduler usa el nuevo valor en el siguiente ciclo
- **Cambio de ejercicio mientras suena**: Stop automático

---

## Flujo del scheduler (detalle)

Cada "evento" en la secuencia tiene:
- `time`: `AudioContext.currentTime` cuando debe sonar
- `measureIdx`: para update visual
- `figureIdx`: para update visual
- `isSilence`: si es silencio, no suena tono figura
- `isDownbeat`: si es beat 1, el click de metrónomo va con acento

El scheduler itera sobre `measures[i].figures[j]`, calcula el `time` acumulado, programa ambos sonidos (según toggles), luego usa `setTimeout` para despachar el update de React al momento correcto.

---

## Acceso desde Formación

`/formacion/page.tsx` agrega un card idéntico al de "Grados Musicales":
- Ícono: `Timer` (lucide)
- Título: "Figuras y Tiempo"
- Subtítulo: "Metrónomo, ejercicios rítmicos y constructor de patrones"
- Link: `/formacion/ritmica`

---

## Lo que NO incluye (YAGNI)

- No guarda progreso en DB (ejercicio stateless)
- No exporta MIDI ni audio
- No tiene notación musical visual (solo sílabas de texto)
- No tiene modo "quiz" (validar si el usuario golpeó en tiempo)
