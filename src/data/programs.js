/**
 * SHIFT Tracker — Programs Registry & Adapter
 * ──────────────────────────────────────────────────────────────────
 * Single source of truth for all training programs. Provides a
 * uniform shape so UI code can render either PPLUL (legacy) or
 * TFH-01 (new) without branching everywhere.
 *
 * Day shape (used by TrainView, WorkoutSession, StatsView):
 *   { id, label, color, exercises: [exerciseId, ...], focus? }
 *
 * Exercise shape (normalized — both programs expose all fields):
 *   { id, name, sets, repMin, repMax, repRange, incr, category,
 *     primaryMuscle, primaryMuscles, secondaryMuscles, notes, restSeconds }
 *
 * Program record:
 *   { id, name, shortName, cycle: [dayKey...], days, exercises,
 *     keyLifts, progression }
 */

import { program as tfh01 } from './program';

// ═══════════════════════════════════════════════════════════════════
// PPLUL (legacy split — moved here from ShiftTracker.jsx)
// ═══════════════════════════════════════════════════════════════════

const PPLUL_RAW_EXERCISES = {
  bench_press:        { name: 'Chest Press (Machine)',     sets: 3, repMin: 8,  repMax: 12, incr: 5,   category: 'compound' },
  incline_db_press:   { name: 'Incline DB Press',          sets: 4, repMin: 8,  repMax: 12, incr: 2.5, category: 'compound' },
  weighted_dips:      { name: 'Weighted Dips',             sets: 3, repMin: 8,  repMax: 10, incr: 2.5, category: 'compound' },
  cable_fly_low:      { name: 'Cable Fly (low-to-high)',   sets: 4, repMin: 12, repMax: 15, incr: 2.5, category: 'isolation' },
  cable_fly_mid:      { name: 'Cable Fly (mid)',           sets: 3, repMin: 12, repMax: 15, incr: 2.5, category: 'isolation' },
  db_shoulder_press:  { name: 'Seated DB Shoulder Press',  sets: 3, repMin: 8,  repMax: 10, incr: 2.5, category: 'compound' },
  cable_lateral:      { name: 'Cable Lateral Raise',       sets: 3, repMin: 12, repMax: 15, incr: 2.5, category: 'isolation' },
  rope_pushdown:      { name: 'Rope Tricep Pushdown',      sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'isolation' },
  oh_cable_tri:       { name: 'Overhead Cable Tri Ext',    sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'isolation' },

  deadlift:           { name: 'Deadlift',                  sets: 3, repMin: 5,  repMax: 8,  incr: 10,  category: 'compound' },
  lat_pulldown:       { name: 'Lat Pulldown',              sets: 4, repMin: 8,  repMax: 12, incr: 5,   category: 'compound' },
  barbell_row:        { name: 'Barbell Row',               sets: 3, repMin: 8,  repMax: 10, incr: 5,   category: 'compound' },
  cs_db_row:          { name: 'Chest-Supported DB Row',    sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'compound' },
  face_pull:          { name: 'Face Pulls',                sets: 3, repMin: 12, repMax: 15, incr: 2.5, category: 'isolation' },
  barbell_curl:       { name: 'Barbell Curl',              sets: 3, repMin: 8,  repMax: 12, incr: 2.5, category: 'isolation' },
  hammer_curl:        { name: 'DB Hammer Curl',            sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'isolation' },

  back_squat:         { name: 'Back Squat',                sets: 4, repMin: 6,  repMax: 8,  incr: 5,   category: 'compound' },
  rdl:                { name: 'Romanian Deadlift',         sets: 3, repMin: 8,  repMax: 10, incr: 5,   category: 'compound' },
  leg_press:          { name: 'Leg Press',                 sets: 3, repMin: 10, repMax: 12, incr: 10,  category: 'compound' },
  lying_leg_curl:     { name: 'Lying Leg Curl',            sets: 3, repMin: 10, repMax: 12, incr: 5,   category: 'isolation' },
  leg_ext:            { name: 'Leg Extension',             sets: 3, repMin: 10, repMax: 15, incr: 5,   category: 'isolation' },
  standing_calf:      { name: 'Standing Calf Raise',       sets: 4, repMin: 10, repMax: 15, incr: 5,   category: 'isolation' },

  incline_bb_press:   { name: 'Incline Barbell Press',     sets: 3, repMin: 8,  repMax: 10, incr: 5,   category: 'compound' },
  weighted_pullup:    { name: 'Pull-ups (weighted)',       sets: 3, repMin: 8,  repMax: 12, incr: 2.5, category: 'compound' },
  cable_row:          { name: 'Cable Row',                 sets: 3, repMin: 10, repMax: 12, incr: 5,   category: 'compound' },
  ez_curl:            { name: 'EZ Bar Curl',               sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'isolation' },
  skullcrusher:       { name: 'Skull Crushers',            sets: 3, repMin: 10, repMax: 12, incr: 2.5, category: 'isolation' },

  front_squat:        { name: 'Front Squat',               sets: 3, repMin: 8,  repMax: 10, incr: 5,   category: 'compound' },
  hip_thrust:         { name: 'Barbell Hip Thrust',        sets: 3, repMin: 8,  repMax: 10, incr: 5,   category: 'compound' },
  bulgarian:          { name: 'Bulgarian Split Squat',     sets: 3, repMin: 8,  repMax: 10, incr: 2.5, category: 'compound' },
  seated_leg_curl:    { name: 'Seated Leg Curl',           sets: 3, repMin: 10, repMax: 12, incr: 5,   category: 'isolation' },
  seated_calf:        { name: 'Seated Calf Raise',         sets: 3, repMin: 10, repMax: 15, incr: 5,   category: 'isolation' },
  hanging_leg_raise:  { name: 'Hanging Leg Raise',         sets: 3, repMin: 10, repMax: 15, incr: 0,   category: 'isolation' },
};

const PPLUL_RAW_MUSCLES = {
  bench_press:        { primary: ['chest'],                    secondary: ['triceps', 'shoulders'] },
  incline_db_press:   { primary: ['chest'],                    secondary: ['triceps', 'shoulders'] },
  weighted_dips:      { primary: ['chest'],                    secondary: ['triceps'] },
  cable_fly_low:      { primary: ['chest'] },
  cable_fly_mid:      { primary: ['chest'] },
  db_shoulder_press:  { primary: ['shoulders'],                secondary: ['triceps'] },
  cable_lateral:      { primary: ['shoulders'] },
  rope_pushdown:      { primary: ['triceps'] },
  oh_cable_tri:       { primary: ['triceps'] },
  skullcrusher:       { primary: ['triceps'] },

  deadlift:           { primary: ['back'],                     secondary: ['hamstrings', 'glutes'] },
  lat_pulldown:       { primary: ['back'],                     secondary: ['biceps'] },
  barbell_row:        { primary: ['back'],                     secondary: ['biceps'] },
  cs_db_row:          { primary: ['back'],                     secondary: ['biceps'] },
  cable_row:          { primary: ['back'],                     secondary: ['biceps'] },
  face_pull:          { primary: ['shoulders'] },
  weighted_pullup:    { primary: ['back'],                     secondary: ['biceps'] },
  barbell_curl:       { primary: ['biceps'] },
  hammer_curl:        { primary: ['biceps'] },
  ez_curl:            { primary: ['biceps'] },

  back_squat:         { primary: ['quads', 'glutes'],          secondary: ['hamstrings'] },
  front_squat:        { primary: ['quads'],                    secondary: ['glutes'] },
  rdl:                { primary: ['hamstrings', 'glutes'] },
  leg_press:          { primary: ['quads'],                    secondary: ['glutes'] },
  lying_leg_curl:     { primary: ['hamstrings'] },
  seated_leg_curl:    { primary: ['hamstrings'] },
  leg_ext:            { primary: ['quads'] },
  hip_thrust:         { primary: ['glutes'],                   secondary: ['hamstrings'] },
  bulgarian:          { primary: ['quads', 'glutes'] },
  standing_calf:      { primary: ['calves'] },
  seated_calf:        { primary: ['calves'] },
  hanging_leg_raise:  { primary: ['abs'] },
};

const PPLUL_DAY_DEFS = {
  push:  { label: 'PUSH',  color: '#f5b400', exercises: ['incline_db_press', 'bench_press', 'weighted_dips', 'cable_fly_low', 'db_shoulder_press', 'cable_lateral', 'rope_pushdown'] },
  pull:  { label: 'PULL',  color: '#3b82f6', exercises: ['deadlift', 'lat_pulldown', 'barbell_row', 'cs_db_row', 'face_pull', 'barbell_curl', 'hammer_curl'] },
  legs:  { label: 'LEGS',  color: '#ef4444', exercises: ['back_squat', 'rdl', 'leg_press', 'lying_leg_curl', 'leg_ext', 'standing_calf'] },
  upper: { label: 'UPPER', color: '#a855f7', exercises: ['incline_db_press', 'weighted_pullup', 'cable_fly_mid', 'db_shoulder_press', 'cable_lateral', 'ez_curl'] },
  lower: { label: 'LOWER', color: '#10b981', exercises: ['front_squat', 'hip_thrust', 'bulgarian', 'seated_leg_curl', 'seated_calf', 'hanging_leg_raise'] },
};

const PPLUL_CYCLE = ['push', 'pull', 'legs', 'upper', 'lower'];

// Decorate PPLUL exercises with id + normalized fields
const PPLUL_EXERCISES = Object.entries(PPLUL_RAW_EXERCISES).reduce((acc, [id, def]) => {
  const m = PPLUL_RAW_MUSCLES[id] || {};
  const primaries = m.primary || [];
  acc[id] = {
    ...def,
    id,
    repRange: [def.repMin, def.repMax],
    primaryMuscle: primaries[0] || null,
    primaryMuscles: primaries,
    secondaryMuscles: m.secondary || [],
    notes: '',
    restSeconds: null, // null → caller falls back to config.restTimer
  };
  return acc;
}, {});

const PPLUL_DAYS = Object.entries(PPLUL_DAY_DEFS).reduce((acc, [id, d]) => {
  acc[id] = { id, ...d };
  return acc;
}, {});

// ═══════════════════════════════════════════════════════════════════
// TFH-01 NORMALIZATION
// ═══════════════════════════════════════════════════════════════════

const TFH_DAY_COLORS = {
  'day1-chest-tri':       '#f5b400', // amber
  'day2-back-bi':         '#3b82f6', // blue
  'day3-legs':            '#ef4444', // red
  'day4-chest-shoulders': '#a855f7', // purple
  'day5-arms':            '#10b981', // green
};

const LOWER_BODY_MUSCLES = ['quads', 'hamstrings', 'glutes', 'calves'];

function tfhIncrement(primaryMuscle) {
  const isLower = LOWER_BODY_MUSCLES.includes(primaryMuscle);
  return isLower
    ? tfh01.progression.loadIncrement.lowerBody
    : tfh01.progression.loadIncrement.upperBody;
}

const TFH_EXERCISES = Object.entries(tfh01.exercises).reduce((acc, [id, ex]) => {
  acc[id] = {
    ...ex,
    repMin: ex.repRange[0],
    repMax: ex.repRange[1],
    incr: tfhIncrement(ex.primaryMuscle),
    primaryMuscles: ex.primaryMuscle ? [ex.primaryMuscle] : [],
    secondaryMuscles: ex.secondaryMuscles || [],
  };
  return acc;
}, {});

const TFH_DAYS = tfh01.days.reduce((acc, d) => {
  acc[d.id] = {
    id: d.id,
    label: d.name.toUpperCase(),
    color: TFH_DAY_COLORS[d.id] || '#f5b400',
    exercises: d.exerciseIds,
    focus: d.focus,
  };
  return acc;
}, {});

const TFH_CYCLE = tfh01.days.map(d => d.id);

// ═══════════════════════════════════════════════════════════════════
// PROGRAMS REGISTRY
// ═══════════════════════════════════════════════════════════════════

export const PROGRAMS = {
  pplul: {
    id: 'pplul',
    name: 'PPLUL Hypertrophy',
    shortName: 'PPLUL',
    description: 'Push / Pull / Legs / Upper / Lower — 5-day rotation',
    cycle: PPLUL_CYCLE,
    days: PPLUL_DAYS,
    exercises: PPLUL_EXERCISES,
    keyLifts: ['bench_press', 'back_squat', 'deadlift', 'db_shoulder_press', 'barbell_row'],
  },
  'tfh-01': {
    id: 'tfh-01',
    name: 'Tall Frame Hypertrophy',
    shortName: 'TFH-01',
    description: '5-day chest-focused split engineered for tall lifters',
    cycle: TFH_CYCLE,
    days: TFH_DAYS,
    exercises: TFH_EXERCISES,
    keyLifts: ['flatDbPress', 'tBarRowSupported', 'legPress', 'seatedDbShoulderPress', 'ezBarCurl'],
    progression: tfh01.progression,
  },
};

export const DEFAULT_PROGRAM_ID = 'pplul';

// ═══════════════════════════════════════════════════════════════════
// PUBLIC HELPERS
// ═══════════════════════════════════════════════════════════════════

export function getActiveProgram(config) {
  const id = config?.activeProgram;
  return PROGRAMS[id] || PROGRAMS[DEFAULT_PROGRAM_ID];
}

export function getActiveCycle(config) {
  return getActiveProgram(config).cycle;
}

export function getActiveDay(config) {
  const prog = getActiveProgram(config);
  const idx = (config?.dayIndex || 0) % prog.cycle.length;
  return prog.days[prog.cycle[idx]];
}

/** Look up a day by its dayKey in any program — useful for history rendering */
export function getDayFromAnyProgram(dayKey) {
  for (const p of Object.values(PROGRAMS)) {
    if (p.days[dayKey]) return p.days[dayKey];
  }
  return null;
}

/** Look up an exercise by id in any program — useful for history & stats */
export function getExerciseFromAnyProgram(exerciseId) {
  for (const p of Object.values(PROGRAMS)) {
    if (p.exercises[exerciseId]) return p.exercises[exerciseId];
  }
  return null;
}

export function getKeyLifts(config) {
  return getActiveProgram(config).keyLifts;
}

/**
 * Compute weekly volume per muscle group from logged history.
 * Reads exercise muscle data from any program (tolerates mixed history).
 *
 * @param {Array} history - workout_history array
 * @param {number} daysBack - rolling window in days (default 7)
 * @returns {Object<MuscleGroup, number>}
 */
export function computeVolumeFromHistory(history, daysBack = 7) {
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const vol = {};
  for (const w of history) {
    if (new Date(w.date).getTime() < cutoff) continue;
    for (const ex of w.exercises) {
      const def = getExerciseFromAnyProgram(ex.id);
      if (!def) continue;
      const setsCount = ex.sets.length;
      (def.primaryMuscles || []).forEach(m => { vol[m] = (vol[m] || 0) + setsCount; });
      (def.secondaryMuscles || []).forEach(m => { vol[m] = (vol[m] || 0) + setsCount * 0.5; });
    }
  }
  return vol;
}

/**
 * Normalize a config object loaded from storage. Backfills `activeProgram`
 * for users created before the multi-program feature.
 */
export function normalizeProgramConfig(config) {
  if (!config) return config;
  if (!PROGRAMS[config.activeProgram]) {
    return { ...config, activeProgram: DEFAULT_PROGRAM_ID };
  }
  return config;
}
