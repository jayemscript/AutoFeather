AutoFeather – Real-Time Poultry Monitoring and Automation System

AutoFeather is an advanced IoT-based monitoring system designed to revolutionize poultry farm management through real-time feather density tracking, thermal comfort assessment, and fertility prediction using a Fuzzy Logic Algorithm. This comprehensive solution addresses the most critical challenges in poultry farming: maintaining optimal environmental conditions to ensure healthy birds, improve productivity, and maximize egg yield.

By integrating multiple sensors with intelligent automation capabilities, AutoFeather continuously monitors key parameters such as:

Feather density and coverage

Ambient temperature and thermal comfort

Fertility patterns and egg production trends

The system provides farm operators with actionable insights and automated responses to environmental changes, ensuring bird health and optimal productivity without manual intervention.


# Fuzzy Logic Fertility Prediction System
### A Complete Explanation — Clear, Serious, and Understandable

> **What this system does:**
> Given a chicken's feather density and environmental conditions (temperature, humidity), it predicts how likely that chicken is to be fertile — producing a score from **0% to 100%**.

---

## Table of Contents

1. [FUZZIFICATION](#1-fuzzification)
2. [FUZZY INFERENCE — RULE EVALUATION](#2-fuzzy-inference--rule-evaluation)
3. [DEFUZZIFICATION](#3-defuzzification)
4. [Calculate Thermal Comfort Index (TCI)](#4-calculate-thermal-comfort-index-tci)
5. [Calculate Temperature Stress Component](#5-calculate-temperature-stress-component)
6. [Calculate Humidity Stress Component](#6-calculate-humidity-stress-component)
7. [Fuzzify Feather Density Score (FDS)](#7-fuzzify-feather-density-score-fds)
8. [Fuzzify Temperature](#8-fuzzify-temperature)
9. [Fuzzify Humidity](#9-fuzzify-humidity)
10. [Triangular / Trapezoidal Membership Function](#10-triangular--trapezoidal-membership-function)
11. [Evaluate Fuzzy Rules Using MINIMUM (AND) Operator](#11-evaluate-fuzzy-rules-using-minimum-and-operator)
12. [Core Rules — Feather Density + Temperature](#12-core-rules--feather-density--temperature)
13. [Centroid Defuzzification Method](#13-centroid-defuzzification-method)

---

## Overview: How the System Flows

```
[Raw Inputs]
  Feather Density (LOW / HIGH)
  Temperature (°C)
  Humidity (%) ← optional

       ↓
[STEP 1 — FUZZIFICATION]
  Convert each raw input into fuzzy membership values
  (e.g., temperature is 60% "hot" and 40% "optimal")

       ↓
[STEP 2 — FUZZY INFERENCE]
  Apply 13 IF-THEN rules using the MINIMUM operator
  Each rule produces a "strength" value between 0 and 1

       ↓
[STEP 3 — DEFUZZIFICATION]
  Combine all rule strengths into a single crisp score
  using the Centroid Method

       ↓
[OUTPUT]
  fertilityScore: 0–100
  fertilityLevel: LOW | MEDIUM | HIGH
  explanation: human-readable summary
```

---

## 1. FUZZIFICATION

### What it is

Fuzzification is the process of taking a **precise, real-world number** and converting it into **fuzzy membership values** — percentages that describe how strongly that number belongs to a fuzzy category.

### Why it matters

In the real world, boundaries are not sharp. A temperature of 25°C is not suddenly "hot" while 24°C is "optimal." Fuzzification captures this gradual transition.

### What it does in this system

| Input | Raw Value | After Fuzzification |
|---|---|---|
| Feather Density | `"HIGH"` | `{ low: 0.0, medium: 0.0, high: 1.0 }` |
| Temperature | `22°C` | `{ cold: 0.0, optimal: 0.8, hot: 0.2 }` |
| Humidity | `65%` | `{ low: 0.0, optimal: 0.67, high: 0.0 }` |

Each value is passed through a **membership function** (see Section 10) that returns a number between **0.0 and 1.0**.

- `0.0` = does not belong to this category at all
- `1.0` = fully belongs to this category
- `0.6` = belongs 60% — it's "kind of" in this category

### In code

```typescript
const fds = featherDensity === 'HIGH' ? 0.75 : 0.25;
const tci = this.calculateThermalComfortIndex(temperature, humidity);

const featherMembership = this.fuzzifyFeatherDensity(fds);
const tempMembership    = this.fuzzifyTemperature(temperature);
const humidityMembership = this.fuzzifyHumidity(humidity); // if provided
```

---

## 2. FUZZY INFERENCE — RULE EVALUATION

### What it is

Fuzzy inference is the step where the system **applies a set of IF-THEN rules** to the fuzzified inputs and computes how strongly each rule fires.

### Why it matters

Rules encode domain knowledge — the expertise of poultry scientists and researchers. Instead of one rigid formula, the system uses 13 rules that collectively cover all combinations of conditions.

### How it works

Each rule takes the form:

```
IF [condition A] AND [condition B] THEN [output category]
```

The strength of each rule (called **firing strength** or **α**) is computed using the **MINIMUM operator** — explained in detail in Section 11.

### Example

```
Rule 1: IF feather is HIGH AND temperature is OPTIMAL
        THEN fertility output center = 90

firing strength = min(feather.high, temp.optimal)
               = min(1.0, 0.8)
               = 0.8
```

This means Rule 1 fires at **80% strength** — it contributes significantly to the final output.

### Output of this step

A record of all active rules and their strengths:

```
{
  rule1_high_feather_optimal_temp:   0.80,
  rule2_high_feather_cold_temp:      0.00,  ← filtered out (zero)
  rule4_medium_feather_optimal_temp: 0.00,
  rule13_high_heat_stress:           0.92,
  ...
}
```

Zero-strength rules are removed — they have no influence.

---

## 3. DEFUZZIFICATION

### What it is

Defuzzification is the final step: taking all the fuzzy rule outputs and combining them into **one single crisp number** — the fertility score.

### Why it matters

A fuzzy system produces a "fuzzy output" — a distribution, not a single number. Defuzzification collapses this distribution into a usable result.

### Method used: Centroid (Center of Gravity)

This system uses the **Centroid Defuzzification Method**, which finds the center of gravity of the combined output shape.

Full explanation and formula in Section 13.

### Output

```
fertilityScore: 82.4   → fertilityLevel: "HIGH"
fertilityScore: 55.1   → fertilityLevel: "MEDIUM"
fertilityScore: 22.7   → fertilityLevel: "LOW"
```

**Thresholds:**

| Range | Level |
|---|---|
| 0 – 39.99 | LOW |
| 40 – 69.99 | MEDIUM |
| 70 – 100 | HIGH |

---

## 4. Calculate Thermal Comfort Index (TCI)

### What it is

The **Thermal Comfort Index (TCI)** is a single number (0.0 to 1.0) that summarizes how much environmental stress a chicken is under, combining both temperature and humidity.

### Why it matters

Temperature and humidity do not act independently. High humidity makes heat feel more extreme (like a wet sauna vs. a dry desert). TCI captures this combined effect.

### Formula

```
If humidity is provided:
  TCI = (temperature_stress × 0.7) + (humidity_stress × 0.3)

If humidity is NOT provided:
  TCI = temperature_stress only
```

Temperature contributes **70%** of the stress signal because it has the dominant effect on fertility. Humidity contributes the remaining **30%**.

### TCI value interpretation

| TCI Range | Meaning |
|---|---|
| 0.0 – 0.2 | Very comfortable — minimal stress |
| 0.2 – 0.5 | Moderate conditions |
| 0.5 – 0.8 | Noticeable thermal stress |
| 0.8 – 1.0 | Severe heat stress — fertility may be significantly impacted |

### In code

```typescript
private calculateThermalComfortIndex(temp: number, humidity?: number): number {
  const tempStress     = this.calculateTemperatureStress(temp);
  const humidityStress = humidity != null ? this.calculateHumidityStress(humidity) : 0;

  const tci = humidity != null
    ? tempStress * 0.7 + humidityStress * 0.3
    : tempStress;

  return Math.min(1, Math.max(0, tci));  // clamp to [0, 1]
}
```

> **Note:** The result is always clamped between 0 and 1. Even extreme conditions cannot exceed 1.0.

---

## 5. Calculate Temperature Stress Component

### What it is

This calculates how much **thermal stress** comes specifically from temperature alone. It returns a value between 0.0 (no stress) and 1.0 (maximum stress).

### The optimal zone

Chickens are most comfortable and fertile between **18°C and 24°C**. This is the defined optimal range based on poultry research.

### How stress is calculated

**Case 1 — Optimal zone (18°C to 24°C):**
```
stress = 0.2
```
A baseline stress of 0.2 is used even in optimal conditions — no environment is perfect.

**Case 2 — Cold (below 18°C):**
```
cold_stress = (18 - temp) / 18
stress = min(1.0, 0.2 + cold_stress × 0.6)
```
The further below 18°C, the higher the stress. The factor 0.6 controls how fast stress rises.

**Case 3 — Hot (above 24°C):**
```
heat_stress = (temp - 24) / 16
stress = min(1.0, 0.2 + heat_stress × 0.8)
```
Heat stress rises faster (factor 0.8 vs 0.6) because heat is more damaging to fertility than cold.

### Concrete examples

| Temperature | Calculation | Stress Value |
|---|---|---|
| 21°C | Optimal | 0.20 |
| 10°C | (18−10)/18 = 0.44 → 0.2 + 0.44×0.6 | 0.47 |
| 35°C | (35−24)/16 = 0.69 → 0.2 + 0.69×0.8 | 0.75 |
| 40°C | (40−24)/16 = 1.0 → capped | 1.00 |

---

## 6. Calculate Humidity Stress Component

### What it is

This calculates how much **stress comes from humidity** alone. Returned as a value between 0.0 and 1.0.

### The optimal zone

Ideal humidity for chickens is **50% to 70%**. Outside this range, stress increases.

### How stress is calculated

**Case 1 — Optimal zone (50% to 70%):**
```
stress = 0.1
```
Minimal baseline stress even in ideal humidity.

**Case 2 — Too dry (below 50%):**
```
dry_stress = (50 - humidity) / 50
stress = min(1.0, 0.1 + dry_stress × 0.4)
```
Dry air causes respiratory stress and dehydration. Effect is moderate (factor 0.4).

**Case 3 — Too humid (above 70%):**
```
humid_stress = (humidity - 70) / 30
stress = min(1.0, 0.1 + humid_stress × 0.5)
```
Excess humidity promotes pathogens and reduces heat dissipation. Effect is slightly stronger (factor 0.5).

### Concrete examples

| Humidity | Calculation | Stress Value |
|---|---|---|
| 60% | Optimal | 0.10 |
| 30% | (50−30)/50 = 0.4 → 0.1 + 0.4×0.4 | 0.26 |
| 85% | (85−70)/30 = 0.5 → 0.1 + 0.5×0.5 | 0.35 |
| 100% | (100−70)/30 = 1.0 → 0.1 + 1.0×0.5 | 0.60 |

---

## 7. Fuzzify Feather Density Score (FDS)

### What it is

The Feather Density Score (FDS) is a numeric value that represents the chicken's feather coverage:

| Input | FDS Value |
|---|---|
| `"LOW"` feather density | `0.25` |
| `"HIGH"` feather density | `0.75` |

This FDS is then passed through three membership functions to get fuzzy membership values.

### The three fuzzy sets

| Set | Peak Location | Meaning |
|---|---|---|
| `low` | FDS = 0.0 | Sparse feather coverage — poor thermal insulation |
| `medium` | FDS = 0.5 | Moderate coverage |
| `high` | FDS = 0.75 | Dense, healthy feather coat — strong insulation |

### Why HIGH FDS = 0.75 (not 1.0)?

The high set **peaks at 0.75**, meaning a chicken with `HIGH` density gets a **membership of 1.0** in the `high` set. The scale extends to 1.0 to leave room for future expansion (e.g., "ultra-high density") without breaking existing ranges.

### Membership function parameters

```
low:    triangular(fds, a=0,   b=0,   c=0.25, d=0.5)   ← peaks at 0
medium: triangular(fds, a=0.2, b=0.5, c=0.7)            ← peaks at 0.5
high:   triangular(fds, a=0.5, b=0.75, c=1.0, d=1.0)   ← peaks at 0.75
```

### Result for FDS = 0.75 (HIGH density)

```
low:    0.0   → not low at all
medium: 0.0   → not medium at all (0.75 is past the medium peak)
high:   1.0   → fully HIGH ✓
```

### Result for FDS = 0.25 (LOW density)

```
low:    1.0   → fully low
medium: 0.25  → slightly medium
high:   0.0   → not high at all
```

---

## 8. Fuzzify Temperature

### What it is

Temperature (in °C) is converted into three fuzzy membership values representing how much it belongs to each thermal category.

### The three fuzzy sets

| Set | Meaning | Peak Zone |
|---|---|---|
| `cold` | Below-optimal temperature | 0°C to 18°C |
| `optimal` | Comfortable range | 16°C to 27°C (peaks at 21°C) |
| `hot` | Above-optimal temperature | 21°C to 50°C+ |

### Overlapping boundaries (important design choice)

The sets **intentionally overlap**. At 22°C, for example:
```
cold:    0.0
optimal: 0.73   ← mostly optimal
hot:     0.07   ← slightly hot
```

This overlap ensures there is **never a dead zone** — every temperature value activates at least one rule.

### Membership function parameters

```
cold:    triangular(temp, a=0,  b=0,  c=18, d=24)   ← flat at 0–18, fades by 24
optimal: triangular(temp, a=16, b=21, c=27)          ← peaks at 21°C
hot:     triangular(temp, a=21, b=30, c=50, d=50)   ← starts rising at 21, peaks at 30+
```

### Concrete examples

| Temp | cold | optimal | hot |
|---|---|---|---|
| 10°C | 1.00 | 0.00 | 0.00 |
| 18°C | 1.00 | 0.40 | 0.00 |
| 21°C | 0.50 | 1.00 | 0.00 |
| 25°C | 0.00 | 0.33 | 0.44 |
| 30°C | 0.00 | 0.00 | 1.00 |

---

## 9. Fuzzify Humidity

### What it is

Humidity (in %) is converted into three fuzzy membership values.

### The three fuzzy sets

| Set | Meaning | Optimal Zone |
|---|---|---|
| `low` | Too dry | 0% to 40% |
| `optimal` | Comfortable | 45% to 75% (peaks at 60%) |
| `high` | Too humid | 65% to 100% |

### Membership function parameters

```
low:     triangular(humidity, a=0,  b=0,  c=40, d=60)   ← flat 0–40, fades by 60
optimal: triangular(humidity, a=45, b=60, c=75)          ← peaks at 60%
high:    triangular(humidity, a=65, b=85, c=100, d=100)  ← starts at 65, peaks at 85+
```

### Concrete examples

| Humidity | low | optimal | high |
|---|---|---|---|
| 20% | 1.00 | 0.00 | 0.00 |
| 50% | 0.50 | 0.67 | 0.00 |
| 60% | 0.00 | 1.00 | 0.00 |
| 75% | 0.00 | 0.00 | 0.50 |
| 90% | 0.00 | 0.00 | 1.00 |

---

## 10. Triangular / Trapezoidal Membership Function

### What it is

This is the **mathematical core** of fuzzification. It is a single function that can produce both triangular and trapezoidal shapes, used to compute how strongly a value belongs to a fuzzy set.

### The shape

```
  Membership
  1.0  |         ___________
       |        /           \
       |       /             \
  0.0  |______/               \______
             a    b         c    d
                  ↑         ↑
               rises flat top falls
```

| Parameter | Role |
|---|---|
| `a` | Left boundary — membership = 0 here |
| `b` | Start of flat top — membership reaches 1.0 |
| `c` | End of flat top — membership starts falling |
| `d` | Right boundary — membership = 0 here |

### Triangle vs Trapezoid

- **Triangle:** `b == c` (no flat top — peak is a single point)
- **Trapezoid:** `b < c` (flat section at the top)

When `d` is omitted, the function defaults to a **triangle** (`d = c`).

### The formula

```
x ≤ a  OR  x ≥ d  →  0
b ≤ x ≤ c          →  1             (flat top)
a < x < b          →  (x - a) / (b - a)   (rising slope)
c < x < d          →  (d - x) / (d - c)   (falling slope)
```

### Concrete example

Fuzzy set `cold` for temperature: `triangularMF(temp, 0, 0, 18, 24)`

| Temp | Calculation | Result |
|---|---|---|
| 10°C | Between b=0 and c=18 → flat top | 1.00 |
| 21°C | Between c=18 and d=24 → (24−21)/(24−18) | 0.50 |
| 25°C | x ≥ d=24 | 0.00 |

---

## 11. Evaluate Fuzzy Rules Using MINIMUM (AND) Operator

### The formula

```
α_i = min( μ_FDS(x), μ_TCI(y) )
```

Where:
- `α_i` = firing strength of rule `i`
- `μ_FDS(x)` = membership value of the feather density input in its fuzzy set
- `μ_TCI(y)` = membership value of the temperature/TCI input in its fuzzy set
- `min(...)` = take the **lowest** of all the values

### Why MINIMUM?

The AND operator in fuzzy logic uses the minimum because a rule is only as strong as its **weakest condition**.

Think of it like a chain: the chain breaks at its weakest link. If one condition is barely satisfied, the entire rule is barely satisfied.

**Comparison:**

| Rule | μ_feather | μ_temperature | MIN (AND) | AVG (incorrect) |
|---|---|---|---|---|
| A | 0.9 | 0.9 | **0.9** | 0.9 |
| B | 0.9 | 0.1 | **0.1** | 0.5 ← would be misleading |
| C | 0.5 | 0.5 | **0.5** | 0.5 |

Rule B: the temperature is barely optimal (0.1), so even though feathers are great (0.9), the rule should not fire strongly. MIN correctly captures this. AVG would exaggerate.

### For three conditions (humidity rules)

```
α = min( μ_feather, μ_temp, μ_humidity )
```

The minimum is taken across all three inputs.

### After evaluation

Rules with a firing strength of **0** are removed — they have no contribution to the output.

---

## 12. Core Rules — Feather Density + Temperature

### Overview

The system defines **9 core rules** from feather density × temperature combinations, plus **3 humidity enhancement rules** and **1 TCI rule** = **13 rules total**.

### The 9 Core Rules

| Rule | Feather | Temperature | Output Center | Logic |
|---|---|---|---|---|
| 1 | HIGH | OPTIMAL | 90% | Best possible conditions |
| 2 | HIGH | COLD | 70% | Dense feathers buffer cold well |
| 3 | HIGH | HOT | 55% | Dense feathers trap heat — some stress |
| 4 | MEDIUM | OPTIMAL | 65% | Adequate but not ideal |
| 5 | MEDIUM | COLD | 50% | Cold partially compensates medium feathers |
| 6 | MEDIUM | HOT | 45% | More vulnerable in heat |
| 7 | LOW | COLD | 25% | Thin feathers + cold = severe stress |
| 8 | LOW | OPTIMAL | 40% | Even ideal weather doesn't fully compensate |
| 9 | LOW | HOT | 20% | Worst combination |

### The 3 Humidity Enhancement Rules

| Rule | Condition | Output Center | Logic |
|---|---|---|---|
| 10 | HIGH feather + OPTIMAL temp + OPTIMAL humidity | 95% | Perfect all-around conditions |
| 11 | HIGH feather + LOW humidity | 35% | Dryness causes respiratory stress |
| 12 | HIGH feather + HIGH humidity | 30% | Excess humidity promotes pathogens |

### The TCI Rule

| Rule | Condition | Output | Logic |
|---|---|---|---|
| 13 | TCI ≥ 0.8 | 20% | Severe heat stress override |

> Rule 13 is a **threshold rule** — it only activates when TCI exceeds 0.8, directly penalizing the output with the TCI value as the firing strength.

### How firing strength maps to output center

Each rule has a pre-defined **output center** — the midpoint of the fertility range that rule votes for. The firing strength scales the triangle's height at that center during defuzzification.

```
Rule 1 fires at α = 0.8, output center = 90
→ produces a triangle clipped at height 0.8, centered at 90
```

---

## 13. Centroid Defuzzification Method

### The formula

```
Z* = ∫ μC(z) · z dz
     ─────────────────
       ∫ μC(z) dz
```

Where:
- `Z*` = the final crisp output value (fertility score)
- `μC(z)` = the combined membership value at point `z`
- `z` = a point in the output range (0 to 100)
- The integral (∫) is approximated by sampling every integer from 0 to 100

### What this formula means in plain terms

Imagine the combined output of all rules as a **shape on a graph** — like a mountain range with multiple peaks. The Centroid method finds the **exact horizontal center of gravity** of that shape.

- If most rules vote for HIGH fertility, the shape is heavier on the right (near 90–100) → Z* is pulled right → high score
- If most rules vote for LOW fertility, the shape is heavier on the left (near 0–30) → Z* is pulled left → low score

### How it is computed (step by step)

**Step 1:** For each integer value `z` from 0 to 100, compute the combined membership `μC(z)`:

```
For each active rule:
  1. Look up the rule's output triangle: center and width
  2. Evaluate the triangle at point z  →  gives a membership value
  3. Clip it at the rule's firing strength:  min(strength, triangle(z))
  4. Take the MAX across all rules at this z  (fuzzy union / OR)

μC(z) = max over all rules of: min(α_i, triangle_i(z))
```

**Step 2:** Accumulate numerator and denominator:

```
numerator   += μC(z) × z
denominator += μC(z)
```

**Step 3:** Divide:

```
Z* = numerator / denominator
```

If the denominator is 0 (no rules fired at all), default to 50.

### Output triangle shapes used in this system

| Rule | Output Center | Width | Range |
|---|---|---|---|
| Rule 10 (perfect) | 95 | 5 | [90, 100] |
| Rule 1 (high + optimal) | 90 | 10 | [80, 100] |
| Rule 2 (high + cold) | 70 | 15 | [55, 85] |
| Rule 4 (medium + optimal) | 65 | 15 | [50, 80] |
| Rule 3 (high + hot) | 55 | 15 | [40, 70] |
| Rule 5 (medium + cold) | 50 | 15 | [35, 65] |
| Rule 6 (medium + hot) | 45 | 15 | [30, 60] |
| Rule 8 (low + optimal) | 40 | 15 | [25, 55] |
| Rule 11 (low humidity) | 35 | 10 | [25, 45] |
| Rule 12 (high humidity) | 30 | 10 | [20, 40] |
| Rule 7 (low + cold) | 25 | 15 | [10, 40] |
| Rule 9 (low + hot) | 20 | 15 | [5, 35] |
| Rule 13 (TCI stress) | 20 | 10 | [10, 30] |

### Worked example

**Inputs:** Feather = HIGH (FDS = 0.75), Temperature = 22°C, no humidity

**After fuzzification:**
```
feather.high = 1.0
temp.optimal = 0.73
temp.hot     = 0.07
temp.cold    = 0.0
```

**Rule strengths:**
```
Rule 1 = min(1.0, 0.73) = 0.73  → center = 90
Rule 3 = min(1.0, 0.07) = 0.07  → center = 55
```

**At z = 90:**
```
Rule 1 triangle at z=90: triangular(90, 80, 90, 100) = 1.0
  → clipped at 0.73  → contribution = 0.73

Rule 3 triangle at z=90: triangular(90, 40, 55, 70) = 0.0
  → no contribution

μC(90) = max(0.73, 0.0) = 0.73
```

**Centroid result:** The balance point lands near **~82–85%** → Level: **HIGH**

---

## Final Output Structure

```typescript
{
  fertilityScore: 82.45,         // 0–100, rounded to 2 decimal places
  fertilityLevel: "HIGH",        // LOW | MEDIUM | HIGH

  ruleStrengths: {               // only non-zero rules included
    rule1_high_feather_optimal_temp: 0.73,
    rule3_high_feather_hot_temp:     0.07,
  },

  inputs: {
    featherDensity: "HIGH",
    temperature:    22,
    humidity:       undefined,
  },

  explanation: "Fertility prediction: HIGH (82.5% likelihood). ..."
}
```

---

## Summary Reference Table

| Step | Name | Input | Output |
|---|---|---|---|
| 1 | Fuzzification | Raw numbers | Fuzzy membership sets |
| 2 | Rule Evaluation | Membership sets | Rule firing strengths |
| 3 | Defuzzification | Rule strengths | Single crisp score (0–100) |
| 4 | TCI Calculation | Temp + humidity | Thermal stress index (0–1) |
| 5 | Temp Stress | Temperature °C | Stress value (0–1) |
| 6 | Humidity Stress | Humidity % | Stress value (0–1) |
| 7 | Fuzzify FDS | FDS (0.25 or 0.75) | low / medium / high memberships |
| 8 | Fuzzify Temp | Temperature °C | cold / optimal / hot memberships |
| 9 | Fuzzify Humidity | Humidity % | low / optimal / high memberships |
| 10 | Triangular MF | Any numeric value | Membership value (0–1) |
| 11 | MIN Operator | Two or more memberships | Rule firing strength |
| 12 | Core Rules | Feather + Temp combinations | 9 output votes |
| 13 | Centroid Method | All rule outputs | Final fertility score |

---

*Based on the AutoFeather Thesis Methodology — Mamdani-style Fuzzy Inference System (FIS)*
