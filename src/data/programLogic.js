/**
 * SHIFT Tracker — Program Logic Helpers
 * ──────────────────────────────────────────────────────────────────
 * Pure utility functions for working with the program data.
 * No React, no DOM, no side effects — easy to test and reason about.
 *
 * Drop into src/data/ alongside program.js.
 *
 * Usage:
 *   import { suggestNextSet, weeklyVolumeByMuscle, getDay } from './programLogic';
 *   import { program } from './program';
 *
 *   const suggestion = suggestNextSet(program.exercises.inclineDbPress, lastSession);
 *   // → { weight: 75, reps: 8, isProgression: true }
 */

// ═══════════════════════════════════════════════════════════════════
// EXERCISE / DAY LOOKUPS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get a day by its 1-indexed day number.
 * @param {Object} program
 * @param {number} dayNumber - 1 through 5
 * @returns {Object|null}
 */
export function getDay(program, dayNumber) {
  return program.days.find(d => d.dayNumber === dayNumber) || null;
}

/**
 * Get a day by weekday string. Returns null on rest days (sat/sun).
 * @param {Object} program
 * @param {string} weekday - 'monday' through 'sunday', case-insensitive
 * @returns {Object|null}
 */
export function getDayByWeekday(program, weekday) {
  const w = weekday.toLowerCase();
  return program.days.find(d => d.weekday === w) || null;
}

/**
 * Get today's training day based on system date.
 * Returns null on Saturday and Sunday.
 * @param {Object} program
 * @returns {Object|null}
 */
export function getTodaysDay(program) {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = weekdays[new Date().getDay()];
  return getDayByWeekday(program, today);
}

/**
 * Resolve a day's exerciseIds to full exercise objects.
 * @param {Object} program
 * @param {Object} day
 * @returns {Array<Object>} ordered list of exercises
 */
export function resolveDayExercises(program, day) {
  return day.exerciseIds.map(id => program.exercises[id]).filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════
// VOLUME ANALYSIS
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute weekly volume per muscle group across all training days.
 * Counts direct sets (primary muscle) at full value and indirect
 * sets (secondary muscle) at half value, matching modern meta-analysis
 * conventions (Pelland et al. 2025).
 *
 * @param {Object} program
 * @returns {Object<MuscleGroup, { direct: number, fractional: number, total: number }>}
 *
 * @example
 *   weeklyVolumeByMuscle(program)
 *   // → { chest: { direct: 22, fractional: 4, total: 26 }, ... }
 */
export function weeklyVolumeByMuscle(program) {
  const totals = {};

  function addTo(muscle, sets, isFractional = false) {
    if (!totals[muscle]) {
      totals[muscle] = { direct: 0, fractional: 0, total: 0 };
    }
    if (isFractional) {
      totals[muscle].fractional += sets * 0.5;
      totals[muscle].total += sets * 0.5;
    } else {
      totals[muscle].direct += sets;
      totals[muscle].total += sets;
    }
  }

  for (const day of program.days) {
    for (const exId of day.exerciseIds) {
      const ex = program.exercises[exId];
      if (!ex) continue;
      addTo(ex.primaryMuscle, ex.sets, false);
      if (ex.secondaryMuscles) {
        for (const sec of ex.secondaryMuscles) {
          addTo(sec, ex.sets, true);
        }
      }
    }
  }

  return totals;
}

/**
 * Total weekly working sets across the entire program.
 * @param {Object} program
 * @returns {number}
 */
export function totalWeeklySets(program) {
  let total = 0;
  for (const day of program.days) {
    for (const exId of day.exerciseIds) {
      const ex = program.exercises[exId];
      if (ex) total += ex.sets;
    }
  }
  return total;
}

/**
 * Volume status for a single muscle relative to the 10-20 set
 * effective range from current research.
 *
 * @param {number} sets - direct sets only
 * @returns {'under'|'effective'|'optimal'|'overload'}
 */
export function volumeStatus(sets) {
  if (sets < 10) return 'under';
  if (sets <= 15) return 'effective';
  if (sets <= 20) return 'optimal';
  return 'overload';
}

// ═══════════════════════════════════════════════════════════════════
// DOUBLE PROGRESSION
// ═══════════════════════════════════════════════════════════════════

/**
 * Suggest weight and reps for the next session of a given exercise,
 * based on the most recent completed session.
 *
 * Double-progression rule:
 *   1. Hit the bottom of the rep range on all sets at current weight.
 *   2. Each session, add reps until you hit the top of the range on all sets.
 *   3. Once you hit the top of the range on all sets, add weight (5 lb upper, 10 lb lower)
 *      and reset reps to the bottom of the range.
 *
 * @param {Object} exercise - from program.exercises
 * @param {Object|null} lastSession - { weight: number, sets: Array<{reps: number}> }
 * @param {Object} progression - from program.progression
 * @returns {{
 *   weight: number,
 *   targetReps: number,
 *   isProgression: boolean,
 *   message: string
 * }}
 */
export function suggestNextSet(exercise, lastSession, progression) {
  const [minReps, maxReps] = exercise.repRange;

  // No prior session — suggest starting at bottom of range with TBD weight
  if (!lastSession) {
    return {
      weight: null,
      targetReps: minReps,
      isProgression: false,
      message: `First session — pick a weight where you can comfortably hit ${minReps} reps with 2 RIR.`
    };
  }

  const lastWeight = lastSession.weight;
  const allSetsAtTop = lastSession.sets.every(s => s.reps >= maxReps);
  const allSetsAtMin = lastSession.sets.every(s => s.reps >= minReps);

  // Determine load increment by category
  const isLowerBody = ['quads', 'hamstrings', 'glutes', 'calves'].includes(exercise.primaryMuscle);
  const increment = isLowerBody
    ? progression.loadIncrement.lowerBody
    : progression.loadIncrement.upperBody;

  // Hit the top on all sets → add weight, reset reps
  if (allSetsAtTop) {
    return {
      weight: lastWeight + increment,
      targetReps: minReps,
      isProgression: true,
      message: `Hit the top last time. Bump to ${lastWeight + increment} lbs, target ${minReps} reps.`
    };
  }

  // Otherwise, same weight, push reps up
  if (allSetsAtMin) {
    const lowestSet = Math.min(...lastSession.sets.map(s => s.reps));
    return {
      weight: lastWeight,
      targetReps: Math.min(lowestSet + 1, maxReps),
      isProgression: false,
      message: `Same weight — push reps to ${Math.min(lowestSet + 1, maxReps)}.`
    };
  }

  // Didn't even hit the bottom of the range — stay put, focus on form
  return {
    weight: lastWeight,
    targetReps: minReps,
    isProgression: false,
    message: `Repeat ${lastWeight} lbs × ${minReps} reps. Don't add load until all sets clear the bottom.`
  };
}

// ═══════════════════════════════════════════════════════════════════
// DELOAD HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply deload modifications to a working session.
 * @param {Object} suggestedSession - output from suggestNextSet
 * @param {Object} recovery - from program.recovery
 * @returns {Object} deloaded session
 */
export function applyDeload(suggestedSession, recovery) {
  if (suggestedSession.weight == null) return suggestedSession;
  const factor = recovery.deload.intensityPercent / 100;
  return {
    ...suggestedSession,
    weight: Math.round((suggestedSession.weight * factor) / 5) * 5,
    targetReps: suggestedSession.targetReps,
    message: `DELOAD: ${Math.round((suggestedSession.weight * factor) / 5) * 5} lbs (${recovery.deload.intensityPercent}% of working weight).`
  };
}

/**
 * Determine if it's deload week based on weeks since program start.
 * @param {Date} programStartDate
 * @param {number} deloadEveryWeeks
 * @returns {boolean}
 */
export function isDeloadWeek(programStartDate, deloadEveryWeeks = 7) {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const weeksSinceStart = Math.floor((Date.now() - programStartDate.getTime()) / msPerWeek);
  return weeksSinceStart > 0 && weeksSinceStart % deloadEveryWeeks === 0;
}

// ═══════════════════════════════════════════════════════════════════
// NUTRITION HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute personalized macro targets based on bodyweight and goal.
 * @param {number} bodyweightLbs
 * @param {'maintenance'|'leanBulk'|'aggressiveBulk'|'cut'} goal
 * @param {Object} nutrition - from program.nutrition
 * @returns {{ calories: number, protein: number, fat: number, carbs: number }}
 */
export function macrosForBodyweight(bodyweightLbs, goal = 'leanBulk', nutrition) {
  const calRange = nutrition.calorieTargets[goal];
  const calories = Math.round((calRange.min + calRange.max) / 2);

  // Protein: 0.9 g/lb (middle of 0.8-1.0 range)
  const protein = Math.round(bodyweightLbs * 0.9);
  // Fat: ~25% of calories, but never below 0.3 g/lb
  const fatGrams = Math.max(Math.round((calories * 0.25) / 9), Math.round(bodyweightLbs * 0.3));
  // Carbs: remainder
  const proteinCal = protein * 4;
  const fatCal = fatGrams * 9;
  const carbs = Math.round((calories - proteinCal - fatCal) / 4);

  return { calories, protein, fat: fatGrams, carbs };
}

// ═══════════════════════════════════════════════════════════════════
// FORMATTING UTILITIES (handy for UI rendering)
// ═══════════════════════════════════════════════════════════════════

/**
 * Format rest time as MM:SS or "M:SS".
 * @param {number} seconds
 * @returns {string}
 */
export function formatRest(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format rep range as "8–12".
 * @param {[number, number]} repRange
 * @returns {string}
 */
export function formatRepRange(repRange) {
  return `${repRange[0]}–${repRange[1]}`;
}

/**
 * Format an exercise's prescribed work as "4 × 8–12".
 * @param {Object} exercise
 * @returns {string}
 */
export function formatPrescription(exercise) {
  return `${exercise.sets} × ${formatRepRange(exercise.repRange)}`;
}
