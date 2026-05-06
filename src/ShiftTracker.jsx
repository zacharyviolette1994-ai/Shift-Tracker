import { useState, useEffect, useRef, useMemo } from 'react';
import { Dumbbell, Apple, TrendingUp, Plus, Minus, Check, X, Search, ScanLine, Edit3, Timer, ChevronLeft, ChevronRight, Settings, Trash2, RotateCcw, ArrowLeft, Info, Camera, Download, Utensils, ShoppingCart, Square, CheckSquare } from 'lucide-react';
import {
  PROGRAMS,
  DEFAULT_PROGRAM_ID,
  getActiveProgram,
  getActiveCycle,
  getActiveDay,
  getDayFromAnyProgram,
  getExerciseFromAnyProgram,
  getKeyLifts,
  computeVolumeFromHistory,
  normalizeProgramConfig,
} from './data/programs';

// ============================================================
// FONTS + BASE STYLES
// ============================================================
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
    .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes pulseGlow { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .pulse-glow { animation: pulseGlow 1.4s ease-in-out infinite; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .slide-up { animation: slideUp 0.25s ease-out; }
    input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; }
  `}</style>
);

// EXERCISES, WORKOUT_DAYS, DAY_CYCLE, EXERCISE_MUSCLES are now defined in
// src/data/programs.js (the program registry). Reach them via the helpers
// imported above: getExerciseFromAnyProgram(), getDayFromAnyProgram(),
// getActiveDay(), getActiveCycle(), etc.

const MUSCLE_TARGETS = {
  chest:      { label: 'Chest',      min: 10, ideal: 18, max: 22, priority: true },
  back:       { label: 'Back',       min: 10, ideal: 16, max: 22 },
  shoulders:  { label: 'Shoulders',  min: 8,  ideal: 14, max: 20 },
  quads:      { label: 'Quads',      min: 8,  ideal: 14, max: 20 },
  hamstrings: { label: 'Hamstrings', min: 6,  ideal: 12, max: 18 },
  glutes:     { label: 'Glutes',     min: 6,  ideal: 12, max: 18 },
  biceps:     { label: 'Biceps',     min: 6,  ideal: 12, max: 18 },
  triceps:    { label: 'Triceps',    min: 6,  ideal: 12, max: 18 },
  calves:     { label: 'Calves',     min: 6,  ideal: 10, max: 16 },
  abs:        { label: 'Abs',        min: 3,  ideal: 8,  max: 16 },
};

// ============================================================
// COMMON FOODS DATABASE
// ============================================================
const COMMON_FOODS = [
  { name: 'Chicken breast (cooked)', brand: 'Generic', kcal100: 165, p100: 31, c100: 0, f100: 3.6 },
  { name: 'Chicken thigh (cooked, skinless)', brand: 'Generic', kcal100: 209, p100: 26, c100: 0, f100: 11 },
  { name: 'Ground beef 93/7 (cooked)', brand: 'Generic', kcal100: 182, p100: 26, c100: 0, f100: 8 },
  { name: 'Ground beef 80/20 (cooked)', brand: 'Generic', kcal100: 254, p100: 26, c100: 0, f100: 17 },
  { name: 'Steak, sirloin (cooked)', brand: 'Generic', kcal100: 206, p100: 29, c100: 0, f100: 9 },
  { name: 'Salmon (cooked)', brand: 'Generic', kcal100: 208, p100: 20, c100: 0, f100: 13 },
  { name: 'Tilapia (cooked)', brand: 'Generic', kcal100: 129, p100: 26, c100: 0, f100: 2.7 },
  { name: 'Tuna (canned in water)', brand: 'Generic', kcal100: 116, p100: 26, c100: 0, f100: 1 },
  { name: 'Shrimp (cooked)', brand: 'Generic', kcal100: 99, p100: 24, c100: 0.2, f100: 0.3 },
  { name: 'Eggs (whole, large)', brand: 'Generic', kcal100: 155, p100: 13, c100: 1.1, f100: 11 },
  { name: 'Egg whites', brand: 'Generic', kcal100: 52, p100: 11, c100: 0.7, f100: 0.2 },
  { name: 'Greek yogurt (nonfat, plain)', brand: 'Generic', kcal100: 59, p100: 10, c100: 3.6, f100: 0.4 },
  { name: 'Greek yogurt (2%, plain)', brand: 'Generic', kcal100: 73, p100: 10, c100: 4, f100: 1.9 },
  { name: 'Cottage cheese (1%)', brand: 'Generic', kcal100: 72, p100: 12, c100: 2.7, f100: 1 },
  { name: 'Whey protein powder', brand: 'Generic', kcal100: 377, p100: 80, c100: 7, f100: 3 },
  { name: 'Pork loin (cooked)', brand: 'Generic', kcal100: 173, p100: 26, c100: 0, f100: 7 },
  { name: 'Turkey breast (cooked)', brand: 'Generic', kcal100: 135, p100: 30, c100: 0, f100: 1 },
  { name: 'Bacon (cooked)', brand: 'Generic', kcal100: 541, p100: 37, c100: 1.4, f100: 42 },
  { name: 'Tofu (firm)', brand: 'Generic', kcal100: 144, p100: 17, c100: 2.8, f100: 9 },
  { name: 'White rice (cooked)', brand: 'Generic', kcal100: 130, p100: 2.7, c100: 28, f100: 0.3 },
  { name: 'Brown rice (cooked)', brand: 'Generic', kcal100: 112, p100: 2.6, c100: 24, f100: 0.9 },
  { name: 'Oats (dry, rolled)', brand: 'Generic', kcal100: 389, p100: 17, c100: 66, f100: 7 },
  { name: 'Oatmeal (cooked in water)', brand: 'Generic', kcal100: 71, p100: 2.5, c100: 12, f100: 1.5 },
  { name: 'Sweet potato (baked)', brand: 'Generic', kcal100: 90, p100: 2, c100: 21, f100: 0.2 },
  { name: 'White potato (baked)', brand: 'Generic', kcal100: 93, p100: 2.5, c100: 21, f100: 0.1 },
  { name: 'Pasta (cooked)', brand: 'Generic', kcal100: 131, p100: 5, c100: 25, f100: 1.1 },
  { name: 'Whole wheat bread', brand: 'Generic', kcal100: 247, p100: 13, c100: 41, f100: 3.4 },
  { name: 'White bread', brand: 'Generic', kcal100: 265, p100: 9, c100: 49, f100: 3.2 },
  { name: 'Bagel (plain)', brand: 'Generic', kcal100: 257, p100: 10, c100: 50, f100: 1.6 },
  { name: 'Quinoa (cooked)', brand: 'Generic', kcal100: 120, p100: 4.4, c100: 21, f100: 1.9 },
  { name: 'Tortilla (flour, 10-inch)', brand: 'Generic', kcal100: 325, p100: 8, c100: 54, f100: 8 },
  { name: 'Tortilla (corn)', brand: 'Generic', kcal100: 218, p100: 5.7, c100: 45, f100: 2.9 },
  { name: 'Rice cakes', brand: 'Generic', kcal100: 387, p100: 8, c100: 82, f100: 2.8 },
  { name: 'Banana', brand: 'Generic', kcal100: 89, p100: 1.1, c100: 23, f100: 0.3 },
  { name: 'Apple', brand: 'Generic', kcal100: 52, p100: 0.3, c100: 14, f100: 0.2 },
  { name: 'Blueberries', brand: 'Generic', kcal100: 57, p100: 0.7, c100: 14, f100: 0.3 },
  { name: 'Strawberries', brand: 'Generic', kcal100: 32, p100: 0.7, c100: 7.7, f100: 0.3 },
  { name: 'Raspberries', brand: 'Generic', kcal100: 52, p100: 1.2, c100: 12, f100: 0.7 },
  { name: 'Orange', brand: 'Generic', kcal100: 47, p100: 0.9, c100: 12, f100: 0.1 },
  { name: 'Grapes', brand: 'Generic', kcal100: 69, p100: 0.7, c100: 18, f100: 0.2 },
  { name: 'Pineapple', brand: 'Generic', kcal100: 50, p100: 0.5, c100: 13, f100: 0.1 },
  { name: 'Watermelon', brand: 'Generic', kcal100: 30, p100: 0.6, c100: 7.6, f100: 0.2 },
  { name: 'Broccoli (cooked)', brand: 'Generic', kcal100: 34, p100: 2.8, c100: 7, f100: 0.4 },
  { name: 'Spinach (raw)', brand: 'Generic', kcal100: 23, p100: 2.9, c100: 3.6, f100: 0.4 },
  { name: 'Asparagus', brand: 'Generic', kcal100: 20, p100: 2.2, c100: 3.9, f100: 0.1 },
  { name: 'Green beans', brand: 'Generic', kcal100: 31, p100: 1.8, c100: 7, f100: 0.1 },
  { name: 'Bell pepper', brand: 'Generic', kcal100: 31, p100: 1, c100: 6, f100: 0.3 },
  { name: 'Carrots', brand: 'Generic', kcal100: 41, p100: 0.9, c100: 10, f100: 0.2 },
  { name: 'Mixed salad greens', brand: 'Generic', kcal100: 15, p100: 1.4, c100: 2.9, f100: 0.1 },
  { name: 'Cucumber', brand: 'Generic', kcal100: 16, p100: 0.7, c100: 3.6, f100: 0.1 },
  { name: 'Avocado', brand: 'Generic', kcal100: 160, p100: 2, c100: 9, f100: 15 },
  { name: 'Almonds', brand: 'Generic', kcal100: 579, p100: 21, c100: 22, f100: 50 },
  { name: 'Peanuts', brand: 'Generic', kcal100: 567, p100: 26, c100: 16, f100: 49 },
  { name: 'Walnuts', brand: 'Generic', kcal100: 654, p100: 15, c100: 14, f100: 65 },
  { name: 'Cashews', brand: 'Generic', kcal100: 553, p100: 18, c100: 30, f100: 44 },
  { name: 'Peanut butter', brand: 'Generic', kcal100: 588, p100: 25, c100: 20, f100: 50 },
  { name: 'Almond butter', brand: 'Generic', kcal100: 614, p100: 21, c100: 19, f100: 56 },
  { name: 'Olive oil', brand: 'Generic', kcal100: 884, p100: 0, c100: 0, f100: 100 },
  { name: 'Butter', brand: 'Generic', kcal100: 717, p100: 0.9, c100: 0.1, f100: 81 },
  { name: 'Milk (whole)', brand: 'Generic', kcal100: 61, p100: 3.2, c100: 4.8, f100: 3.3 },
  { name: 'Milk (2%)', brand: 'Generic', kcal100: 50, p100: 3.3, c100: 4.8, f100: 2 },
  { name: 'Milk (skim)', brand: 'Generic', kcal100: 34, p100: 3.4, c100: 5, f100: 0.1 },
  { name: 'Almond milk (unsweetened)', brand: 'Generic', kcal100: 13, p100: 0.4, c100: 0.3, f100: 1.1 },
  { name: 'Cheddar cheese', brand: 'Generic', kcal100: 402, p100: 25, c100: 1.3, f100: 33 },
  { name: 'Mozzarella (part skim)', brand: 'Generic', kcal100: 254, p100: 25, c100: 3, f100: 16 },
  { name: 'Parmesan cheese', brand: 'Generic', kcal100: 431, p100: 38, c100: 4.1, f100: 29 },
  { name: 'Feta cheese', brand: 'Generic', kcal100: 264, p100: 14, c100: 4, f100: 21 },
];

// ============================================================
// STORAGE
// ============================================================
const store = {
  async get(key, fallback = null) {
    try {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : fallback;
    } catch { return fallback; }
  },
  async set(key, value) {
    try { await window.storage.set(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  async del(key) {
    try { await window.storage.delete(key); return true; }
    catch { return false; }
  }
};

// ============================================================
// MEAL TEMPLATES + GROCERY (seeded on first run only)
// ============================================================
const SEED_TEMPLATES = [
  {
    id: 'tpl-breakfast',
    name: 'BREAKFAST',
    foods: [
      { name: 'Oats (dry, rolled)',    kcal100: 389, p100: 17,  c100: 66, f100: 7,   grams: 120 },
      { name: 'Milk (whole)',          kcal100: 61,  p100: 3.2, c100: 4.8, f100: 3.3, grams: 250 },
      { name: 'Banana',                kcal100: 89,  p100: 1.1, c100: 23, f100: 0.3, grams: 118 },
      { name: 'Whey protein powder',   kcal100: 377, p100: 80,  c100: 7,  f100: 3,   grams: 30  },
    ],
  },
  {
    id: 'tpl-lunch',
    name: 'LUNCH',
    foods: [
      { name: 'White rice (cooked)',         kcal100: 130, p100: 2.7, c100: 28, f100: 0.3, grams: 300 },
      { name: 'Chicken breast (cooked)',     kcal100: 165, p100: 31,  c100: 0,  f100: 3.6, grams: 200 },
      { name: 'Broccoli (cooked)',           kcal100: 34,  p100: 2.8, c100: 7,  f100: 0.4, grams: 150 },
      { name: 'Olive oil',                   kcal100: 884, p100: 0,   c100: 0,  f100: 100, grams: 30  },
    ],
  },
  {
    id: 'tpl-dinner',
    name: 'DINNER',
    foods: [
      { name: 'White rice (cooked)',         kcal100: 130, p100: 2.7, c100: 28, f100: 0.3, grams: 300 },
      { name: 'Ground beef 93/7 (cooked)',   kcal100: 182, p100: 26,  c100: 0,  f100: 8,   grams: 200 },
      { name: 'Broccoli (cooked)',           kcal100: 34,  p100: 2.8, c100: 7,  f100: 0.4, grams: 150 },
    ],
  },
  {
    id: 'tpl-snack',
    name: 'SNACK',
    foods: [
      { name: 'Greek yogurt (nonfat, plain)', kcal100: 59,  p100: 10,  c100: 3.6, f100: 0.4, grams: 200 },
      { name: 'Banana',                       kcal100: 89,  p100: 1.1, c100: 23,  f100: 0.3, grams: 236 },
      { name: 'Peanut butter',                kcal100: 588, p100: 25,  c100: 20,  f100: 50,  grams: 32  },
    ],
  },
];

const SEED_GROCERY = [
  'Chicken breast (3 lb)',
  'Ground beef 93/7 (3 lb)',
  'Greek yogurt, nonfat (48 oz)',
  'Whey protein (5 lb tub)',
  'Rolled oats (42 oz)',
  'White rice (5 lb bag)',
  'Bananas (21)',
  'Frozen broccoli (4 lb)',
  'Peanut butter (16 oz)',
  'Olive oil',
  'Whole milk (½ gal)',
];

function templateTotals(tpl) {
  return tpl.foods.reduce((acc, food) => {
    const f = food.grams / 100;
    return {
      kcal: acc.kcal + food.kcal100 * f,
      p:    acc.p    + food.p100    * f,
      c:    acc.c    + food.c100    * f,
      f:    acc.f    + food.f100    * f,
    };
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

async function logMealTemplate(template) {
  const foodKey = `food:${todayKey()}`;
  const current = await store.get(foodKey, { meals: [], weight: null });
  const nowIso = new Date().toISOString();
  const newEntries = template.foods.map((food, i) => {
    const f = food.grams / 100;
    return {
      id: `${Date.now().toString(36)}-${i}`,
      time: nowIso,
      name: food.name,
      brand: '',
      kcal: Math.round(food.kcal100 * f),
      protein: Math.round(food.p100 * f * 10) / 10,
      carbs:   Math.round(food.c100 * f * 10) / 10,
      fat:     Math.round(food.f100 * f * 10) / 10,
      servingGrams: food.grams,
      servings: null,
    };
  });
  await store.set(foodKey, {
    ...current,
    meals: [...(current.meals || []), ...newEntries],
  });
}

async function exportAllData() {
  const keys = await window.storage.listKeys('');
  const out = { exportedAt: new Date().toISOString(), version: 1, data: {} };
  for (const k of keys) {
    const raw = await window.storage.get(k);
    if (raw) {
      try { out.data[k] = JSON.parse(raw.value); }
      catch { out.data[k] = raw.value; }
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shift-backup-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// PROGRESSION (double progression)
// ============================================================
function evaluatePerformance(exerciseId, sets) {
  const ex = getExerciseFromAnyProgram(exerciseId);
  if (!ex || !sets.length) return 'hold';
  const completedAll = sets.every(s => s.reps >= ex.repMin);
  if (!completedAll) return 'miss';
  const allAtTop = sets.every(s => s.reps >= ex.repMax);
  return allAtTop ? 'progress' : 'hold';
}

function nextWeight(exerciseId, currentWeight, perfHistory = []) {
  const ex = getExerciseFromAnyProgram(exerciseId);
  if (!ex || !currentWeight) return currentWeight;
  const last = perfHistory[perfHistory.length - 1];
  if (last === 'progress') return currentWeight + ex.incr;
  const last3 = perfHistory.slice(-3);
  if (last3.length === 3 && last3.every(p => p === 'miss')) {
    return Math.max(ex.incr, Math.round((currentWeight * 0.9) / ex.incr) * ex.incr);
  }
  return currentWeight;
}

// ============================================================
// OPEN FOOD FACTS
// ============================================================
async function searchFoods(query) {
  if (!query || query.length < 2) return { results: [], error: null };
  const q = query.toLowerCase().trim();

  const builtin = COMMON_FOODS
    .filter(f => f.name.toLowerCase().includes(q))
    .slice(0, 15);

  let offResults = [];
  let error = null;
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20&fields=code,product_name,brands,nutriments,serving_size,image_small_url`;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    offResults = (data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(p => {
        let kcal = Number(p.nutriments['energy-kcal_100g']) || 0;
        if (!kcal && p.nutriments.energy_100g) {
          kcal = Math.round(Number(p.nutriments.energy_100g) * 0.239);
        }
        return {
          barcode: p.code,
          name: p.product_name,
          brand: p.brands || '',
          kcal100: kcal,
          p100: Number(p.nutriments.proteins_100g) || 0,
          c100: Number(p.nutriments.carbohydrates_100g) || 0,
          f100: Number(p.nutriments.fat_100g) || 0,
          serving: p.serving_size || '100 g',
          img: p.image_small_url || null,
        };
      })
      .filter(p => p.kcal100 > 0)
      .slice(0, 15);
  } catch (e) {
    error = e.name === 'AbortError' ? 'Online search timed out' : 'Online search unavailable';
  }

  return { results: [...builtin, ...offResults], error };
}

async function fetchByBarcode(barcode) {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return { error: 'network', message: `Database returned ${res.status}` };
    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      return { error: 'notfound', message: `Barcode ${barcode} isn't in the Open Food Facts database yet.` };
    }
    const p = data.product;
    return {
      food: {
        barcode: p.code || barcode,
        name: p.product_name || 'Unknown product',
        brand: p.brands || '',
        kcal100: Number(p.nutriments?.['energy-kcal_100g']) || 0,
        p100: Number(p.nutriments?.proteins_100g) || 0,
        c100: Number(p.nutriments?.carbohydrates_100g) || 0,
        f100: Number(p.nutriments?.fat_100g) || 0,
        serving: p.serving_size || '100 g',
        img: p.image_small_url || null,
      }
    };
  } catch (e) {
    if (e.name === 'AbortError') return { error: 'timeout', message: 'Lookup timed out after 5 seconds.' };
    return { error: 'network', message: 'Could not reach the product database.' };
  }
}

// ============================================================
// UTILITIES
// ============================================================
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const fmtTime = (sec) => `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

// Hypertrophy macro presets. Multipliers are per lb of body weight.
// Calorie values bracket maintenance (≈14 kcal/lb for trained lifters) in
// ~250–360 kcal steps — roughly 0.5–1 lb/week change on each side.
// Protein and fat are research-backed minimums for muscle retention/gain.
const GOAL_PRESETS = {
  cut:      { label: 'CUT',        blurb: 'Fat loss · ~0.5–1 lb/wk down',  kcalMul: 12, proMul: 1.1, fatMul: 0.30 },
  maintain: { label: 'MAINTAIN',   blurb: 'Hold weight, recomp',           kcalMul: 14, proMul: 1.0, fatMul: 0.35 },
  lean:     { label: 'LEAN BULK',  blurb: 'Slow gain · ~0.5 lb/wk up',     kcalMul: 16, proMul: 1.0, fatMul: 0.35 },
  bulk:     { label: 'BULK',       blurb: 'Faster gain · ~0.75–1 lb/wk',   kcalMul: 17, proMul: 1.0, fatMul: 0.40 },
};

function normalizeGoal(g) {
  return GOAL_PRESETS[g] ? g : 'lean';
}

function computeTargets(bodyWeight, goal = 'lean') {
  const bw = Number(bodyWeight) || 180;
  const preset = GOAL_PRESETS[normalizeGoal(goal)];
  const kcal = Math.round(bw * preset.kcalMul);
  const protein = Math.round(bw * preset.proMul);
  const fat = Math.round(bw * preset.fatMul);
  const carbs = Math.max(0, Math.round((kcal - protein*4 - fat*9) / 4));
  return { kcal, protein, carbs, fat };
}

// ============================================================
// MAIN APP
// ============================================================
export default function ShiftTracker() {
  const [tab, setTab] = useState('train');
  const [config, setConfig] = useState(null);
  const [exerciseState, setExerciseState] = useState({});
  const [history, setHistory] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [mealTemplates, setMealTemplates] = useState([]);
  const [grocery, setGrocery] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const cfg = await store.get('config', {
        bodyWeight: 180,
        goal: 'lean',
        restTimer: 90,
        dayIndex: 0,
        activeProgram: DEFAULT_PROGRAM_ID,
        targets: computeTargets(180, 'lean'),
        createdAt: new Date().toISOString(),
      });
      cfg.goal = normalizeGoal(cfg.goal);
      setConfig(normalizeProgramConfig(cfg));

      setExerciseState(await store.get('exercises_state', {}));
      setHistory(await store.get('workout_history', []));
      setCustomFoods(await store.get('custom_foods', []));
      setRecentFoods(await store.get('recent_foods', []));

      let tpls = await store.get('meal_templates', null);
      if (tpls === null) { tpls = SEED_TEMPLATES; await store.set('meal_templates', tpls); }
      setMealTemplates(tpls);

      let gl = await store.get('grocery_list', null);
      if (gl === null) {
        gl = SEED_GROCERY.map((text, i) => ({ id: `seed-${i}`, text, checked: false }));
        await store.set('grocery_list', gl);
      }
      setGrocery(gl);
      const aw = await store.get('active_workout', null);
      if (aw) setActiveWorkout(aw);
      setLoaded(true);
    })();
  }, []);

  const saveConfig = async (next) => { setConfig(next); await store.set('config', next); };
  const saveExState = async (next) => { setExerciseState(next); await store.set('exercises_state', next); };
  const saveHistory = async (next) => { setHistory(next); await store.set('workout_history', next); };
  const saveCustomFoods = async (next) => { setCustomFoods(next); await store.set('custom_foods', next); };
  const saveRecentFoods = async (next) => { setRecentFoods(next); await store.set('recent_foods', next); };
  const saveMealTemplates = async (next) => { setMealTemplates(next); await store.set('meal_templates', next); };
  const saveGrocery = async (next) => { setGrocery(next); await store.set('grocery_list', next); };
  const saveActiveWorkout = async (next) => {
    setActiveWorkout(next);
    if (next) await store.set('active_workout', next);
    else await store.del('active_workout');
  };

  if (!loaded || !config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FontStyles />
        <div className="font-display text-4xl text-amber-400 pulse-glow">SHIFT</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-neutral-100 font-body relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: activeWorkout ? 'env(safe-area-inset-bottom)' : 'calc(env(safe-area-inset-bottom) + 4.5rem)',
      }}
    >
      <FontStyles />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-40" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 180, 0, 0.08), transparent 70%)'
      }} />

      <div className="relative z-10 px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <div className="font-display text-3xl text-amber-400">SHIFT</div>
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Tracker · v1</div>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 text-neutral-300 hover:text-white">
          <Settings size={20} />
        </button>
      </div>

      <div className="relative z-10">
        {activeWorkout ? (
          <WorkoutSession
            workout={activeWorkout}
            exerciseState={exerciseState}
            restTimer={config.restTimer}
            onFinish={async (completed) => {
              const newExState = { ...exerciseState };
              for (const ex of completed.exercises) {
                const perf = evaluatePerformance(ex.id, ex.sets);
                const prev = newExState[ex.id] || { weight: ex.sets[0]?.weight || 0, perfHistory: [] };
                const newHistory = [...(prev.perfHistory || []), perf].slice(-10);
                const topSetWeight = ex.sets.length ? Math.max(...ex.sets.map(s => s.weight)) : prev.weight;
                newExState[ex.id] = {
                  weight: nextWeight(ex.id, topSetWeight, newHistory),
                  lastCompleted: new Date().toISOString(),
                  perfHistory: newHistory,
                };
              }
              await saveExState(newExState);

              const record = {
                date: new Date().toISOString(),
                dayKey: completed.dayKey,
                exercises: completed.exercises,
                durationSec: Math.floor((Date.now() - new Date(completed.startedAt).getTime()) / 1000),
              };
              await saveHistory([record, ...history].slice(0, 60));

              const cycle = getActiveCycle(config);
              await saveConfig({ ...config, dayIndex: (config.dayIndex + 1) % cycle.length });
              await saveActiveWorkout(null);
            }}
            onCancel={async () => { await saveActiveWorkout(null); }}
            onUpdate={saveActiveWorkout}
          />
        ) : (
          <>
            {tab === 'train' && (
              <TrainView
                config={config}
                exerciseState={exerciseState}
                history={history}
                onStart={async (dayKey) => {
                  const day = getDayFromAnyProgram(dayKey);
                  if (!day) return;
                  const w = {
                    dayKey,
                    startedAt: new Date().toISOString(),
                    exercises: day.exercises.map(id => {
                      const meta = getExerciseFromAnyProgram(id);
                      return {
                        id,
                        sets: Array(meta?.sets || 3).fill(null).map(() => ({ weight: null, reps: null, done: false })),
                      };
                    }),
                  };
                  await saveActiveWorkout(w);
                }}
                onPickDay={async (idx) => { await saveConfig({ ...config, dayIndex: idx }); }}
              />
            )}
            {tab === 'fuel' && (
              <FuelView
                config={config}
                customFoods={customFoods}
                saveCustomFoods={saveCustomFoods}
                recentFoods={recentFoods}
                saveRecentFoods={saveRecentFoods}
              />
            )}
            {tab === 'meals' && (
              <MealsView
                templates={mealTemplates}
                saveTemplates={saveMealTemplates}
                grocery={grocery}
                saveGrocery={saveGrocery}
                customFoods={customFoods}
                saveCustomFoods={saveCustomFoods}
                recentFoods={recentFoods}
                targets={config.targets}
              />
            )}
            {tab === 'stats' && (
              <StatsView config={config} history={history} exerciseState={exerciseState} />
            )}
          </>
        )}
      </div>

      {!activeWorkout && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 bg-black/95 backdrop-blur border-t border-neutral-800"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex">
            <TabBtn icon={<Dumbbell size={20} />} label="TRAIN" active={tab==='train'} onClick={() => setTab('train')} />
            <TabBtn icon={<Apple size={20} />} label="FUEL" active={tab==='fuel'} onClick={() => setTab('fuel')} />
            <TabBtn icon={<Utensils size={20} />} label="MEALS" active={tab==='meals'} onClick={() => setTab('meals')} />
            <TabBtn icon={<TrendingUp size={20} />} label="STATS" active={tab==='stats'} onClick={() => setTab('stats')} />
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          config={config}
          onSave={async (next) => { await saveConfig(next); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${active ? 'text-amber-400' : 'text-neutral-400'}`}>
      {icon}
      <span className="font-display text-xs tracking-widest">{label}</span>
    </button>
  );
}

// ============================================================
// TRAIN VIEW
// ============================================================
function TrainView({ config, exerciseState, history, onStart, onPickDay }) {
  const cycle = getActiveCycle(config);
  const program = getActiveProgram(config);
  const currentDayKey = cycle[config.dayIndex % cycle.length];
  const day = program.days[currentDayKey];
  const lastWorkout = history[0];
  const lastWorkoutDay = lastWorkout ? getDayFromAnyProgram(lastWorkout.dayKey) : null;
  const thisWeek = history.filter(h => (Date.now() - new Date(h.date).getTime()) < 7*24*60*60*1000).length;

  return (
    <div className="px-5 pt-2 slide-up">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900 p-5 mb-4">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ backgroundColor: day.color }} />
        <div className="relative">
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Next up</div>
          <div className="flex items-baseline gap-3 mb-3">
            <div className="font-display text-6xl leading-none" style={{ color: day.color }}>{day.label}</div>
            <div className="font-mono text-xs text-neutral-400">DAY {config.dayIndex+1}/{cycle.length}</div>
          </div>
          <div className="text-neutral-300 text-sm mb-4">
            {day.exercises.length} exercises · ~{Math.round(day.exercises.length * 8)} min
          </div>
          <button
            onClick={() => onStart(currentDayKey)}
            className="w-full py-4 rounded-xl font-display text-2xl tracking-wider transition-all active:scale-95 hover:brightness-110"
            style={{ backgroundColor: day.color, color: '#0a0a0a' }}
          >
            START WORKOUT →
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Today's Lifts</div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
          {day.exercises.map((exId, idx) => {
            const ex = getExerciseFromAnyProgram(exId);
            if (!ex) return null;
            const st = exerciseState[exId];
            return (
              <div key={exId} className={`flex items-center justify-between px-4 py-4 ${idx < day.exercises.length - 1 ? 'border-b border-neutral-800' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-base font-semibold truncate leading-tight">{ex.name}</div>
                  <div className="font-mono text-xs text-neutral-400 mt-1">{ex.sets} × {ex.repMin}–{ex.repMax}</div>
                </div>
                <div className="text-right ml-3">
                  {st?.weight ? (
                    <>
                      <div className="font-mono text-lg font-bold text-amber-400">{st.weight}</div>
                      <div className="font-mono text-[10px] text-neutral-400 -mt-1">LB</div>
                    </>
                  ) : (
                    <div className="font-mono text-sm text-neutral-600">—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Cycle</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          {cycle.map((k, idx) => {
            const d = program.days[k];
            const active = idx === config.dayIndex;
            return (
              <button
                key={k}
                onClick={() => onPickDay(idx)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-lg font-display tracking-wider text-base border-2 transition-all ${
                  active ? 'bg-neutral-800' : 'border-neutral-700 text-neutral-400'
                }`}
                style={active ? { color: d.color, borderColor: d.color } : undefined}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">This Week</div>
          <div className="font-display text-4xl text-white">{thisWeek}</div>
          <div className="font-mono text-[10px] text-neutral-400">workouts logged</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Last Session</div>
          <div className="font-display text-4xl text-white">
            {lastWorkoutDay ? lastWorkoutDay.label.slice(0,4) : '—'}
          </div>
          <div className="font-mono text-[10px] text-neutral-400">
            {lastWorkout ? new Date(lastWorkout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'no data'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WORKOUT SESSION
// ============================================================
function WorkoutSession({ workout, exerciseState, restTimer, onFinish, onCancel, onUpdate }) {
  const [currentIdx, setCurrentIdx] = useState(() => {
    const firstIncomplete = workout.exercises.findIndex(ex => ex.sets.some(s => !s.done));
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [restEnd, setRestEnd] = useState(null);
  const [restNow, setRestNow] = useState(Date.now());
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const day = getDayFromAnyProgram(workout.dayKey);
  const currentEx = workout.exercises[currentIdx];
  const currentExMeta = getExerciseFromAnyProgram(currentEx.id);
  const prevWeight = exerciseState[currentEx.id]?.weight || null;

  useEffect(() => {
    if (!restEnd) return;
    const iv = setInterval(() => setRestNow(Date.now()), 250);
    return () => clearInterval(iv);
  }, [restEnd]);

  const restRemaining = restEnd ? Math.max(0, Math.ceil((restEnd - restNow) / 1000)) : 0;

  const updateSet = async (setIdx, patch) => {
    const updated = { ...workout };
    updated.exercises = workout.exercises.map((ex, i) => {
      if (i !== currentIdx) return ex;
      return { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, ...patch } : s) };
    });
    await onUpdate(updated);
  };

  const logSet = async (setIdx, explicitWeight, explicitReps) => {
    const s = currentEx.sets[setIdx];
    const w = explicitWeight ?? s.weight;
    const r = explicitReps ?? s.reps;
    if (!w || !r) return;
    await updateSet(setIdx, { weight: w, reps: r, done: true });
    setRestEnd(Date.now() + restTimer * 1000);
  };

  const unlogSet = async (setIdx) => {
    await updateSet(setIdx, { done: false });
    setRestEnd(null);
  };

  const allSetsDone = currentEx.sets.every(s => s.done);
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const doneSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
  const progress = Math.round((doneSets / totalSets) * 100);

  const goNext = () => {
    const nextIdx = workout.exercises.findIndex((ex, i) => i > currentIdx && ex.sets.some(s => !s.done));
    if (nextIdx >= 0) { setCurrentIdx(nextIdx); setRestEnd(null); }
    else setShowFinishConfirm(true);
  };

  const anyLogged = workout.exercises.some(ex => ex.sets.some(s => s.done));

  return (
    <div className="px-5 pt-2 slide-up">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setShowCancelConfirm(true)} className="flex items-center gap-1 text-neutral-400 text-sm">
          <X size={16} /> Cancel
        </button>
        <div className="font-mono text-xs text-neutral-400">{doneSets}/{totalSets} SETS</div>
      </div>

      <div className="h-1 bg-neutral-800 rounded-full mb-5 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: day.color }} />
      </div>

      <div className="mb-2">
        <div className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: day.color }}>
          {day.label} · {currentIdx + 1} / {workout.exercises.length}
        </div>
        <div className="font-display text-4xl leading-tight text-white">{currentExMeta.name.toUpperCase()}</div>
        <div className="font-mono text-xs text-neutral-400 mt-1">
          TARGET: {currentExMeta.sets} × {currentExMeta.repMin}–{currentExMeta.repMax} REPS
          {prevWeight && <span className="text-amber-400 ml-2">· LAST: {prevWeight} LB</span>}
        </div>
      </div>

      {restEnd && restRemaining > 0 && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-amber-400" />
            <div className="font-mono text-sm text-neutral-300">Rest</div>
          </div>
          <div className="font-mono text-2xl text-amber-400">{fmtTime(restRemaining)}</div>
          <div className="flex gap-1">
            <button onClick={() => setRestEnd(Date.now() + (restRemaining+15)*1000)} className="px-2 py-1 text-xs bg-neutral-700 rounded font-mono text-neutral-300">+15</button>
            <button onClick={() => setRestEnd(null)} className="px-2 py-1 text-xs bg-neutral-700 rounded font-mono text-neutral-300">SKIP</button>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-5">
        {currentEx.sets.map((s, idx) => (
          <SetRow
            key={idx}
            setNum={idx+1}
            set={s}
            prevWeight={prevWeight}
            target={currentExMeta}
            prevSet={idx > 0 ? currentEx.sets[idx-1] : null}
            onUpdate={(patch) => updateSet(idx, patch)}
            onLog={(w, r) => logSet(idx, w, r)}
            onUnlog={() => unlogSet(idx)}
          />
        ))}
      </div>

      <div className="sticky bottom-4 space-y-2 pt-4 pb-2">
        {allSetsDone ? (
          <button
            onClick={goNext}
            className="w-full py-4 rounded-xl font-display text-xl tracking-wider transition-all active:scale-95"
            style={{ backgroundColor: day.color, color: '#0a0a0a' }}
          >
            {currentIdx < workout.exercises.length - 1 ? 'NEXT EXERCISE →' : 'FINISH WORKOUT ✓'}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="w-full py-3 rounded-xl font-display text-base tracking-wider border border-neutral-700 text-neutral-300"
          >
            SKIP TO NEXT EXERCISE
          </button>
        )}

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {workout.exercises.map((ex, i) => {
            const allDone = ex.sets.every(s => s.done);
            const anyDone = ex.sets.some(s => s.done);
            return (
              <button key={i} onClick={() => { setCurrentIdx(i); setRestEnd(null); }}
                className={`flex-shrink-0 w-8 h-8 rounded text-xs font-mono transition-all ${
                  i === currentIdx ? 'bg-amber-400 text-black' :
                  allDone ? 'bg-emerald-950 text-emerald-400' :
                  anyDone ? 'bg-neutral-700 text-amber-400' :
                  'bg-neutral-900 text-neutral-600'
                }`}>
                {i+1}
              </button>
            );
          })}
        </div>
      </div>

      {showFinishConfirm && (
        <Modal onClose={() => setShowFinishConfirm(false)}>
          <div className="font-display text-2xl mb-2">FINISH WORKOUT?</div>
          <div className="text-neutral-300 text-sm mb-4">
            {doneSets} of {totalSets} sets logged. Progress will be saved and weights adjusted for next session.
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFinishConfirm(false)} className="flex-1 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-display tracking-wider">BACK</button>
            <button onClick={() => {
              const completed = {
                ...workout,
                exercises: workout.exercises.map(ex => ({
                  ...ex,
                  sets: ex.sets.filter(s => s.done).map(s => ({ weight: Number(s.weight), reps: Number(s.reps) }))
                })).filter(ex => ex.sets.length > 0)
              };
              onFinish(completed);
            }} className="flex-1 py-3 rounded-lg bg-amber-400 text-black font-display tracking-wider">FINISH</button>
          </div>
        </Modal>
      )}

      {showCancelConfirm && (
        <Modal onClose={() => setShowCancelConfirm(false)}>
          <div className="font-display text-2xl mb-2">CANCEL WORKOUT?</div>
          <div className="text-neutral-300 text-sm mb-4">
            {anyLogged ? 'Logged sets will be lost. No progress will be saved.' : 'No progress logged yet.'}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-display tracking-wider">KEEP GOING</button>
            <button onClick={onCancel} className="flex-1 py-3 rounded-lg bg-red-500 text-white font-display tracking-wider">CANCEL</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SetRow({ setNum, set, prevWeight, prevSet, target, onUpdate, onLog, onUnlog }) {
  const [weight, setWeight] = useState(set.weight ?? '');
  const [reps, setReps] = useState(set.reps ?? '');

  useEffect(() => {
    if ((set.weight === null || set.weight === undefined) && !weight) {
      const w = prevSet?.weight || prevWeight;
      if (w) {
        setWeight(w);
        onUpdate({ weight: Number(w) });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (patch) => onUpdate(patch);

  if (set.done) {
    return (
      <button onClick={onUnlog} className="w-full flex items-center gap-3 bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3">
        <div className="font-mono text-xs text-emerald-400 w-8 text-left">#{setNum}</div>
        <div className="flex-1 flex items-center justify-center gap-4">
          <span className="font-mono text-base text-white">{set.weight} <span className="text-xs text-neutral-400">lb</span></span>
          <span className="text-neutral-700">×</span>
          <span className="font-mono text-base text-white">{set.reps} <span className="text-xs text-neutral-400">reps</span></span>
        </div>
        <Check size={18} className="text-emerald-400" />
      </button>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
      <div className="font-mono text-xs text-neutral-400 w-7">#{setNum}</div>

      <div className="flex-1">
        <div className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider">Weight</div>
        <div className="flex items-center gap-1">
          <button onClick={() => {
            const nv = Math.max(0, Number(weight || 0) - (target.incr || 5));
            setWeight(nv); commit({ weight: nv });
          }} className="w-7 h-7 rounded bg-neutral-800 text-neutral-300"><Minus size={14} className="mx-auto"/></button>
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            onBlur={e => commit({ weight: e.target.value ? Number(e.target.value) : null })}
            className="flex-1 min-w-0 bg-transparent font-mono text-base text-white text-center outline-none w-full"
            placeholder="0"
          />
          <button onClick={() => {
            const nv = Number(weight || 0) + (target.incr || 5);
            setWeight(nv); commit({ weight: nv });
          }} className="w-7 h-7 rounded bg-neutral-800 text-neutral-300"><Plus size={14} className="mx-auto"/></button>
        </div>
      </div>

      <div className="flex-1">
        <div className="font-mono text-[9px] text-neutral-600 uppercase tracking-wider">Reps</div>
        <div className="flex items-center gap-1">
          <button onClick={() => {
            const nv = Math.max(0, Number(reps || 0) - 1);
            setReps(nv); commit({ reps: nv });
          }} className="w-7 h-7 rounded bg-neutral-800 text-neutral-300"><Minus size={14} className="mx-auto"/></button>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={e => setReps(e.target.value)}
            onBlur={e => commit({ reps: e.target.value ? Number(e.target.value) : null })}
            className="flex-1 min-w-0 bg-transparent font-mono text-base text-white text-center outline-none w-full"
            placeholder="0"
          />
          <button onClick={() => {
            const nv = Number(reps || 0) + 1;
            setReps(nv); commit({ reps: nv });
          }} className="w-7 h-7 rounded bg-neutral-800 text-neutral-300"><Plus size={14} className="mx-auto"/></button>
        </div>
      </div>

      <button
        onClick={() => {
          const w = Number(weight);
          const r = Number(reps);
          if (!w || !r) return;
          onUpdate({ weight: w, reps: r });
          setTimeout(() => onLog(w, r), 0);
        }}
        disabled={!weight || !reps}
        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
          weight && reps ? 'bg-amber-400 text-black active:scale-95' : 'bg-neutral-800 text-neutral-700'
        }`}
      >
        <Check size={20} />
      </button>
    </div>
  );
}

// ============================================================
// FUEL VIEW
// ============================================================
function shiftDateKey(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function formatDateLabel(key) {
  if (key === todayKey()) return 'TODAY';
  if (key === shiftDateKey(todayKey(), -1)) return 'YESTERDAY';
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

function FuelView({ config, customFoods, saveCustomFoods, recentFoods, saveRecentFoods }) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewDate, setViewDate] = useState(todayKey());
  const [food, setFood] = useState({ meals: [], weight: null });

  useEffect(() => {
    (async () => {
      const f = await store.get(`food:${viewDate}`, { meals: [], weight: null });
      setFood(f);
    })();
  }, [viewDate]);

  const saveFood = async (next) => {
    setFood(next);
    await store.set(`food:${viewDate}`, next);
  };

  const targets = config.targets;
  const totals = useMemo(() => {
    return (food.meals || []).reduce((acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      p: acc.p + (m.protein || 0),
      c: acc.c + (m.carbs || 0),
      f: acc.f + (m.fat || 0),
    }), { kcal: 0, p: 0, c: 0, f: 0 });
  }, [food]);

  const addFood = async (item) => {
    const entry = {
      id: Date.now().toString(36),
      time: new Date().toISOString(),
      name: item.name,
      brand: item.brand || '',
      kcal: Math.round(item.kcal),
      protein: Math.round(item.protein * 10) / 10,
      carbs: Math.round(item.carbs * 10) / 10,
      fat: Math.round(item.fat * 10) / 10,
      servingGrams: item.servingGrams || null,
      servings: item.servings || 1,
    };
    await saveFood({ ...food, meals: [...(food.meals || []), entry] });

    const key = `${item.name}|${item.brand || ''}`;
    const filtered = recentFoods.filter(r => `${r.name}|${r.brand || ''}` !== key);
    const newRecent = [{
      name: item.name,
      brand: item.brand || '',
      kcal100: item.kcal100,
      p100: item.p100,
      c100: item.c100,
      f100: item.f100,
      barcode: item.barcode || null,
    }, ...filtered].slice(0, 20);
    await saveRecentFoods(newRecent);
    setShowAdd(false);
  };

  const removeMeal = async (id) => {
    await saveFood({ ...food, meals: food.meals.filter(m => m.id !== id) });
  };

  const isToday = viewDate === todayKey();
  const isFuture = viewDate > todayKey();

  return (
    <div className="px-5 pt-2 slide-up">
      <div className="flex items-center justify-between mb-3 bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-1.5">
        <button
          onClick={() => setViewDate(shiftDateKey(viewDate, -1))}
          className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center active:scale-95">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setViewDate(todayKey())}
          className="flex-1 text-center font-display tracking-wider text-base text-white">
          {formatDateLabel(viewDate)}
        </button>
        <button
          onClick={() => setViewDate(shiftDateKey(viewDate, 1))}
          disabled={isToday}
          className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center active:scale-95 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-5">
          <CalorieRing consumed={totals.kcal} target={targets.kcal} />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{isToday ? 'Today' : formatDateLabel(viewDate)}</div>
            <div className="font-display text-5xl leading-none text-white">{totals.kcal}</div>
            <div className="font-mono text-xs text-neutral-400 mt-1">
              / {targets.kcal} kcal · <span className="text-amber-400">{Math.max(0, targets.kcal - totals.kcal)} left</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-700 space-y-2">
          <MacroBar label="Protein" val={totals.p} target={targets.protein} unit="g" color="#ef4444" />
          <MacroBar label="Carbs"   val={totals.c} target={targets.carbs}   unit="g" color="#3b82f6" />
          <MacroBar label="Fat"     val={totals.f} target={targets.fat}     unit="g" color="#f5b400" />
        </div>
      </div>

      {!isFuture && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full mb-4 py-3 rounded-xl bg-amber-400 text-black font-display text-lg tracking-wider flex items-center justify-center gap-2"
        >
          <Plus size={18} /> LOG FOOD
        </button>
      )}

      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">
          {isToday ? "Today's Log" : 'Log'}
        </div>
        {(!food.meals || food.meals.length === 0) ? (
          <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded-xl p-8 text-center">
            <div className="text-neutral-600 text-sm">Nothing logged</div>
          </div>
        ) : (
          <div className="space-y-2">
            {[...food.meals].reverse().map(m => (
              <div key={m.id} className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{m.name}</div>
                  <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
                    <span className="text-red-500">P {m.protein}</span> · <span className="text-blue-500">C {m.carbs}</span> · <span className="text-amber-400">F {m.fat}</span>
                    {m.servings && m.servings !== 1 && <span className="text-neutral-400"> · ×{m.servings}</span>}
                  </div>
                </div>
                <div className="font-mono text-sm text-white">{m.kcal}<span className="text-[10px] text-neutral-400"> kcal</span></div>
                <button onClick={() => removeMeal(m.id)} className="p-1 text-neutral-700"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddFoodModal
          onClose={() => setShowAdd(false)}
          onAdd={addFood}
          customFoods={customFoods}
          saveCustomFoods={saveCustomFoods}
          recentFoods={recentFoods}
        />
      )}
    </div>
  );
}

function CalorieRing({ consumed, target }) {
  const pct = Math.min(100, (consumed / Math.max(1, target)) * 100);
  const circ = 2 * Math.PI * 34;
  return (
    <svg width="90" height="90" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" stroke="#1a1a1a" strokeWidth="6" fill="none" />
      <circle
        cx="40" cy="40" r="34" stroke="#f5b400" strokeWidth="6" fill="none"
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct/100) * circ}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text x="40" y="42" textAnchor="middle" fontSize="14" fontFamily="JetBrains Mono" fill="#f5f5f5">{Math.round(pct)}%</text>
    </svg>
  );
}

function MacroBar({ label, val, target, unit, color }) {
  const pct = Math.min(100, (val / Math.max(1, target)) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-mono text-[10px] text-neutral-300 uppercase tracking-wider">{label}</div>
        <div className="font-mono text-xs">
          <span className="text-white">{Math.round(val)}</span>
          <span className="text-neutral-600">/{target}{unit}</span>
        </div>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ============================================================
// BARCODE SCANNER
// ============================================================
function BarcodeScanner({ onDetect, onClose }) {
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadLib = () => new Promise((resolve, reject) => {
      if (window.Html5Qrcode) return resolve();
      const existing = document.querySelector('script[data-h5qr]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', () => reject(new Error('CDN load failed')));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
      s.setAttribute('data-h5qr', 'true');
      s.onload = resolve;
      s.onerror = () => reject(new Error('CDN load failed'));
      document.body.appendChild(s);
    });

    (async () => {
      try {
        await loadLib();
        if (cancelled) return;
        const Html5Qrcode = window.Html5Qrcode;
        if (!Html5Qrcode) throw new Error('Scanner library unavailable');

        const scanner = new Html5Qrcode('shift-scanner-region', { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: (vw, vh) => ({ width: Math.min(vw * 0.8, 300), height: Math.min(vh * 0.3, 150) }),
            aspectRatio: undefined,
          },
          (decoded) => {
            if (cancelled || detectedRef.current) return;
            detectedRef.current = true;
            scanner.stop().then(() => scanner.clear()).catch(() => {});
            onDetect(decoded);
          },
          () => {}
        );
        if (!cancelled) setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(e?.message || 'Could not start camera');
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s && s.isScanning) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-black relative z-10">
          <div className="font-display text-2xl tracking-wider text-white">SCAN</div>
          <button onClick={onClose} className="p-1 text-neutral-300"><X size={22} /></button>
        </div>

        <div className="flex-1 relative bg-black">
          <div id="shift-scanner-region" className="w-full h-full" />

          {status === 'ready' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-[280px] h-[120px] border-2 border-amber-400/60 rounded-lg" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-400 pulse-glow" />
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-neutral-400 text-sm pulse-glow">Starting camera…</div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <div className="text-red-500 font-display text-xl mb-2">CAMERA UNAVAILABLE</div>
                <div className="text-neutral-400 text-sm mb-4">{errorMsg}</div>
                <div className="text-neutral-500 text-xs">Allow camera access in your browser, or close and enter the barcode manually.</div>
              </div>
            </div>
          )}
        </div>

        {status === 'ready' && (
          <div className="px-4 py-4 border-t border-neutral-800 bg-black text-center">
            <div className="text-neutral-300 text-sm">Point at a product barcode</div>
            <div className="text-neutral-500 text-xs mt-1">Auto-detects UPC, EAN, and more</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADD FOOD MODAL
// ============================================================
function AddFoodModal({ onClose, onAdd, customFoods, saveCustomFoods, recentFoods }) {
  const [mode, setMode] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchWarning, setSearchWarning] = useState(null);

  useEffect(() => {
    if (mode !== 'search' || query.length < 2) { setResults([]); setSearchWarning(null); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { results: r, error: err } = await searchFoods(query);
      if (!cancelled) {
        setResults(r);
        setSearchWarning(err);
        setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, mode]);

  const lookupBarcode = async (codeOverride) => {
    const code = (codeOverride || barcode).trim();
    if (!code) return;
    setLoading(true); setError(null);
    const result = await fetchByBarcode(code);
    setLoading(false);
    if (result.food) {
      setSelected(result.food);
    } else if (result.error === 'notfound') {
      setError(`${result.message} Try the Custom tab to enter it manually.`);
    } else {
      setError(`${result.message} The product database isn't reachable right now — try again, or use Custom tab.`);
    }
  };

  const handleScanDetect = (code) => {
    setScannerOpen(false);
    setBarcode(code);
    lookupBarcode(code);
  };

  if (selected) {
    return <FoodPortionScreen food={selected} onClose={() => setSelected(null)} onAdd={onAdd} />;
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/95 backdrop-blur-sm" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="h-full flex flex-col slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="font-display text-2xl tracking-wider">LOG FOOD</div>
          <button onClick={onClose} className="p-1 text-neutral-300"><X size={22} /></button>
        </div>

        <div className="flex border-b border-neutral-800 overflow-x-auto no-scrollbar">
          {[
            { k: 'search',  label: 'SEARCH',  icon: <Search size={14}/> },
            { k: 'barcode', label: 'BARCODE', icon: <ScanLine size={14}/> },
            { k: 'custom',  label: 'CUSTOM',  icon: <Edit3 size={14}/> },
            { k: 'recent',  label: 'RECENT',  icon: <RotateCcw size={14}/> },
          ].map(t => (
            <button key={t.k} onClick={() => setMode(t.k)}
              className={`flex-1 min-w-[90px] py-3 flex items-center justify-center gap-1.5 font-display text-sm tracking-wider border-b-2 transition-all ${
                mode === t.k ? 'border-amber-400 text-amber-400' : 'border-transparent text-neutral-400'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {mode === 'search' && (
            <div className="p-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  autoFocus
                  placeholder="Search foods (e.g. oatmeal, chicken breast)"
                  className="w-full pl-9 pr-3 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
              {loading && <div className="text-neutral-400 text-sm px-2 py-4">Searching…</div>}
              {!loading && query.length < 2 && (
                <div className="text-neutral-500 text-xs px-2 py-3 flex items-start gap-2">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <div>Type 2+ letters. Built-in foods load instantly; branded items from Open Food Facts load if online.</div>
                </div>
              )}
              {!loading && results.map((r, i) => (
                <FoodResultRow key={i} food={r} onClick={() => setSelected(r)} />
              ))}
              {!loading && searchWarning && results.length > 0 && (
                <div className="text-neutral-500 text-xs px-2 py-3">{searchWarning} — showing built-in matches only.</div>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="text-neutral-400 text-sm px-2 py-4">
                  No matches. {searchWarning && <span className="text-neutral-500">({searchWarning}) </span>}
                  Try a different term or use the <span className="text-amber-400">Custom</span> tab to enter it manually.
                </div>
              )}
            </div>
          )}

          {mode === 'barcode' && (
            <div className="p-4">
              <button
                onClick={() => setScannerOpen(true)}
                className="w-full py-4 rounded-xl bg-amber-400 text-black font-display text-lg tracking-wider flex items-center justify-center gap-2 mb-3">
                <Camera size={20} /> SCAN BARCODE
              </button>

              <div className="text-center text-neutral-500 text-xs my-3">or enter manually</div>

              <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 mb-3">
                <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">UPC / EAN</div>
                <input
                  value={barcode} onChange={e => setBarcode(e.target.value)}
                  placeholder="0123456789012"
                  inputMode="numeric"
                  className="w-full bg-transparent font-mono text-2xl text-white outline-none tracking-wider"
                />
                <button onClick={() => lookupBarcode()} disabled={!barcode || loading}
                  className="w-full mt-3 py-3 rounded-lg border border-amber-400 text-amber-400 font-display tracking-wider disabled:opacity-40">
                  {loading ? 'LOOKING UP…' : 'LOOK UP'}
                </button>
              </div>
              {error && <div className="text-red-500 text-sm px-2">{error}</div>}
            </div>
          )}

          {mode === 'custom' && (
            <CustomFoodForm
              customFoods={customFoods}
              saveCustomFoods={saveCustomFoods}
              onPick={(f) => setSelected(f)}
            />
          )}

          {mode === 'recent' && (
            <div className="p-4">
              {recentFoods.length === 0 ? (
                <div className="text-neutral-400 text-sm px-2 py-4">No recent foods yet.</div>
              ) : recentFoods.map((r, i) => (
                <FoodResultRow key={i} food={r} onClick={() => setSelected(r)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {scannerOpen && <BarcodeScanner onDetect={handleScanDetect} onClose={() => setScannerOpen(false)} />}
    </div>
  );
}

function FoodResultRow({ food, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-3 bg-neutral-900 border border-neutral-700 rounded-lg mb-2 hover:bg-neutral-900 flex items-center gap-3">
      {food.img ? (
        <img src={food.img} alt="" className="w-10 h-10 rounded object-cover bg-neutral-800" />
      ) : (
        <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center"><Apple size={16} className="text-neutral-700" /></div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{food.name}</div>
        <div className="font-mono text-[11px] text-neutral-400 truncate">
          {food.brand && <>{food.brand} · </>}
          {Math.round(food.kcal100)} kcal/100g
        </div>
      </div>
      <ChevronRight size={16} className="text-neutral-700" />
    </button>
  );
}

// ============================================================
// FOOD PORTION
// ============================================================
function FoodPortionScreen({ food, onClose, onAdd }) {
  const [grams, setGrams] = useState(100);
  const [mode, setMode] = useState('grams');
  const [servings, setServings] = useState(1);

  const effectiveGrams = mode === 'grams' ? grams : (servings * 100);

  const compute = (per100) => Math.round((per100 * effectiveGrams / 100) * 10) / 10;
  const kcal = compute(food.kcal100);
  const p = compute(food.p100);
  const c = compute(food.c100);
  const f = compute(food.f100);

  return (
    <div className="fixed inset-0 z-40 bg-black" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="h-full flex flex-col slide-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <button onClick={onClose} className="p-1 text-neutral-300"><ArrowLeft size={22} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{food.name}</div>
            {food.brand && <div className="text-neutral-400 text-xs truncate">{food.brand}</div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-5 mb-4 text-center">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Calories</div>
            <div className="font-display text-6xl text-amber-400 leading-none">{Math.round(kcal)}</div>
            <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-neutral-700 font-mono text-sm">
              <div><span className="text-red-500">{p}g</span> <span className="text-neutral-400 text-xs">P</span></div>
              <div><span className="text-blue-500">{c}g</span> <span className="text-neutral-400 text-xs">C</span></div>
              <div><span className="text-amber-400">{f}g</span> <span className="text-neutral-400 text-xs">F</span></div>
            </div>
          </div>

          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Portion</div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('grams')} className={`flex-1 py-2 rounded-lg font-display tracking-wider text-sm ${mode==='grams'?'bg-amber-400 text-black':'bg-neutral-900 border border-neutral-700 text-neutral-300'}`}>GRAMS</button>
            <button onClick={() => setMode('servings')} className={`flex-1 py-2 rounded-lg font-display tracking-wider text-sm ${mode==='servings'?'bg-amber-400 text-black':'bg-neutral-900 border border-neutral-700 text-neutral-300'}`}>SERVINGS</button>
          </div>

          {mode === 'grams' ? (
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setGrams(Math.max(0, grams - 10))} className="w-10 h-10 rounded bg-neutral-800 text-neutral-300"><Minus size={16} className="mx-auto"/></button>
                <input type="number" inputMode="decimal" value={grams} onChange={e => setGrams(Number(e.target.value) || 0)}
                  className="flex-1 bg-transparent font-mono text-3xl text-center text-white outline-none" />
                <div className="font-mono text-sm text-neutral-400">g</div>
                <button onClick={() => setGrams(grams + 10)} className="w-10 h-10 rounded bg-neutral-800 text-neutral-300"><Plus size={16} className="mx-auto"/></button>
              </div>
              <div className="flex gap-2 mt-3">
                {[50, 100, 150, 200, 250].map(v => (
                  <button key={v} onClick={() => setGrams(v)}
                    className="flex-1 py-2 rounded-lg bg-neutral-800 font-mono text-xs text-neutral-300 hover:bg-neutral-700">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setServings(Math.max(0.25, servings - 0.25))} className="w-10 h-10 rounded bg-neutral-800 text-neutral-300"><Minus size={16} className="mx-auto"/></button>
                <input type="number" inputMode="decimal" step="0.25" value={servings} onChange={e => setServings(Number(e.target.value) || 0)}
                  className="flex-1 bg-transparent font-mono text-3xl text-center text-white outline-none" />
                <div className="font-mono text-sm text-neutral-400">×</div>
                <button onClick={() => setServings(servings + 0.25)} className="w-10 h-10 rounded bg-neutral-800 text-neutral-300"><Plus size={16} className="mx-auto"/></button>
              </div>
              <div className="font-mono text-[11px] text-neutral-400 mt-2 text-center">
                1 serving = 100g (adjust in grams mode for exact weight)
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => onAdd({
              ...food,
              kcal: kcal,
              protein: p,
              carbs: c,
              fat: f,
              servingGrams: effectiveGrams,
              servings: mode === 'servings' ? servings : null,
            })}
            className="w-full py-4 rounded-xl bg-amber-400 text-black font-display text-xl tracking-wider">
            LOG {Math.round(kcal)} KCAL ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOM FOOD FORM
// ============================================================
function CustomFoodForm({ customFoods, saveCustomFoods, onPick }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [kcal, setKcal] = useState('');
  const [p, setP] = useState('');
  const [c, setC] = useState('');
  const [f, setF] = useState('');

  const save = async (saveAsPreset = false) => {
    if (!name || !kcal) return;
    const food = {
      name: name,
      brand: brand,
      kcal100: Number(kcal),
      p100: Number(p || 0),
      c100: Number(c || 0),
      f100: Number(f || 0),
    };
    if (saveAsPreset) {
      await saveCustomFoods([food, ...customFoods].slice(0, 50));
    }
    onPick(food);
  };

  return (
    <div className="p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-3">
        <div>
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Homemade chili"
            className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-400" />
        </div>
        <div>
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Brand (optional)</div>
          <input value={brand} onChange={e => setBrand(e.target.value)}
            className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-400" />
        </div>
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">Per 100g (or per serving)</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            ['Kcal', kcal, setKcal],
            ['P',    p,    setP],
            ['C',    c,    setC],
            ['F',    f,    setF],
          ].map(([lbl, v, set]) => (
            <div key={lbl}>
              <div className="font-mono text-[10px] text-neutral-400 uppercase mb-1">{lbl}</div>
              <input type="number" inputMode="decimal" value={v} onChange={e => set(e.target.value)} placeholder="0"
                className="w-full bg-black border border-neutral-700 rounded-lg px-2 py-2 font-mono text-sm text-white text-center outline-none focus:border-amber-400" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => save(false)} disabled={!name || !kcal}
            className="flex-1 py-3 rounded-lg bg-amber-400 text-black font-display tracking-wider disabled:opacity-40">
            USE ONCE
          </button>
          <button onClick={() => save(true)} disabled={!name || !kcal}
            className="flex-1 py-3 rounded-lg border border-amber-400 text-amber-400 font-display tracking-wider disabled:opacity-40">
            SAVE + USE
          </button>
        </div>
      </div>

      {customFoods.length > 0 && (
        <>
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1 mt-5">Saved custom foods</div>
          {customFoods.map((f, i) => (
            <FoodResultRow key={i} food={f} onClick={() => onPick(f)} />
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================
// STATS VIEW
// ============================================================
// ============================================================
// MEALS VIEW (templates + grocery list)
// ============================================================
function MealsView({ templates, saveTemplates, grocery, saveGrocery, customFoods, saveCustomFoods, recentFoods, targets }) {
  const [expanded, setExpanded] = useState(null);
  const [confirmLogId, setConfirmLogId] = useState(null);
  const [justLogged, setJustLogged] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [addingFoodTo, setAddingFoodTo] = useState(null);

  const planTotals = useMemo(() => {
    return templates.reduce((acc, tpl) => {
      const t = templateTotals(tpl);
      return { kcal: acc.kcal + t.kcal, p: acc.p + t.p, c: acc.c + t.c, f: acc.f + t.f };
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  }, [templates]);

  const handleLog = async (tpl) => {
    await logMealTemplate(tpl);
    setJustLogged(tpl.id);
    setConfirmLogId(null);
    setTimeout(() => setJustLogged(null), 2000);
  };

  const deleteTemplate = async (id) => {
    await saveTemplates(templates.filter(t => t.id !== id));
    setExpanded(null);
  };

  const updateTemplateName = async (tplId, name) => {
    const next = templates.map(t => (t.id === tplId ? { ...t, name } : t));
    await saveTemplates(next);
  };

  const updateFoodGrams = async (tplId, foodIdx, grams) => {
    const next = templates.map(t => {
      if (t.id !== tplId) return t;
      return { ...t, foods: t.foods.map((f, i) => i === foodIdx ? { ...f, grams } : f) };
    });
    await saveTemplates(next);
  };

  const removeFoodFromTemplate = async (tplId, foodIdx) => {
    const next = templates.map(t => {
      if (t.id !== tplId) return t;
      return { ...t, foods: t.foods.filter((_, i) => i !== foodIdx) };
    });
    await saveTemplates(next);
  };

  const addFoodToTemplate = async (tplId, item) => {
    const next = templates.map(t => {
      if (t.id !== tplId) return t;
      return {
        ...t,
        foods: [...t.foods, {
          name: item.name,
          kcal100: item.kcal100,
          p100: item.p100,
          c100: item.c100,
          f100: item.f100,
          grams: item.servingGrams || 100,
        }],
      };
    });
    await saveTemplates(next);
    setAddingFoodTo(null);
  };

  const toggleGrocery = async (id) => {
    await saveGrocery(grocery.map(g => g.id === id ? { ...g, checked: !g.checked } : g));
  };

  const removeGrocery = async (id) => {
    await saveGrocery(grocery.filter(g => g.id !== id));
  };

  const addGrocery = async () => {
    const text = newItem.trim();
    if (!text) return;
    await saveGrocery([...grocery, { id: Date.now().toString(36), text, checked: false }]);
    setNewItem('');
  };

  const clearChecked = async () => {
    await saveGrocery(grocery.filter(g => !g.checked));
  };

  return (
    <div className="px-5 pt-2 slide-up">
      {/* Daily plan summary */}
      {templates.length > 0 && (() => {
        const planKcal = Math.round(planTotals.kcal);
        const delta = planKcal - targets.kcal;
        const deltaLabel = delta === 0
          ? 'matches target'
          : `${delta > 0 ? '+' : ''}${delta} vs target`;
        const deltaColor = Math.abs(delta) < 150 ? 'text-emerald-400' : delta > 0 ? 'text-amber-400' : 'text-red-500';
        return (
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-4 mb-4">
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Full day if you log it all</div>
            <div className="flex items-baseline gap-3">
              <div className="font-display text-4xl text-amber-400">{planKcal}</div>
              <div className="font-mono text-xs text-neutral-400">/ {targets.kcal} kcal</div>
              <div className={`font-mono text-[11px] ml-auto ${deltaColor}`}>{deltaLabel}</div>
            </div>
            <div className="flex gap-3 mt-2 font-mono text-xs">
              <span className="text-red-500">P {Math.round(planTotals.p)}<span className="text-neutral-600">/{targets.protein}</span></span>
              <span className="text-blue-500">C {Math.round(planTotals.c)}<span className="text-neutral-600">/{targets.carbs}</span></span>
              <span className="text-amber-400">F {Math.round(planTotals.f)}<span className="text-neutral-600">/{targets.fat}</span></span>
            </div>
          </div>
        );
      })()}

      {/* Templates */}
      <div className="mb-5">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Meal Templates</div>
        {templates.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded-xl p-8 text-center">
            <div className="text-neutral-600 text-sm">No templates. Hit the + below to add one.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map(tpl => {
              const t = templateTotals(tpl);
              const isExpanded = expanded === tpl.id;
              const isLogged = justLogged === tpl.id;
              return (
                <div key={tpl.id} className="bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-3">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : tpl.id)}
                      className="flex-1 min-w-0 text-left">
                      <div className="font-display text-lg tracking-wider text-white truncate">{tpl.name}</div>
                      <div className="font-mono text-[11px] text-neutral-400 truncate">
                        {tpl.foods.length} foods · {Math.round(t.kcal)} kcal · P{Math.round(t.p)} C{Math.round(t.c)} F{Math.round(t.f)}
                      </div>
                    </button>
                    <button
                      onClick={() => setConfirmLogId(tpl.id)}
                      className={`px-4 py-2 rounded-lg font-display tracking-wider text-sm flex-shrink-0 transition-all ${
                        isLogged ? 'bg-emerald-800 text-emerald-300' : 'bg-amber-400 text-black active:scale-95'
                      }`}>
                      {isLogged ? <><Check size={14} className="inline mr-1" />LOGGED</> : 'LOG'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-neutral-800 bg-black/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest w-12">Name</span>
                        <input
                          type="text"
                          value={tpl.name}
                          onChange={e => updateTemplateName(tpl.id, e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 font-display tracking-wider text-sm text-white outline-none focus:border-amber-400"
                          placeholder="NAME"
                        />
                      </div>
                      {tpl.foods.map((food, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="text-white truncate">{food.name}</div>
                          </div>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={food.grams}
                            onChange={e => updateFoodGrams(tpl.id, i, Number(e.target.value) || 0)}
                            className="w-16 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 font-mono text-sm text-white text-right outline-none focus:border-amber-400" />
                          <span className="font-mono text-[10px] text-neutral-500 w-4">g</span>
                          <button onClick={() => removeFoodFromTemplate(tpl.id, i)} className="p-1 text-neutral-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setAddingFoodTo(tpl.id)}
                        className="w-full py-2 rounded-lg border border-amber-400/40 text-amber-400 font-mono text-xs tracking-wider flex items-center justify-center gap-1">
                        <Plus size={14} /> ADD FOOD
                      </button>
                      <button
                        onClick={() => deleteTemplate(tpl.id)}
                        className="w-full py-2 rounded-lg border border-red-900 text-red-500 font-mono text-xs tracking-wider">
                        DELETE TEMPLATE
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => {
            const id = 'tpl-' + Date.now().toString(36);
            saveTemplates([...templates, { id, name: 'NEW MEAL', foods: [] }]);
            setExpanded(id);
          }}
          className="w-full mt-2 py-2 rounded-lg border border-neutral-700 border-dashed text-neutral-400 font-mono text-xs tracking-wider flex items-center justify-center gap-1">
          <Plus size={14} /> NEW TEMPLATE
        </button>
      </div>

      {/* Grocery list */}
      <div className="mb-5">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><ShoppingCart size={12} /> Grocery List</span>
          {grocery.some(g => g.checked) && (
            <button onClick={clearChecked} className="text-amber-400 normal-case tracking-normal font-mono text-[10px]">clear checked</button>
          )}
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-2 space-y-1">
          {grocery.length === 0 ? (
            <div className="text-neutral-600 text-sm p-4 text-center">List is empty</div>
          ) : grocery.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-800">
              <button onClick={() => toggleGrocery(item.id)} className="flex-shrink-0">
                {item.checked
                  ? <CheckSquare size={18} className="text-amber-400" />
                  : <Square size={18} className="text-neutral-600" />}
              </button>
              <span className={`flex-1 text-sm ${item.checked ? 'text-neutral-600 line-through' : 'text-white'}`}>
                {item.text}
              </span>
              <button onClick={() => removeGrocery(item.id)} className="p-1 text-neutral-700">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 px-2 pt-2 border-t border-neutral-800">
            <Plus size={16} className="text-neutral-500 flex-shrink-0" />
            <input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addGrocery(); }}
              placeholder="Add item…"
              className="flex-1 bg-transparent text-sm text-white outline-none py-2" />
            {newItem.trim() && (
              <button onClick={addGrocery} className="px-3 py-1 rounded bg-amber-400 text-black font-mono text-xs tracking-wider">
                ADD
              </button>
            )}
          </div>
        </div>
      </div>

      {confirmLogId && (() => {
        const tpl = templates.find(t => t.id === confirmLogId);
        if (!tpl) return null;
        const t = templateTotals(tpl);
        return (
          <Modal onClose={() => setConfirmLogId(null)}>
            <div className="font-display text-2xl mb-2">LOG {tpl.name}?</div>
            <div className="text-neutral-300 text-sm mb-1">
              Adds {tpl.foods.length} foods to today's log.
            </div>
            <div className="font-mono text-xs text-neutral-400 mb-4">
              {Math.round(t.kcal)} kcal · P{Math.round(t.p)}g · C{Math.round(t.c)}g · F{Math.round(t.f)}g
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmLogId(null)} className="flex-1 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-display tracking-wider">CANCEL</button>
              <button onClick={() => handleLog(tpl)} className="flex-1 py-3 rounded-lg bg-amber-400 text-black font-display tracking-wider">LOG</button>
            </div>
          </Modal>
        );
      })()}

      {addingFoodTo && (
        <AddFoodModal
          onClose={() => setAddingFoodTo(null)}
          onAdd={(item) => addFoodToTemplate(addingFoodTo, item)}
          customFoods={customFoods}
          saveCustomFoods={saveCustomFoods}
          recentFoods={recentFoods}
        />
      )}
    </div>
  );
}

function StatsView({ config, history, exerciseState }) {
  const keyLifts = getKeyLifts(config);

  const liftData = useMemo(() => {
    const out = {};
    for (const liftId of keyLifts) {
      const points = [];
      for (const w of [...history].reverse()) {
        const ex = w.exercises.find(e => e.id === liftId);
        if (ex && ex.sets.length) {
          const topWeight = Math.max(...ex.sets.map(s => s.weight));
          points.push({ date: w.date, weight: topWeight });
        }
      }
      if (points.length) out[liftId] = points;
    }
    return out;
  }, [history]);

  const totalWorkouts = history.length;
  const totalSets = history.reduce((a,w) => a + w.exercises.reduce((b,e) => b + e.sets.length, 0), 0);
  const totalVolume = history.reduce((a,w) => a + w.exercises.reduce((b,e) => b + e.sets.reduce((c,s) => c + s.weight*s.reps, 0), 0), 0);

  return (
    <div className="px-5 pt-2 slide-up">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label="Workouts" value={totalWorkouts} />
        <StatCard label="Sets" value={totalSets} />
        <StatCard label="Volume" value={`${Math.round(totalVolume/1000)}k`} suffix="lb" />
      </div>

      <NutritionAverages targets={config.targets} />

      <VolumeBreakdown history={history} />

      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Key Lift Progression</div>
        {Object.keys(liftData).length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded-xl p-8 text-center">
            <div className="text-neutral-600 text-sm">Complete a few workouts to see progression</div>
          </div>
        ) : (
          <div className="space-y-3">
            {keyLifts.filter(l => liftData[l]).map(l => (
              <LiftChart key={l} exerciseId={l} data={liftData[l]} current={exerciseState[l]?.weight} />
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">Recent Sessions</div>
        {history.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded-xl p-6 text-center">
            <div className="text-neutral-600 text-sm">No workouts logged yet</div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((w, i) => {
              const day = getDayFromAnyProgram(w.dayKey) || { label: w.dayKey?.toUpperCase() || 'WORKOUT', color: '#a3a3a3' };
              const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
              return (
                <div key={i} className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg tracking-wider" style={{ color: day.color }}>{day.label}</div>
                    <div className="font-mono text-[11px] text-neutral-400">
                      {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {totalSets} sets
                      {w.durationSec && ` · ${Math.round(w.durationSec/60)} min`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionAverages({ targets }) {
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    (async () => {
      const keys = await window.storage.listKeys('food:');
      const cutoff = shiftDateKey(todayKey(), -6);
      const recent = keys.filter(k => k.slice(5) >= cutoff);
      if (recent.length === 0) { setAvg({ days: 0 }); return; }
      let kcal = 0, p = 0, c = 0, f = 0;
      for (const k of recent) {
        const raw = await window.storage.get(k);
        if (!raw) continue;
        const day = JSON.parse(raw.value);
        for (const m of (day.meals || [])) {
          kcal += m.kcal || 0; p += m.protein || 0; c += m.carbs || 0; f += m.fat || 0;
        }
      }
      const n = recent.length;
      setAvg({ days: n, kcal: Math.round(kcal/n), p: Math.round(p/n), c: Math.round(c/n), f: Math.round(f/n) });
    })();
  }, []);

  if (!avg) return null;
  if (avg.days === 0) return null;

  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
        <span>Nutrition Averages</span>
        <span className="text-neutral-600">last {avg.days} day{avg.days === 1 ? '' : 's'}</span>
      </div>
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
        <div className="flex items-baseline gap-3 mb-3">
          <div className="font-display text-4xl text-white">{avg.kcal}</div>
          <div className="font-mono text-xs text-neutral-400">kcal avg · target {targets.kcal}</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-800 rounded-lg px-3 py-2">
            <div className="font-mono text-[9px] text-red-500 uppercase tracking-wider">Protein</div>
            <div className="font-mono text-lg text-white">{avg.p}<span className="text-xs text-neutral-400">g</span></div>
          </div>
          <div className="bg-neutral-800 rounded-lg px-3 py-2">
            <div className="font-mono text-[9px] text-blue-500 uppercase tracking-wider">Carbs</div>
            <div className="font-mono text-lg text-white">{avg.c}<span className="text-xs text-neutral-400">g</span></div>
          </div>
          <div className="bg-neutral-800 rounded-lg px-3 py-2">
            <div className="font-mono text-[9px] text-amber-400 uppercase tracking-wider">Fat</div>
            <div className="font-mono text-lg text-white">{avg.f}<span className="text-xs text-neutral-400">g</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VolumeBreakdown({ history }) {
  const thisWeek = useMemo(() => {
    const raw = computeVolumeFromHistory(history, 7);
    // Fill in zero for any tracked muscle that has no volume yet
    const filled = {};
    Object.keys(MUSCLE_TARGETS).forEach(m => { filled[m] = raw[m] || 0; });
    return filled;
  }, [history]);
  const total = Object.values(thisWeek).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="mb-4">
        <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1">
          Volume This Week <span className="text-neutral-600">· by muscle</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 border-dashed rounded-xl p-8 text-center">
          <div className="text-neutral-600 text-sm">Log workouts to see your volume breakdown</div>
        </div>
      </div>
    );
  }

  const sorted = Object.keys(MUSCLE_TARGETS).sort((a, b) => {
    const ap = MUSCLE_TARGETS[a].priority ? 1 : 0;
    const bp = MUSCLE_TARGETS[b].priority ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return thisWeek[b] - thisWeek[a];
  });

  const formatVol = (v) => v % 1 === 0 ? String(v) : v.toFixed(1);

  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
        <span>Volume This Week <span className="text-neutral-600">· by muscle</span></span>
        <span className="text-neutral-600">rolling 7d</span>
      </div>
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-3">
        {sorted.map(muscle => {
          const cfg = MUSCLE_TARGETS[muscle];
          const vol = thisWeek[muscle];
          const under = vol > 0 && vol < cfg.min;
          const over = vol > cfg.max;
          const empty = vol === 0;

          let barColor = '#10b981';
          let statusLabel = 'IN RANGE';
          if (empty)      { barColor = '#404040'; statusLabel = '—'; }
          else if (under) { barColor = '#ef4444'; statusLabel = 'LOW'; }
          else if (over)  { barColor = '#f59e0b'; statusLabel = 'HIGH'; }

          const pct = Math.min(100, (vol / cfg.max) * 100);
          const minPct = (cfg.min / cfg.max) * 100;

          return (
            <div key={muscle}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-xs uppercase tracking-wider font-bold ${cfg.priority ? 'text-amber-400' : 'text-neutral-200'}`}>
                    {cfg.label}
                  </span>
                  {cfg.priority && (
                    <span className="font-mono text-[9px] text-amber-400/70 border border-amber-400/40 px-1.5 py-0.5 rounded">PRIORITY</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-mono text-sm text-white font-bold">{formatVol(vol)}</span>
                  <span className="font-mono text-[10px] text-neutral-500">/ {cfg.min}–{cfg.max}</span>
                  <span className="font-mono text-[9px] font-bold w-14 text-right" style={{ color: barColor }}>{statusLabel}</span>
                </div>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute h-full bg-white/5 pointer-events-none"
                  style={{ left: `${minPct}%`, width: `${100 - minPct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none"
                  style={{ left: `${minPct}%` }}
                />
                <div
                  className="h-full relative transition-all"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 px-1 font-mono text-[10px] text-neutral-500 leading-relaxed">
        Shaded zone = hypertrophy range · Secondary muscles count half (convention)
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3">
      <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-display text-3xl text-white">{value}{suffix && <span className="text-sm text-neutral-400 ml-1">{suffix}</span>}</div>
    </div>
  );
}

function LiftChart({ exerciseId, data, current }) {
  const ex = getExerciseFromAnyProgram(exerciseId);
  if (!ex) return null;
  const max = Math.max(...data.map(d => d.weight));
  const min = Math.min(...data.map(d => d.weight));
  const range = Math.max(1, max - min);
  const width = 240;
  const height = 50;
  const pts = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - ((d.weight - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{ex.name}</div>
        <div className="font-mono text-[11px] text-neutral-400">
          {data.length} sessions · {min}–{max} lb
        </div>
      </div>
      <svg width={width/2} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
        <polyline points={pts} fill="none" stroke="#f5b400" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const x = (i / Math.max(1, data.length - 1)) * width;
          const y = height - ((d.weight - min) / range) * height;
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#f5b400" />;
        })}
      </svg>
      <div className="text-right">
        <div className="font-mono text-base text-amber-400">{current || data[data.length-1].weight}</div>
        <div className="font-mono text-[9px] text-neutral-400">LB</div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL + SETTINGS
// ============================================================
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)' }}
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 slide-up sm:mb-[4.5rem]"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function SettingsModal({ config, onSave, onClose }) {
  const [bw, setBw] = useState(config.bodyWeight);
  const [goal, setGoal] = useState(normalizeGoal(config.goal));
  const [kcal, setKcal] = useState(config.targets.kcal);
  const [p, setP] = useState(config.targets.protein);
  const [c, setC] = useState(config.targets.carbs);
  const [f, setF] = useState(config.targets.fat);
  const [rest, setRest] = useState(config.restTimer);
  const [activeProgram, setActiveProgram] = useState(config.activeProgram || DEFAULT_PROGRAM_ID);
  const programChanged = activeProgram !== (config.activeProgram || DEFAULT_PROGRAM_ID);

  const applyPreset = (nextBw, nextGoal) => {
    const t = computeTargets(nextBw, nextGoal);
    setKcal(t.kcal); setP(t.protein); setC(t.carbs); setF(t.fat);
  };

  const pickGoal = (g) => {
    setGoal(g);
    applyPreset(bw, g);
  };

  const autoFromBw = () => applyPreset(bw, goal);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="h-full flex flex-col slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="font-display text-2xl tracking-wider">SETTINGS</div>
          <button onClick={onClose} className="p-1 text-neutral-300"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Program</div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                {Object.values(PROGRAMS).map(p => {
                  const active = activeProgram === p.id;
                  return (
                    <button key={p.id} onClick={() => setActiveProgram(p.id)}
                      className={`py-2.5 rounded-lg font-display tracking-wider text-sm transition-all ${
                        active ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                      {p.shortName}
                    </button>
                  );
                })}
              </div>
              <div className="font-mono text-[10px] text-neutral-400 text-center px-1 leading-relaxed">
                {PROGRAMS[activeProgram]?.description}
              </div>
              {programChanged && (
                <div className="font-mono text-[10px] text-amber-400 text-center px-1 leading-relaxed mt-2">
                  Cycle resets to Day 1 on save.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Goal</div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                {Object.entries(GOAL_PRESETS).map(([k, preset]) => {
                  const active = goal === k;
                  return (
                    <button key={k} onClick={() => pickGoal(k)}
                      className={`py-2.5 rounded-lg font-display tracking-wider text-sm transition-all ${
                        active ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="font-mono text-[10px] text-neutral-400 text-center px-1 leading-relaxed">
                {GOAL_PRESETS[goal].blurb}
              </div>
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Body</div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-neutral-300 text-sm">Body weight</div>
                <div className="flex items-center gap-2">
                  <input type="number" value={bw} onChange={e => setBw(Number(e.target.value) || 0)}
                    className="w-20 bg-black border border-neutral-700 rounded px-2 py-1 font-mono text-right text-white outline-none focus:border-amber-400" />
                  <div className="font-mono text-xs text-neutral-400">lb</div>
                </div>
              </div>
              <button onClick={autoFromBw} className="w-full py-2 rounded-lg bg-neutral-800 font-mono text-xs text-amber-400">
                AUTO-CALC TARGETS FROM WEIGHT
              </button>
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Daily Targets <span className="text-neutral-600 normal-case tracking-normal">· tweak anything</span></div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 space-y-3">
              {[
                ['Calories', kcal, setKcal, 'kcal'],
                ['Protein', p, setP, 'g'],
                ['Carbs', c, setC, 'g'],
                ['Fat', f, setF, 'g'],
              ].map(([lbl, v, set, u]) => (
                <div key={lbl} className="flex items-center justify-between">
                  <div className="text-neutral-300 text-sm">{lbl}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={v} onChange={e => set(Number(e.target.value) || 0)}
                      className="w-20 bg-black border border-neutral-700 rounded px-2 py-1 font-mono text-right text-white outline-none focus:border-amber-400" />
                    <div className="font-mono text-xs text-neutral-400">{u}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Workout</div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-neutral-300 text-sm">Rest timer (seconds)</div>
                <div className="flex items-center gap-2">
                  <input type="number" value={rest} onChange={e => setRest(Number(e.target.value) || 0)}
                    className="w-20 bg-black border border-neutral-700 rounded px-2 py-1 font-mono text-right text-white outline-none focus:border-amber-400" />
                  <div className="font-mono text-xs text-neutral-400">sec</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Data</div>
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
              <button
                onClick={exportAllData}
                className="w-full py-3 rounded-lg bg-neutral-800 font-display tracking-wider text-amber-400 flex items-center justify-center gap-2">
                <Download size={16} /> EXPORT ALL DATA
              </button>
              <div className="font-mono text-[10px] text-neutral-500 mt-2 text-center">
                Downloads a JSON backup of your workouts, food, and settings.
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => onSave({
              ...config,
              bodyWeight: bw,
              goal,
              restTimer: rest,
              targets: { kcal, protein: p, carbs: c, fat: f },
              activeProgram,
              dayIndex: programChanged ? 0 : config.dayIndex,
            })}
            className="w-full py-3 rounded-xl bg-amber-400 text-black font-display text-lg tracking-wider">
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
