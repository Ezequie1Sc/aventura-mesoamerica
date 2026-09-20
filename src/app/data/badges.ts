import { Badge } from '../core/models/badge.model';

export const BADGES: Badge[] = [
  {
    id: 'pase-aventura',
    name: 'Pase Aventura Mesoamérica',
    description:
      '¡Completaste tu aventura y demostraste un gran conocimiento sobre Mesoamérica!',
    minScore: 6,
    maxScore: 6,
  },
  {
    id: 'explorador',
    name: 'Explorador del Conocimiento',
    description:
      '¡Muy bien! Descubriste muchos secretos de las culturas de Mesoamérica.',
    minScore: 4,
    maxScore: 5,
  },
  {
    id: 'aprendiz',
    name: 'Aprendiz de Mesoamérica',
    description:
      '¡Buen comienzo! Sigue explorando para aprender más sobre Mesoamérica.',
    minScore: 2,
    maxScore: 3,
  },
  {
    id: 'semilla',
    name: 'Semilla del Conocimiento',
    description:
      'Toda gran aventura comienza con un primer paso. ¡Sigue aprendiendo y explorando!',
    minScore: 0,
    maxScore: 1,
  },
];