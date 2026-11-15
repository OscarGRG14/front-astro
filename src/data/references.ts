// src/data/references.ts
export interface Reference {
  id: number
  title: string
  detail: string
  url: string
  source: string
  category: 'Programas NASA' | 'Estándares NASA' | 'Datos abiertos' | 'Instrumentos clínicos'
}

/**
 * Bibliografía y fuentes del proyecto.
 * Los umbrales del motor de alertas, la taxonomía de riesgos y el diseño de
 * telemetría se basan en documentación pública de la NASA e instrumentos
 * clínicos validados y de acceso abierto.
 */
export const REFERENCES: Reference[] = [
  {
    id: 1,
    title: '5 Hazards of Human Spaceflight',
    detail: 'Taxonomía oficial de los 5 peligros para la salud en vuelo espacial: radiación, aislamiento y confinamiento, distancia de la Tierra, gravedad alterada y ambientes cerrados/hostiles. Base conceptual de los módulos de AstroHealth.',
    url: 'https://www.nasa.gov/hrp/hazards/',
    source: 'NASA · Human Research Program',
    category: 'Programas NASA',
  },
  {
    id: 2,
    title: 'Human Research Program (HRP)',
    detail: 'Programa de NASA dedicado a proteger la salud y el desempeño de astronautas. Fuente de los elementos de investigación: salud conductual, contramedidas y radiación espacial.',
    url: 'https://www.nasa.gov/hrp/',
    source: 'NASA · HRP',
    category: 'Programas NASA',
  },
  {
    id: 3,
    title: 'Human Research Roadmap — Risks',
    detail: 'Catálogo de riesgos de sistemas humanos evaluados por el Human System Risk Board: cognitivo-conductuales, condiciones médicas en misión, sueño y carga de trabajo, entre otros.',
    url: 'https://humanresearchroadmap.nasa.gov/risks/',
    source: 'NASA · HRR',
    category: 'Programas NASA',
  },
  {
    id: 4,
    title: 'Human Research Roadmap — Evidence Reports',
    detail: 'Reportes basados en evidencia para cada riesgo definido en el Program Requirements Document (PRD). Referencia para las reglas y severidades del motor de alertas.',
    url: 'https://humanresearchroadmap.nasa.gov/Evidence/',
    source: 'NASA · HRR',
    category: 'Programas NASA',
  },
  {
    id: 5,
    title: 'NASA-STD-3001 Vol. 1 — Crew Health',
    detail: 'Estándar técnico de la NASA con requisitos uniformes para salud de la tripulación, atención médica y operaciones. Referencia de umbrales clínicos y registros de salud.',
    url: 'https://standards.nasa.gov/standard/NASA/NASA-STD-3001_VOL_1',
    source: 'NASA · OCHMO',
    category: 'Estándares NASA',
  },
  {
    id: 6,
    title: 'NASA-STD-3001 Vol. 2 — Human Factors, Habitability & Environmental Health',
    detail: 'Requisitos de factores humanos, habitabilidad y salud ambiental del vehículo: calidad de aire, límites de CO2, temperatura y humedad de cabina.',
    url: 'https://standards.nasa.gov/standard/NASA/NASA-STD-3001_VOL_2',
    source: 'NASA · OCHMO',
    category: 'Estándares NASA',
  },
  {
    id: 7,
    title: 'Open Science Data Repository (OSDR)',
    detail: 'Repositorio de acceso abierto de datos multimodales de ciencias de la vida en el espacio: ómicas, fisiología, comportamiento y telemetría ambiental de misiones reales.',
    url: 'https://science.nasa.gov/biological-physical/data/osdr/',
    source: 'NASA Science',
    category: 'Datos abiertos',
  },
  {
    id: 8,
    title: 'OSDR / GeneLab — Visualization Portal',
    detail: 'Portal interactivo para explorar datasets biológicos de vuelo espacial (RNA-Seq, telemetría) filtrando por metadatos entre estudios.',
    url: 'https://visualization.genelab.nasa.gov/data/',
    source: 'NASA · GeneLab',
    category: 'Datos abiertos',
  },
  {
    id: 9,
    title: 'NASA Open Data Portal',
    detail: 'Catálogo público de datasets de la NASA: decenas de miles de colecciones de datos disponibles sin costo para investigación y aplicaciones.',
    url: 'https://data.nasa.gov',
    source: 'NASA',
    category: 'Datos abiertos',
  },
  {
    id: 10,
    title: 'NASA Technical Reports Server (NTRS)',
    detail: 'Biblioteca técnica pública con reportes científicos, documentos de conferencia y estudios históricos de medicina aeroespacial.',
    url: 'https://ntrs.nasa.gov',
    source: 'NASA',
    category: 'Datos abiertos',
  },
  {
    id: 11,
    title: 'PHQ-9 — Patient Health Questionnaire',
    detail: 'Kroenke K, Spitzer RL, Williams JBW. "The PHQ-9: validity of a brief depression severity measure." J Gen Intern Med. 2001;16(9):606-613. Instrumento de tamizaje de depresión usado en el módulo conductual.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/11556941/',
    source: 'PubMed / JGIM',
    category: 'Instrumentos clínicos',
  },
  {
    id: 12,
    title: 'GAD-7 — Generalized Anxiety Disorder 7',
    detail: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. "A brief measure for assessing generalized anxiety disorder." Arch Intern Med. 2006;166(10):1092-1097. Tamizaje de ansiedad para monitoreo de aislamiento.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16717171/',
    source: 'PubMed / Arch Intern Med',
    category: 'Instrumentos clínicos',
  },
  {
    id: 13,
    title: 'PSS — Perceived Stress Scale',
    detail: 'Cohen S, Kamarck T, Mermelstein R. "A global measure of perceived stress." J Health Soc Behav. 1983;24(4):385-396. Escala de estrés percibido aplicada al astronauta.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6668417/',
    source: 'PubMed / JHSB',
    category: 'Instrumentos clínicos',
  },
]

export const REFERENCE_CATEGORIES = ['Programas NASA', 'Estándares NASA', 'Datos abiertos', 'Instrumentos clínicos'] as const
