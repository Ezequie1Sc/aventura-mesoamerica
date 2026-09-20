import { Question } from '../core/models/question.model';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '¿Mesoamérica era un solo pueblo o una supercivilización?',
    options: [
      {
        id: 'a',
        text: 'Un solo pueblo muy pequeño',
      },
      {
        id: 'b',
        text: 'Una gran supercivilización con muchas culturas diferentes',
      },
      {
        id: 'c',
        text: 'Un país de Europa',
      },
    ],
    correctAnswer: 'b',
    explanation:
      'Mesoamérica no era un solo pueblo. Fue una región donde vivieron muchas culturas diferentes, cada una con sus propias costumbres y tradiciones.',
  },
  {
    id: 2,
    question: '¿Cuáles de las siguientes fueron culturas que vivieron en Mesoamérica?',
    options: [
      {
        id: 'a',
        text: 'Los egipcios y los vikingos',
      },
      {
        id: 'b',
        text: 'Los mayas, olmecas, zapotecas y mexicas',
      },
      {
        id: 'c',
        text: 'Los romanos y los griegos',
      },
    ],
    correctAnswer: 'b',
    explanation:
      'Los mayas, olmecas, zapotecas y mexicas fueron algunas de las grandes culturas que se desarrollaron en Mesoamérica.',
  },
  {
    id: 3,
    question: '¿Cuál era el alimento principal y más sagrado de los pueblos de Mesoamérica?',
    options: [
      {
        id: 'a',
        text: 'Maíz',
      },
      {
        id: 'b',
        text: 'Pan',
      },
      {
        id: 'c',
        text: 'Zanahorias',
      },
    ],
    correctAnswer: 'a',
    explanation:
      'El maíz era fundamental para la alimentación y tenía una gran importancia cultural y religiosa para muchos pueblos mesoamericanos.',
  },
  {
    id: 4,
    question: '¿Los pueblos mesoamericanos eran nómadas?',
    options: [
      {
        id: 'a',
        text: 'Verdadero',
      },
      {
        id: 'b',
        text: 'Falso',
      },
    ],
    correctAnswer: 'b',
    explanation:
      'Los pueblos mesoamericanos desarrollaron comunidades y ciudades permanentes, por lo que no se caracterizaban por ser pueblos nómadas.',
  },
  {
    id: 5,
    question: '¿Con qué semillas pagaban las cosas en Mesoamérica como si fuera dinero?',
    options: [
      {
        id: 'a',
        text: 'Semillas de manzana',
      },
      {
        id: 'b',
        text: 'Semillas de girasol',
      },
      {
        id: 'c',
        text: 'Semillas de cacao',
      },
    ],
    correctAnswer: 'c',
    explanation:
      'Las semillas de cacao fueron utilizadas como medio de intercambio en algunas sociedades mesoamericanas.',
  },
  {
    id: 6,
    question:
      '¿Qué construían los pueblos de Mesoamérica en sus ciudades para estar más cerca de sus dioses?',
    options: [
      {
        id: 'a',
        text: 'Castillos de arena',
      },
      {
        id: 'b',
        text: 'Pirámides de piedra',
      },
      {
        id: 'c',
        text: 'Chozas de paja',
      },
    ],
    correctAnswer: 'b',
    explanation:
      'Las pirámides y templos fueron construcciones importantes en muchas ciudades mesoamericanas y estaban relacionadas con prácticas religiosas y ceremoniales.',
  },
];