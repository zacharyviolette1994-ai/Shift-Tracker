/**
 * SHIFT Tracker — Program Module
 * ──────────────────────────────────────────────────────────────────
 * Tall Frame Hypertrophy Protocol (Block 1)
 *
 * A 5-day chest-focused hypertrophy split engineered for tall lifters
 * (6'6"+). Drop this file into src/data/ and import the `program`
 * object wherever you need to render workouts, compute volume, or
 * suggest progressions.
 *
 * @author  Shift Fitness
 * @version 1.0.0
 * @program PROGRAM-01
 */

// ═══════════════════════════════════════════════════════════════════
// TYPE HINTS (JSDoc — works without TypeScript)
// ═══════════════════════════════════════════════════════════════════

/**
 * @typedef {'chest'|'back'|'shoulders'|'sideDelts'|'rearDelts'|'triceps'|'biceps'|'quads'|'hamstrings'|'glutes'|'calves'|'forearms'|'abs'} MuscleGroup
 *
 * @typedef {Object} Exercise
 * @property {string} id - Unique stable id (used as key in storage)
 * @property {string} name - Display name
 * @property {number} sets - Number of working sets
 * @property {[number, number]} repRange - [minReps, maxReps] for double progression
 * @property {number} restSeconds - Recommended rest between sets
 * @property {MuscleGroup} primaryMuscle - The main muscle worked
 * @property {MuscleGroup[]} [secondaryMuscles] - Other muscles indirectly trained
 * @property {string} notes - Form/biomechanics notes for tall lifters
 * @property {'compound'|'isolation'|'machine'|'cable'} category
 * @property {number} [targetRIR] - Reps in Reserve target (default 1-2)
 *
 * @typedef {Object} TrainingDay
 * @property {string} id
 * @property {number} dayNumber - 1-5
 * @property {string} name - Short label for UI ("Chest + Tri")
 * @property {string} focus - Longer description ("Primary chest")
 * @property {Exercise[]} exercises
 *
 * @typedef {Object} Program
 * @property {string} id
 * @property {string} name
 * @property {Object} meta
 * @property {TrainingDay[]} days
 * @property {Object} supplements
 * @property {Object} nutrition
 * @property {Object} recovery
 * @property {Object} progression
 */

// ═══════════════════════════════════════════════════════════════════
// EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════════════
// Defined separately so they can be referenced by id elsewhere
// (e.g., progress charts, exercise history views, alternates).
// ═══════════════════════════════════════════════════════════════════

export const exercises = {
  // ── DAY 1: Chest + Triceps ──────────────────────────────────────
  inclineDbPress: {
    id: 'inclineDbPress',
    name: 'Incline DB Press (30°)',
    sets: 4,
    repRange: [6, 10],
    restSeconds: 150,
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    category: 'compound',
    notes: 'DBs > BB. Long arms make BB incline murder on shoulders. Find your natural press path.'
  },
  flatMachinePress: {
    id: 'flatMachinePress',
    name: 'Flat Machine Press',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 120,
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps'],
    category: 'machine',
    notes: 'Hammer Strength chest press if available. Fixed groove protects long-lever shoulders.'
  },
  weightedDips: {
    id: 'weightedDips',
    name: 'Weighted Dips (forward lean)',
    sets: 3,
    repRange: [8, 12],
    restSeconds: 120,
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps'],
    category: 'compound',
    notes: "Lean forward 30° for chest emphasis. Stop at parallel — don't dip below. Skip if shoulder pain."
  },
  cableCrossoverHigh: {
    id: 'cableCrossoverHigh',
    name: 'Cable Crossover (high-to-low)',
    sets: 3,
    repRange: [12, 15],
    restSeconds: 90,
    primaryMuscle: 'chest',
    category: 'cable',
    notes: 'Constant tension throughout the long ROM your arms create. Slight forward lean.'
  },
  pecDeck: {
    id: 'pecDeck',
    name: 'Pec Deck / Machine Fly',
    sets: 3,
    repRange: [12, 15],
    restSeconds: 90,
    primaryMuscle: 'chest',
    category: 'machine',
    notes: 'Peak contraction work. Hits the part of the rep where you have less leverage.'
  },
  tricepRopePushdown: {
    id: 'tricepRopePushdown',
    name: 'Tricep Rope Pushdown',
    sets: 4,
    repRange: [10, 12],
    restSeconds: 90,
    primaryMuscle: 'triceps',
    category: 'cable',
    notes: 'Full ROM. Squeeze at bottom, full stretch at top.'
  },
  overheadDbExtension: {
    id: 'overheadDbExtension',
    name: 'Overhead DB Tricep Extension',
    sets: 3,
    repRange: [10, 12],
    restSeconds: 90,
    primaryMuscle: 'triceps',
    category: 'isolation',
    notes: 'Long head triceps — fills out the back of your arm. Keep elbows tight.'
  },

  // ── DAY 2: Back + Biceps ────────────────────────────────────────
  tBarRowSupported: {
    id: 'tBarRowSupported',
    name: 'Chest-Supported T-Bar Row',
    sets: 4,
    repRange: [6, 10],
    restSeconds: 150,
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'rearDelts'],
    category: 'compound',
    notes: 'Avoid bent-over BB rows — long torso + long arms = round back. Chest support = pure lat work.'
  },
  latPulldownWide: {
    id: 'latPulldownWide',
    name: 'Lat Pulldown (wide grip)',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 120,
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps'],
    category: 'cable',
    notes: 'Slightly wider than shoulder-width grip. Pull to upper chest, NOT behind neck.'
  },
  singleArmDbRow: {
    id: 'singleArmDbRow',
    name: 'Single-Arm DB Row',
    sets: 3,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps'],
    category: 'compound',
    notes: 'Knee on bench. Pull DB to your hip, not your stomach. Full ROM is non-negotiable.'
  },
  cableRowNeutral: {
    id: 'cableRowNeutral',
    name: 'Cable Row (neutral grip)',
    sets: 3,
    repRange: [10, 15],
    restSeconds: 90,
    primaryMuscle: 'back',
    category: 'cable',
    notes: 'Constant tension — perfect for tall lifters who need to feel the squeeze.'
  },
  facePulls: {
    id: 'facePulls',
    name: 'Face Pulls',
    sets: 3,
    repRange: [15, 20],
    restSeconds: 60,
    primaryMuscle: 'rearDelts',
    secondaryMuscles: ['back'],
    category: 'cable',
    notes: 'Critical for shoulder health. Tall lifters develop forward shoulder roll fast.'
  },
  hammerCurls: {
    id: 'hammerCurls',
    name: 'Hammer Curls',
    sets: 3,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    category: 'isolation',
    notes: 'Brachialis development = bigger-looking arms for your frame.'
  },
  cableCurls: {
    id: 'cableCurls',
    name: 'Cable Curls',
    sets: 3,
    repRange: [10, 15],
    restSeconds: 60,
    primaryMuscle: 'biceps',
    category: 'cable',
    notes: 'Constant tension > free weights for long-arm biceps. Squeeze at top.'
  },

  // ── DAY 3: Legs ─────────────────────────────────────────────────
  legPress: {
    id: 'legPress',
    name: 'Leg Press',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 150,
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    category: 'machine',
    notes: 'Better than back squat for most tall lifters. All quad/glute work without spinal load.'
  },
  romanianDeadlift: {
    id: 'romanianDeadlift',
    name: 'Romanian Deadlift',
    sets: 4,
    repRange: [6, 10],
    restSeconds: 150,
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    category: 'compound',
    notes: 'Long arms = mechanical advantage on RDLs. Hammers hamstrings + glutes.'
  },
  bulgarianSplitSquat: {
    id: 'bulgarianSplitSquat',
    name: 'Bulgarian Split Squat',
    sets: 3,
    repRange: [8, 12],
    restSeconds: 120,
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    category: 'compound',
    notes: 'Heel-elevated front foot if ankle mobility is limited. Per leg.'
  },
  legExtension: {
    id: 'legExtension',
    name: 'Leg Extension',
    sets: 4,
    repRange: [12, 15],
    restSeconds: 90,
    primaryMuscle: 'quads',
    category: 'machine',
    notes: 'Pure quad isolation — the part squats often miss for tall lifters. Hold at top 1 sec.'
  },
  lyingLegCurl: {
    id: 'lyingLegCurl',
    name: 'Lying Leg Curl',
    sets: 4,
    repRange: [10, 15],
    restSeconds: 90,
    primaryMuscle: 'hamstrings',
    category: 'machine',
    notes: 'Long femurs need extra hamstring work. Pair with extensions.'
  },
  standingCalfRaise: {
    id: 'standingCalfRaise',
    name: 'Standing Calf Raise',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'calves',
    category: 'machine',
    notes: 'Heavy. Calves are stubborn — go heavier than feels comfortable. Full ROM.'
  },
  seatedCalfRaise: {
    id: 'seatedCalfRaise',
    name: 'Seated Calf Raise',
    sets: 3,
    repRange: [12, 20],
    restSeconds: 60,
    primaryMuscle: 'calves',
    category: 'machine',
    notes: 'Targets the soleus. Different angle — both are needed.'
  },

  // ── DAY 4: Chest + Shoulders ────────────────────────────────────
  flatDbPress: {
    id: 'flatDbPress',
    name: 'Flat DB Press',
    sets: 4,
    repRange: [6, 10],
    restSeconds: 150,
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    category: 'compound',
    notes: 'The flat press you skipped on Day 1. DBs always > BB for tall lifters.'
  },
  inclineCableFly: {
    id: 'inclineCableFly',
    name: 'Incline Cable Fly (low-to-high)',
    sets: 3,
    repRange: [10, 15],
    restSeconds: 90,
    primaryMuscle: 'chest',
    category: 'cable',
    notes: 'Stretch-focused chest work. Your arms maximize the stretch — disproportionately effective.'
  },
  smithCloseGrip: {
    id: 'smithCloseGrip',
    name: 'Smith Machine Bench (close grip)',
    sets: 3,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps'],
    category: 'machine',
    notes: 'Targets inner/lower chest where long-armed lifters often have a gap.'
  },
  seatedDbShoulderPress: {
    id: 'seatedDbShoulderPress',
    name: 'Seated DB Shoulder Press',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 120,
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps'],
    category: 'compound',
    notes: 'Seated > standing for tall lifters. Less spinal load, better isolation.'
  },
  dbLateralRaise: {
    id: 'dbLateralRaise',
    name: 'DB Lateral Raise',
    sets: 4,
    repRange: [12, 15],
    restSeconds: 90,
    primaryMuscle: 'sideDelts',
    category: 'isolation',
    notes: 'THE most important shoulder exercise for tall lifters. Wide delts = proportional frame.'
  },
  reversePecDeck: {
    id: 'reversePecDeck',
    name: 'Reverse Pec Deck',
    sets: 4,
    repRange: [12, 15],
    restSeconds: 60,
    primaryMuscle: 'rearDelts',
    category: 'machine',
    notes: "Rear delts for shoulder health and posture. Don't shortchange these."
  },
  cableLateralSingle: {
    id: 'cableLateralSingle',
    name: 'Cable Lateral (single-arm)',
    sets: 3,
    repRange: [12, 15],
    restSeconds: 60,
    primaryMuscle: 'sideDelts',
    category: 'cable',
    notes: 'Constant tension. Fixes side-to-side imbalances.'
  },

  // ── DAY 5: Arms + Weak Points ───────────────────────────────────
  closeGripBench: {
    id: 'closeGripBench',
    name: 'Close-Grip Bench Press',
    sets: 4,
    repRange: [6, 10],
    restSeconds: 120,
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    category: 'compound',
    notes: 'Bridges chest and triceps. Hands shoulder-width — not narrower.'
  },
  ezBarCurl: {
    id: 'ezBarCurl',
    name: 'EZ-Bar Curl',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'biceps',
    category: 'isolation',
    notes: "EZ bar > straight bar for long-arm wrists. Don't swing."
  },
  skullCrushers: {
    id: 'skullCrushers',
    name: 'Skull Crushers (EZ bar)',
    sets: 4,
    repRange: [8, 12],
    restSeconds: 90,
    primaryMuscle: 'triceps',
    category: 'isolation',
    notes: 'Long-head tricep emphasis. Lower bar to forehead, full extension at top.'
  },
  preacherCurl: {
    id: 'preacherCurl',
    name: 'Preacher Curl',
    sets: 3,
    repRange: [10, 15],
    restSeconds: 90,
    primaryMuscle: 'biceps',
    category: 'isolation',
    notes: 'Stretch-focused biceps. Pause 1 sec at the bottom for max stretch.'
  },
  tricepRopePushdownPump: {
    id: 'tricepRopePushdownPump',
    name: 'Tricep Rope Pushdown (pump)',
    sets: 3,
    repRange: [12, 15],
    restSeconds: 60,
    primaryMuscle: 'triceps',
    category: 'cable',
    notes: 'Pump finisher. Spread the rope at the bottom of each rep.'
  },
  cableCurlPump: {
    id: 'cableCurlPump',
    name: 'Cable Curl (pump)',
    sets: 3,
    repRange: [12, 15],
    restSeconds: 60,
    primaryMuscle: 'biceps',
    category: 'cable',
    notes: 'Pump finisher. Constant tension at all angles.'
  },
  forearmWork: {
    id: 'forearmWork',
    name: 'Forearms (wrist curl or farmer carry)',
    sets: 3,
    repRange: [15, 20],
    restSeconds: 60,
    primaryMuscle: 'forearms',
    category: 'isolation',
    notes: "Tall lifters benefit from grip strength. Doesn't have to be fancy."
  },
  abCableCrunch: {
    id: 'abCableCrunch',
    name: 'Cable Crunch',
    sets: 3,
    repRange: [12, 20],
    restSeconds: 60,
    primaryMuscle: 'abs',
    category: 'cable',
    notes: 'Round the spine, crunch with abs not hips.'
  },
  abLegRaise: {
    id: 'abLegRaise',
    name: 'Hanging Leg Raise',
    sets: 3,
    repRange: [12, 20],
    restSeconds: 60,
    primaryMuscle: 'abs',
    category: 'isolation',
    notes: "Slow controlled. Tilt pelvis, don't swing."
  }
};

// ═══════════════════════════════════════════════════════════════════
// TRAINING DAYS
// ═══════════════════════════════════════════════════════════════════
// Reference exercises by id from the library above.
// ═══════════════════════════════════════════════════════════════════

export const days = [
  {
    id: 'day1-chest-tri',
    dayNumber: 1,
    name: 'Chest + Tri',
    focus: 'Primary chest',
    weekday: 'monday',
    exerciseIds: [
      'inclineDbPress',
      'flatMachinePress',
      'weightedDips',
      'cableCrossoverHigh',
      'pecDeck',
      'tricepRopePushdown',
      'overheadDbExtension'
    ]
  },
  {
    id: 'day2-back-bi',
    dayNumber: 2,
    name: 'Back + Bi',
    focus: 'V-taper focus',
    weekday: 'tuesday',
    exerciseIds: [
      'tBarRowSupported',
      'latPulldownWide',
      'singleArmDbRow',
      'cableRowNeutral',
      'facePulls',
      'hammerCurls',
      'cableCurls'
    ]
  },
  {
    id: 'day3-legs',
    dayNumber: 3,
    name: 'Legs',
    focus: 'Lower body',
    weekday: 'wednesday',
    exerciseIds: [
      'legPress',
      'romanianDeadlift',
      'bulgarianSplitSquat',
      'legExtension',
      'lyingLegCurl',
      'standingCalfRaise',
      'seatedCalfRaise'
    ]
  },
  {
    id: 'day4-chest-shoulders',
    dayNumber: 4,
    name: 'Chest + Shoulders',
    focus: 'Secondary chest',
    weekday: 'thursday',
    exerciseIds: [
      'flatDbPress',
      'inclineCableFly',
      'smithCloseGrip',
      'seatedDbShoulderPress',
      'dbLateralRaise',
      'reversePecDeck',
      'cableLateralSingle'
    ]
  },
  {
    id: 'day5-arms',
    dayNumber: 5,
    name: 'Arms + Weak Points',
    focus: 'Pump session',
    weekday: 'friday',
    exerciseIds: [
      'closeGripBench',
      'ezBarCurl',
      'skullCrushers',
      'preacherCurl',
      'tricepRopePushdownPump',
      'cableCurlPump',
      'forearmWork',
      'abCableCrunch',
      'abLegRaise'
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════
// SUPPLEMENT PROTOCOL
// ═══════════════════════════════════════════════════════════════════

export const supplements = {
  /**
   * Master Mix — pre-mixed powder taken once daily in coffee/water.
   * Mixed biweekly in batches.
   */
  masterMix: {
    id: 'masterMix',
    name: 'Morning Master Mix',
    timing: 'morning',
    deliveryMethod: 'powder-stir-in',
    perScoop: [
      { item: 'Hydrolyzed Collagen Peptides', amount: '10g', purpose: 'Joints, tendons, skin' },
      { item: 'Creatine Monohydrate', amount: '5g', purpose: 'Strength, power, muscle volume' },
      { item: 'Magnesium Glycinate', amount: '1.4g', purpose: 'Sleep, recovery, muscle relaxation' }
    ],
    biweeklyBatch: [
      { item: 'Collagen Peptides', amount: '140g' },
      { item: 'Creatine Monohydrate', amount: '70g' },
      { item: 'Magnesium Glycinate', amount: '20g' }
    ],
    instructions: [
      'Weigh each powder into a medium mixing bowl',
      'Whisk thoroughly with a fork for 60 seconds',
      'Sift through a fine-mesh strainer into a second clean bowl',
      'Whisk one more time',
      'Pour into a labeled wide-mouth jar',
      'Each morning: scoop one rounded tablespoon (~16g) into coffee, water, or shake'
    ]
  },

  /**
   * Morning pill stack — taken with breakfast.
   */
  morningPills: [
    {
      id: 'ashwagandha',
      name: 'Ashwagandha (KSM-66)',
      dose: '600mg',
      purpose: 'Cortisol management. Backed by RCTs showing modest strength gains and reduced perceived stress.'
    },
    {
      id: 'zinc',
      name: 'Zinc Picolinate',
      dose: '15mg',
      purpose: "Testosterone support, immune function, recovery. Don't exceed 30mg/day long-term."
    },
    {
      id: 'fishOil',
      name: 'Fish Oil (EPA + DHA)',
      dose: '2g combined',
      purpose: 'Anti-inflammatory, joint health, cardiovascular protection.'
    },
    {
      id: 'd3k2',
      name: 'Vitamin D3 + K2',
      dose: '5,000 IU + 100mcg',
      purpose: 'Critical at northern latitudes. K2 directs calcium to bones.'
    },
    {
      id: 'multi',
      name: "Men's Multivitamin",
      dose: '1 serving',
      purpose: 'Insurance for micronutrients.'
    }
  ],

  /**
   * Evening — single stir-in, no pills.
   */
  evening: {
    name: 'Tart Cherry Nightcap',
    timing: 'evening',
    instructions: '1 cup tart cherry juice, 30–60 minutes before bed. Magnesium already covered in morning Master Mix.',
    purpose: 'Sleep onset, DOMS reduction (research shows ~30% reduction in soreness).'
  }
};

// ═══════════════════════════════════════════════════════════════════
// NUTRITION
// ═══════════════════════════════════════════════════════════════════

export const nutrition = {
  /**
   * Calorie targets — assume bodyweight 230–260 lbs.
   * User adjusts based on 2-week scale data.
   */
  calorieTargets: {
    maintenance: { min: 3000, max: 3400 },
    leanBulk:    { min: 3400, max: 3800 },  // recommended default
    aggressiveBulk: { min: 4000, max: 4400 },
    cut:         { min: 2600, max: 2800 }
  },

  /**
   * Macro split for lean bulk at ~3,600 cal.
   * Protein target: 0.8–1.0 g/lb of bodyweight (Morton 2018 meta + 2025 ISSN updates).
   */
  macros: {
    protein: { grams: 200, calories: 800, percent: 22, targetPerLb: [0.8, 1.0] },
    fat:     { grams: 100, calories: 900, percent: 25, minPerLb: 0.3 },
    carbs:   { grams: 475, calories: 1900, percent: 53 }
  },

  /**
   * Daily eating template — 5 meals, ~3,255 cal, 255g protein.
   */
  meals: [
    {
      id: 'breakfast',
      name: 'Breakfast',
      foods: '4 whole eggs + 4 egg whites scrambled • 1 cup oats with berries • 2 tbsp peanut butter',
      calories: 750,
      protein: 55,
      carbs: 80,
      fat: 25
    },
    {
      id: 'midMorning',
      name: 'Mid-Morning',
      foods: '1 cup Greek yogurt + 1 cup granola + honey',
      calories: 500,
      protein: 30,
      carbs: 60,
      fat: 12
    },
    {
      id: 'preWorkoutShake',
      name: 'Pre-Workout Shake',
      foods: 'Raw milk + whey + egg whites + oats + banana — see shake recipe',
      calories: 855,
      protein: 85,
      carbs: 85,
      fat: 22,
      isShake: true
    },
    {
      id: 'postWorkout',
      name: 'Post-Workout Dinner',
      foods: '8oz chicken thigh or beef • 1.5 cups jasmine rice • 2 cups vegetables with olive oil',
      calories: 750,
      protein: 55,
      carbs: 75,
      fat: 25
    },
    {
      id: 'evening',
      name: 'Evening',
      foods: '1 cup cottage cheese + ½ cup blueberries + 1 oz almonds',
      calories: 400,
      protein: 30,
      carbs: 25,
      fat: 18
    }
  ],

  /**
   * The pre-workout shake — flagship recipe.
   */
  preWorkoutShake: {
    name: 'Pre-Workout Shake',
    timing: '60 minutes before training',
    ingredients: [
      { name: 'Raw milk (or whole milk)', amount: '2 cups', cal: 300, p: 16, c: 24, f: 16 },
      { name: 'Whey protein isolate', amount: '2 scoops (60g)', cal: 240, p: 50, c: 6, f: 3 },
      { name: 'Pasteurized liquid egg whites', amount: '½ cup', cal: 60, p: 13, c: 1, f: 0 },
      { name: 'Raw oats (blended)', amount: '½ cup', cal: 150, p: 5, c: 27, f: 3 },
      { name: 'Banana', amount: '1 medium', cal: 105, p: 1, c: 27, f: 0 }
    ],
    optionalAddIns: [
      { name: 'Maltodextrin', amount: '1 scoop', cal: 100, p: 0, c: 25, f: 0, condition: 'Heavy training days only' }
    ],
    totals: { calories: 855, protein: 85, carbs: 85, fat: 22 }
  }
};

// ═══════════════════════════════════════════════════════════════════
// RECOVERY
// ═══════════════════════════════════════════════════════════════════

export const recovery = {
  sleep: {
    target: 8,
    minimum: 7,
    note: 'Tall lifters recover slower. <7 hrs = 18% MPS reduction (Nedeltcheva 2011).'
  },
  deload: {
    everyWeeks: 7,            // average of 6-8
    intensityPercent: 60,     // 60% of working weight
    setReductionPercent: 50,  // half the sets
    note: 'Same exercises, 60% load, half the sets, RIR 3–4. Return fresh.'
  },
  activeRecovery: {
    days: ['saturday', 'sunday'],
    activities: ['walking 30-45 min'],
    note: 'No running, no lifting. Walking only.'
  },
  mobility: {
    minutesPerDay: 10,
    focusAreas: ['shoulders', 'hips', 'ankles'],
    note: 'Long limbs lock up faster. Daily maintenance, not weekly sessions.'
  },
  cardioPolicy: {
    duringBulk: 'walking only',
    duringMaintenance: '2-3 sessions per week',
    duringCut: '3-4 sessions per week'
  }
};

// ═══════════════════════════════════════════════════════════════════
// PROGRESSION RULES
// ═══════════════════════════════════════════════════════════════════

export const progression = {
  type: 'double-progression',
  description: 'Add reps until you hit the top of the rep range on all sets, then add weight and reset reps to the bottom.',
  loadIncrement: {
    upperBody: 5,   // lbs
    lowerBody: 10   // lbs
  },
  rir: {
    workingSets: { min: 1, max: 2 },
    finalSetIsolation: 0,  // can go to true failure on last set of isolation
    deload: { min: 3, max: 4 }
  }
};

// ═══════════════════════════════════════════════════════════════════
// THE PROGRAM (top-level export)
// ═══════════════════════════════════════════════════════════════════

export const program = {
  id: 'tall-frame-hypertrophy-v1',
  name: 'Tall Frame Hypertrophy',
  shortName: 'TFH-01',
  blockNumber: 1,
  description: `A 5-day chest-focused hypertrophy split engineered for the 6'6" lifter.`,
  meta: {
    author: 'Shift Fitness',
    createdAt: '2026-05-04',
    durationWeeks: 7,        // run for 6-8 weeks before deload
    daysPerWeek: 5,
    restDays: ['saturday', 'sunday'],
    targetAudience: `tall lifters (6'4"+), 6+ months of training experience`,
    primaryGoal: 'chest hypertrophy with balanced full-body development'
  },
  exercises,
  days,
  supplements,
  nutrition,
  recovery,
  progression
};

export default program;
