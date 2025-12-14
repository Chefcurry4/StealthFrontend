// Lab research category definitions with keywords for matching

export interface LabCategory {
  id: string;
  name: string;
  keywords: RegExp;
  color: string; // Fallback gradient color
}

export const LAB_CATEGORIES: LabCategory[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    keywords: /artificial intelligence|machine learning|neural|deep learning|nlp|natural language|computer vision|ai\b|ml\b|data science|big data|analytics/i,
    color: 'from-violet-500 via-purple-500 to-fuchsia-500'
  },
  {
    id: 'robotics',
    name: 'Robotics & Automation',
    keywords: /robot|automation|mechatronics|motion control|autonomous|drone|uav|manipulator/i,
    color: 'from-cyan-500 via-blue-500 to-indigo-500'
  },
  {
    id: 'architecture',
    name: 'Architecture & Design',
    keywords: /architect|urban|building design|heritage|typology|construction|spatial|housing|landscape/i,
    color: 'from-amber-500 via-orange-500 to-red-500'
  },
  {
    id: 'biomedical',
    name: 'Biomedical & Life Sciences',
    keywords: /biomedical|cancer|medical|imaging|therapy|diagnostics|biology|genetic|cell|tissue|pharma|drug/i,
    color: 'from-rose-500 via-pink-500 to-fuchsia-500'
  },
  {
    id: 'chemistry',
    name: 'Chemistry & Materials',
    keywords: /chemistry|catalysis|synthesis|molecular|polymer|material|composite|nano|crystal/i,
    color: 'from-emerald-500 via-green-500 to-teal-500'
  },
  {
    id: 'physics',
    name: 'Physics & Optics',
    keywords: /physics|astrophysics|cosmology|photonics|optics|laser|plasma|particle|spectroscopy/i,
    color: 'from-blue-500 via-indigo-500 to-violet-500'
  },
  {
    id: 'quantum',
    name: 'Quantum Science',
    keywords: /quantum|qubits|quantum computing|superconducting|quantum mechanics/i,
    color: 'from-purple-600 via-violet-600 to-indigo-600'
  },
  {
    id: 'environment',
    name: 'Environmental Science',
    keywords: /environmental|climate|atmospheric|ecology|sustainability|hydrology|water|pollution|ecosystem/i,
    color: 'from-green-500 via-emerald-500 to-teal-500'
  },
  {
    id: 'mathematics',
    name: 'Mathematics & Statistics',
    keywords: /mathematics|statistics|algorithm|numerical|optimization|probability|stochastic|geometry/i,
    color: 'from-slate-500 via-gray-500 to-zinc-500'
  },
  {
    id: 'cs-security',
    name: 'Computer Science & Security',
    keywords: /computer science|cybersecurity|formal methods|verification|cryptography|network|software|distributed/i,
    color: 'from-gray-600 via-slate-600 to-zinc-600'
  },
  {
    id: 'energy',
    name: 'Energy Systems',
    keywords: /energy|solar|fuel cell|battery|power system|renewable|electric|grid|thermal/i,
    color: 'from-yellow-500 via-amber-500 to-orange-500'
  },
  {
    id: 'mechanical',
    name: 'Mechanical & Civil Engineering',
    keywords: /mechanical|structural|fluid dynamics|thermodynamics|civil|geotechnical|bridge|infrastructure/i,
    color: 'from-stone-500 via-neutral-500 to-zinc-500'
  },
  {
    id: 'neuroscience',
    name: 'Neuroscience',
    keywords: /neuro|brain|cognition|neural systems|cognitive|psychology|perception/i,
    color: 'from-pink-500 via-rose-500 to-red-500'
  },
  {
    id: 'electronics',
    name: 'Electronics & Semiconductors',
    keywords: /electronics|semiconductor|mems|microelectronics|integrated circuit|chip|sensor|signal/i,
    color: 'from-sky-500 via-blue-500 to-cyan-500'
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    keywords: /telecom|wireless|communication|antenna|radio|5g|signal processing|network/i,
    color: 'from-indigo-500 via-blue-500 to-sky-500'
  },
  {
    id: 'transportation',
    name: 'Transportation & Mobility',
    keywords: /transport|mobility|traffic|vehicle|rail|automotive|logistics|aviation/i,
    color: 'from-blue-600 via-indigo-600 to-violet-600'
  }
];

export const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All Domains' },
  ...LAB_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))
];

/**
 * Detects the best matching category for a lab based on its topics and faculty match
 */
export function detectLabCategory(topics: string | null, facultyMatch: string | null): LabCategory | null {
  const combined = `${topics || ''} ${facultyMatch || ''}`.toLowerCase();
  
  if (!combined.trim()) return null;
  
  // Find the first matching category
  for (const category of LAB_CATEGORIES) {
    if (category.keywords.test(combined)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Gets the category ID for a lab, or 'default' if no match
 */
export function getLabCategoryId(topics: string | null, facultyMatch: string | null): string {
  const category = detectLabCategory(topics, facultyMatch);
  return category?.id || 'default';
}
