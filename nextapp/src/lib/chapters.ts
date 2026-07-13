export interface Chapter {
  index:  number
  label:  string
  part:   string
  title:  string
  author: string
  page:   number   // book page number = PDF page number
  desc:   string
}

export const CHAPTERS: Chapter[] = [
  {
    index:  0,
    label:  'Prefacio',
    part:   '',
    title:  'Prefacio',
    author: 'Fabio Rossi',
    page:   7,
    desc:   'Introducción al libro: por qué la adoración verdadera importa y qué encontrarás en estas páginas.',
  },
  {
    index:  1,
    label:  'Capítulo 1',
    part:   'Sobre el ministerio de alabanza',
    title:  'La adoración y la alabanza según la Biblia',
    author: 'Andrés Birch',
    page:   11,
    desc:   'Un estudio bíblico sobre qué significa adorar a Dios en espíritu y en verdad, y cómo la Escritura define la alabanza.',
  },
  {
    index:  2,
    label:  'Capítulo 2',
    part:   'Sobre el ministerio de alabanza',
    title:  'La prioridad del evangelio en la adoración',
    author: 'Andrés Contreras',
    page:   21,
    desc:   'Cómo el evangelio de Jesucristo debe ser el centro que da forma y dirección a todo nuestro ministerio de adoración.',
  },
  {
    index:  3,
    label:  'Capítulo 3',
    part:   'Sobre el ministerio de alabanza',
    title:  '5 palabras esenciales para todo ministerio de alabanza',
    author: 'Sergio Villanueva',
    page:   29,
    desc:   'Cinco conceptos clave que todo líder y equipo de alabanza debe conocer para servir con fidelidad a la iglesia.',
  },
  {
    index:  4,
    label:  'Capítulo 4',
    part:   'Sobre el canto congregacional',
    title:  '¡Dios quiere que Su pueblo le alabe cantando!',
    author: 'Sugel Michelén',
    page:   41,
    desc:   'El mandato bíblico del canto congregacional y por qué la iglesia debe cantar junta con convicción y gozo.',
  },
  {
    index:  5,
    label:  'Capítulo 5',
    part:   'Sobre el canto congregacional',
    title:  '7 principios para la adoración congregacional',
    author: 'Juan Sánchez',
    page:   49,
    desc:   'Principios prácticos y teológicos para liderar la adoración de la congregación de manera bíblica y edificante.',
  },
  {
    index:  6,
    label:  'Capítulo 6',
    part:   'Sobre el canto congregacional',
    title:  'Cómo la música contemporánea nos está moldeando, para bien o para mal',
    author: 'Matt Merker',
    page:   57,
    desc:   'Un análisis crítico de cómo la música popular y contemporánea influye en la adoración de la iglesia, para bien y para mal.',
  },
  {
    index:  7,
    label:  'Capítulo 7',
    part:   'Sobre el canto congregacional',
    title:  'Por qué el lamento es importante en la adoración',
    author: 'Josh Lee',
    page:   67,
    desc:   'El lamento es parte integral de la adoración bíblica. Aprende por qué la iglesia necesita recuperar los salmos de lamento.',
  },
  {
    index:  8,
    label:  'Capítulo 8',
    part:   'Sobre el líder de alabanza',
    title:  'El rol del líder de alabanza',
    author: 'Mauricio Velarde',
    page:   77,
    desc:   'Qué es y qué no es el liderazgo de adoración: el carácter, la función y la visión del líder de alabanza en la iglesia.',
  },
  {
    index:  9,
    label:  'Capítulo 9',
    part:   'Sobre el líder de alabanza',
    title:  'Consejo para el líder de alabanza',
    author: 'Mauricio Velarde',
    page:   87,
    desc:   'Orientación práctica para crecer en fidelidad, habilidad y humildad como líder de alabanza.',
  },
  {
    index:  10,
    label:  'Capítulo 10',
    part:   'Sobre el líder de alabanza',
    title:  '¿Pasan los salmos la prueba de la "centralidad del evangelio"?',
    author: 'Philip Revell',
    page:   95,
    desc:   'Reflexión sobre cómo usar los salmos en la adoración contemporánea sin perder el enfoque en Cristo y el evangelio.',
  },
  {
    index:  11,
    label:  'Capítulo 11',
    part:   'Sobre el líder de alabanza',
    title:  'Consejos para preparar las canciones del domingo',
    author: 'Sergio Villanueva',
    page:   101,
    desc:   'Guía práctica para seleccionar, ensayar y presentar las canciones del culto dominical con excelencia y propósito.',
  },
]

export const PARTS = [
  'Sobre el ministerio de alabanza',
  'Sobre el canto congregacional',
  'Sobre el líder de alabanza',
]
