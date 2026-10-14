import type { PersonalNote } from './types';

export const CLASS_LEVELS = [
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12 / Higher Secondary',
  'Undergraduate / College',
  'Graduate / Professional'
] as const;

export const SUBJECT_OPTIONS = [
  { id: 'cs_ai', name: 'Computer Science & AI', icon: '💻' },
  { id: 'math', name: 'Mathematics & Calculus', icon: '📐' },
  { id: 'physics', name: 'Physics & Mechanics', icon: '⚡' },
  { id: 'chemistry', name: 'Chemistry & Molecular Science', icon: '🧪' },
  { id: 'biology', name: 'Biology & Life Sciences', icon: '🧬' },
  { id: 'economics', name: 'Economics & Data Analysis', icon: '📊' }
] as const;

export function getStarterNotesForProfile(classGrade: string, subject: string): PersonalNote[] {
  const isHighSchool = classGrade.includes('9') || classGrade.includes('10');
  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // 1. Computer Science & AI
  if (subject.includes('Computer') || subject.includes('AI')) {
    if (isHighSchool) {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: 'Introduction to Algorithms & Flowcharts',
          subject: 'Computer Science & AI',
          createdAt: now,
          tags: ['Algorithms', 'Logic', 'Basics'],
          content: `An algorithm is a finite sequence of unambiguous instructions for solving a problem.
1. Characteristics: Inputs, definite steps, finiteness, effectiveness, and produce output.
2. Flowchart symbols: Oval (Start/End), Parallelogram (Input/Output), Rectangle (Process/Operation), Diamond (Decision/Condition).
3. Pseudocode: Informal high-level description of an operating principle written in human-readable notation.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Fundamentals of Python Variables & Loops',
          subject: 'Computer Science & AI',
          createdAt: now,
          tags: ['Python', 'Loops', 'Variables'],
          content: `Python is an interpreted, high-level, dynamically typed programming language.
1. Data Types: int, float, str, bool, list, dict.
2. Iteration: For-loops iterate over sequences (range, list), while while-loops execute conditionally.
3. Functions: Modular code blocks defined using 'def' that accept parameters and return values.`
        }
      ];
    } else {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: 'Optimization Dynamics: Gradient Descent & Loss Landscapes',
          subject: 'Computer Science & AI',
          createdAt: now,
          tags: ['Machine Learning', 'Optimization', 'Calculus'],
          content: `Gradient Descent iteratively optimizes empirical loss J(θ) = (1/2m) * Σ (h_θ(x^(i)) - y^(i))^2.
1. Update rule: θ := θ - α * ∇J(θ)
2. Learning rate α dictates convergence: if α < 2/λ_max the system stably converges; excessive α causes violent cross-ravine bounce and numerical divergence.
3. Momentum introduces velocity accumulation: v_(t+1) = β * v_t + α * ∇J(θ_t), dampening lateral oscillations along steep ravine walls.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Computational Complexity & Asymptotic Notation',
          subject: 'Computer Science & AI',
          createdAt: now,
          tags: ['Algorithms', 'Big-O', 'Data Structures'],
          content: `Asymptotic analysis bounds execution runtime and memory requirements as input size n approaches infinity.
1. Big-O: O(g(n)) represents the asymptotic upper bound.
2. Big-Omega: Ω(g(n)) defines the asymptotic lower bound.
3. Master Theorem: Solves recurrence relations of form T(n) = a*T(n/b) + f(n) common in divide-and-conquer paradigms like Merge Sort and Binary Search.`
        }
      ];
    }
  }

  // 2. Mathematics & Calculus
  if (subject.includes('Math') || subject.includes('Calculus')) {
    if (isHighSchool) {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: 'Quadratic Equations & Roots Analysis',
          subject: 'Mathematics & Calculus',
          createdAt: now,
          tags: ['Algebra', 'Quadratic', 'Formulas'],
          content: `General quadratic equation: ax² + bx + c = 0 (where a ≠ 0).
1. Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)
2. Discriminant D = b² - 4ac dictates the nature of the roots:
   - D > 0: Two distinct real roots.
   - D = 0: Two real and equal roots.
   - D < 0: Complex conjugate non-real roots.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Coordinate Geometry & Straight Lines',
          subject: 'Mathematics & Calculus',
          createdAt: now,
          tags: ['Geometry', 'Cartesian', 'Slope'],
          content: `Cartesian coordinates define points in a 2D Euclidean plane (x, y).
1. Distance Formula: d = √((x₂ - x₁)² + (y₂ - y₁)²)
2. Slope of line m = (y₂ - y₁) / (x₂ - x₁)
3. Standard slope-intercept form: y = mx + c.`
        }
      ];
    } else {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: 'Differential Calculus: Derivatives & Rate of Change',
          subject: 'Mathematics & Calculus',
          createdAt: now,
          tags: ['Calculus', 'Derivatives', 'Optimization'],
          content: `The derivative f'(x) defines the instantaneous rate of change and tangent line slope:
f'(x) = lim_{h->0} [f(x+h) - f(x)] / h
1. Product Rule: d/dx [u*v] = u'*v + u*v'
2. Chain Rule for composite functions: d/dx [f(g(x))] = f'(g(x)) * g'(x)
3. Stationary Points: First derivative f'(x) = 0 identifies local extrema; second derivative f''(x) assesses concavity.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Linear Algebra: Matrices, Determinants & Eigenvalues',
          subject: 'Mathematics & Calculus',
          createdAt: now,
          tags: ['Linear Algebra', 'Matrices', 'Vectors'],
          content: `Matrices represent linear transformations between vector spaces.
1. Determinant det(A) measures volume scaling under transformation.
2. Characteristic equation: det(A - λI) = 0 yields eigenvalues λ.
3. For each eigenvalue λ, the corresponding eigenvector v satisfies: A*v = λ*v.`
        }
      ];
    }
  }

  // 3. Physics & Mechanics
  if (subject.includes('Physics') || subject.includes('Mechanics')) {
    if (isHighSchool) {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: "Newton's Three Laws of Motion",
          subject: 'Physics & Mechanics',
          createdAt: now,
          tags: ['Physics', 'Newton', 'Dynamics'],
          content: `Isaac Newton's laws form the cornerstone of classical dynamics:
1. First Law (Inertia): A body continues in state of rest or uniform motion unless acted upon by external net force.
2. Second Law (Force & Acceleration): F_net = m * a (rate of change of linear momentum).
3. Third Law (Action-Reaction): For every action, there is an equal and opposite reaction.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Gravitation & Planetary Orbits',
          subject: 'Physics & Mechanics',
          createdAt: now,
          tags: ['Gravity', 'Orbits', 'Kepler'],
          content: `Universal Gravitation Law: F = G * (m₁ * m₂) / r² where G ≈ 6.674 × 10⁻¹¹ N·m²/kg².
1. Acceleration due to gravity near Earth's surface: g = G*M / R² ≈ 9.8 m/s².
2. Weight vs Mass: Mass is intrinsic quantity of matter; weight is the gravitational force acting on that mass.`
        }
      ];
    } else {
      return [
        {
          id: `starter_${Date.now()}_1`,
          title: 'Work-Energy Theorem & Conservative Systems',
          subject: 'Physics & Mechanics',
          createdAt: now,
          tags: ['Mechanics', 'Work Energy', 'Conservation'],
          content: `The net work done by all forces on a particle equals the change in its kinetic energy:
W_net = ΔK = (1/2)*m*v_f² - (1/2)*m*v_i²
1. Conservative forces (gravity, electrostatic, spring) can be expressed as negative gradients of potential energy: F = -∇U.
2. Mechanical energy conservation: E_total = K + U remains constant in absence of non-conservative dissipative forces.`
        },
        {
          id: `starter_${Date.now()}_2`,
          title: 'Thermodynamics: Heat Engines & Carnot Limit',
          subject: 'Physics & Mechanics',
          createdAt: now,
          tags: ['Thermodynamics', 'Carnot', 'Entropy'],
          content: `The Second Law of Thermodynamics dictates that total entropy in isolated systems never decreases (dS ≥ 0).
1. Carnot efficiency: η_max = 1 - (T_cold / T_hot) represents the absolute upper bound for heat engines.
2. Real cycle irreversibility: Friction, rapid heat transfer, and turbulence create entropy, strictly degrading real efficiency below the Carnot limit.`
        }
      ];
    }
  }

  // 4. Chemistry & Molecular Science
  if (subject.includes('Chemistry')) {
    return [
      {
        id: `starter_${Date.now()}_1`,
        title: 'Chemical Bonding & Molecular Orbital Geometry',
        subject: 'Chemistry & Molecular Science',
        createdAt: now,
        tags: ['Bonding', 'VSEPR', 'Orbitals'],
        content: `Chemical bonds form to minimize system electrostatic energy.
1. Ionic vs Covalent: Ionic bonds involve complete electron transfer; covalent bonds involve shared electron pairs.
2. VSEPR Theory: Valence shell electron pairs repel, dictating geometric shapes (linear, trigonal planar, tetrahedral, bent).
3. Hybridization: Mixing atomic orbitals (sp, sp², sp³) explains spatial orientations in organic molecules like methane and ethene.`
      },
      {
        id: `starter_${Date.now()}_2`,
        title: 'Chemical Equilibrium & Le Chatelier Principle',
        subject: 'Chemistry & Molecular Science',
        createdAt: now,
        tags: ['Equilibrium', 'Kinetics', 'Thermodynamics'],
        content: `Chemical equilibrium occurs when the forward and reverse reaction rates are identical.
1. Equilibrium Constant: K_eq = [Products]^p / [Reactants]^r at constant temperature.
2. Le Chatelier's Principle: When a dynamic equilibrium is disturbed by change in concentration, pressure, or temperature, the system shifts to counteract the disturbance.`
      }
    ];
  }

  // 5. Biology & Life Sciences
  if (subject.includes('Biology')) {
    return [
      {
        id: `starter_${Date.now()}_1`,
        title: 'Cellular Respiration & Mitochondrial ATP Synthesis',
        subject: 'Biology & Life Sciences',
        createdAt: now,
        tags: ['Biology', 'Metabolism', 'ATP'],
        content: `Cellular respiration converts glucose chemical energy into cellular ATP.
1. Glycolysis in cytoplasm: 1 glucose -> 2 pyruvate + net 2 ATP + 2 NADH.
2. Krebs Cycle in mitochondrial matrix: Yields CO₂, NADH, FADH₂, and ATP.
3. Oxidative Phosphorylation: Electron transport chain pumps protons across inner mitochondrial membrane; chemiosmosis drives ATP synthase to produce ~30-32 ATP.`
      },
      {
        id: `starter_${Date.now()}_2`,
        title: 'Central Dogma: DNA Replication & Protein Synthesis',
        subject: 'Biology & Life Sciences',
        createdAt: now,
        tags: ['Genetics', 'DNA', 'Transcription'],
        content: `The flow of genetic information: DNA -> RNA -> Protein.
1. Replication: Semi-conservative copying of DNA double helix via DNA Polymerase.
2. Transcription: RNA Polymerase transcribes genomic DNA template into messenger RNA (mRNA).
3. Translation: Ribosomes read mRNA codons and assemble matching amino acids via transfer RNA (tRNA).`
      }
    ];
  }

  // 6. Economics & Data Analysis (Default fallback)
  return [
    {
      id: `starter_${Date.now()}_1`,
      title: 'Microeconomics: Supply, Demand & Market Equilibrium',
      subject: 'Economics & Data Analysis',
      createdAt: now,
      tags: ['Economics', 'Markets', 'Equilibrium'],
      content: `Market equilibrium is reached at the intersection of consumer demand and producer supply curves.
1. Law of Demand: Higher price reduces quantity demanded (inverse relationship).
2. Law of Supply: Higher price incentivizes greater quantity supplied.
3. Price Elasticity: Measures responsiveness of quantity demanded to price variations.`
    },
    {
      id: `starter_${Date.now()}_2`,
      title: 'Statistical Distributions & Descriptive Metrics',
      subject: 'Economics & Data Analysis',
      createdAt: now,
      tags: ['Statistics', 'Data', 'Probability'],
      content: `Quantitative data analysis relies on central tendency and dispersion metrics.
1. Central Tendency: Mean (arithmetic average), Median (middle percentile), Mode (most frequent).
2. Dispersion: Variance and standard deviation quantify spread around the mean.
3. Central Limit Theorem: The sum or average of independent random variables tends toward normal distribution regardless of underlying population shape.`
    }
  ];
}
