import { Injectable, Logger } from '@nestjs/common';
import { FuzzyLogicResult } from '../interfaces/prediction.interface';

/**
 * Fuzzy Logic Service for Fertility Prediction
 * Based on AutoFeather Thesis Methodology
 *
 * Uses Mamdani-style Fuzzy Inference System (FIS) with:
 * 1. Fuzzy Inference Logic (Minimum AND operator)
 * 2. Centroid Defuzzification Method
 *
 * Inputs:
 * - Feather Density Score (FDS): 0.75 (High Resilience) or lower
 * - Thermal Comfort Index (TCI): 0.80 (High Heat Stress) or lower
 *
 * Output:
 * - Fertility Likelihood: 0-100%
 */
@Injectable()
export class FuzzyLogicService {
  private readonly logger = new Logger(FuzzyLogicService.name);

  /**
   * Main fuzzy logic inference method
   */
  async inferFertility(
    featherDensity: 'LOW' | 'HIGH',
    temperature: number,
    humidity?: number,
  ): Promise<FuzzyLogicResult> {
    this.logger.log(
      `Starting Fuzzy Logic Inference - Density: ${featherDensity}, Temp: ${temperature}°C, Humidity: ${humidity ?? 'N/A'}%`,
    );

    // ==========================================
    // STEP 1: FUZZIFICATION
    // ==========================================
    const fds = featherDensity === 'HIGH' ? 0.75 : 0.25;
    const tci = this.calculateThermalComfortIndex(temperature, humidity);

    this.logger.log(`Fuzzification: FDS=${fds}, TCI=${tci}`);

    const featherMembership = this.fuzzifyFeatherDensity(fds);
    const tempMembership = this.fuzzifyTemperature(temperature);
    const humidityMembership = humidity != null ? this.fuzzifyHumidity(humidity) : null;

    // Log memberships for debug visibility
    this.logger.debug(
      `Feather membership: low=${featherMembership.low.toFixed(3)}, medium=${featherMembership.medium.toFixed(3)}, high=${featherMembership.high.toFixed(3)}`,
    );
    this.logger.debug(
      `Temp membership: cold=${tempMembership.cold.toFixed(3)}, optimal=${tempMembership.optimal.toFixed(3)}, hot=${tempMembership.hot.toFixed(3)}`,
    );

    // ==========================================
    // STEP 2: FUZZY INFERENCE (RULE EVALUATION)
    // ==========================================
    const ruleStrengths = this.evaluateRulesWithMinimum(
      featherMembership,
      tempMembership,
      humidityMembership,
      fds,
      tci,
    );

    this.logger.log(
      `Rule Evaluation: ${Object.keys(ruleStrengths).length} rules fired`,
    );

    // ==========================================
    // STEP 3: DEFUZZIFICATION
    // ==========================================
    const fertilityScore = this.centroidDefuzzification(ruleStrengths);
    const fertilityLevel = this.getFertilityLevel(fertilityScore);

    this.logger.log(
      `Result: ${fertilityLevel} (${fertilityScore.toFixed(2)}% fertility)`,
    );

    const result: FuzzyLogicResult = {
      fertilityScore: Math.round(fertilityScore * 100) / 100,
      fertilityLevel,
      ruleStrengths,
      inputs: {
        featherDensity,
        temperature,
        humidity,
      },
      explanation: this.generateExplanation(
        featherDensity,
        temperature,
        humidity,
        fertilityLevel,
        fertilityScore,
        fds,
        tci,
      ),
    };

    return result;
  }

  /**
   * Calculate Thermal Comfort Index (TCI)
   */
  private calculateThermalComfortIndex(temp: number, humidity?: number): number {
    const tempStress = this.calculateTemperatureStress(temp);
    const humidityStress = humidity != null ? this.calculateHumidityStress(humidity) : 0;
    const tci = humidity != null
      ? tempStress * 0.7 + humidityStress * 0.3
      : tempStress;
    return Math.min(1, Math.max(0, tci));
  }

  /**
   * Calculate temperature stress component
   */
  private calculateTemperatureStress(temp: number): number {
    if (temp >= 18 && temp <= 24) {
      return 0.2;
    } else if (temp < 18) {
      const coldStress = (18 - temp) / 18;
      return Math.min(1, 0.2 + coldStress * 0.6);
    } else {
      const heatStress = (temp - 24) / 16;
      return Math.min(1, 0.2 + heatStress * 0.8);
    }
  }

  /**
   * Calculate humidity stress component
   */
  private calculateHumidityStress(humidity: number): number {
    if (humidity >= 50 && humidity <= 70) {
      return 0.1;
    } else if (humidity < 50) {
      const dryStress = (50 - humidity) / 50;
      return Math.min(1, 0.1 + dryStress * 0.4);
    } else {
      const humidStress = (humidity - 70) / 30;
      return Math.min(1, 0.1 + humidStress * 0.5);
    }
  }

  /**
   * Fuzzify Feather Density Score (FDS)
   *
   * Sets overlap to avoid dead zones:
   *   low:    peaks at 0,    fades to 0 at 0.5
   *   medium: peaks at 0.5,  overlaps both low and high
   *   high:   peaks at 1.0,  starts rising from 0.5
   */
 private fuzzifyFeatherDensity(fds: number): {
  low: number;
  medium: number;
  high: number;
} {
  return {
    // peaks at 0 (your LOW FDS value = 0.25 sits on the ramp → still meaningful)
    low:    this.triangularMF(fds, 0,    0,    0.25, 0.5),
    // peaks at 0.5, overlaps both low and high
    medium: this.triangularMF(fds, 0.2,  0.5,  0.7),
    // peaks at 0.75 (your exact HIGH FDS value → membership = 1.0)
    high:   this.triangularMF(fds, 0.5,  0.75, 1,   1),
  };
}

  /**
   * Fuzzify temperature
   *
   * FIX: Overlapping boundaries so no dead zone exists between sets.
   *   cold:    peaks 0–18°C,  fades to 0 at 24°C
   *   optimal: peaks at 21°C, overlaps cold (16°C) and hot (27°C)
   *   hot:     starts rising at 21°C, peaks at 30°C+
   *
   * At any given temperature, at least one (usually two) sets are non-zero.
   */
  private fuzzifyTemperature(temp: number): {
    cold: number;
    optimal: number;
    hot: number;
  } {
    return {
      cold:    this.triangularMF(temp, 0,   0,   18,  24),
      optimal: this.triangularMF(temp, 16,  21,  27),
      hot:     this.triangularMF(temp, 21,  30,  50,  50),
    };
  }

  /**
   * Fuzzify humidity
   *
   * FIX: Overlapping boundaries to avoid dead zones.
   *   low:     peaks 0–40%,  fades to 0 at 60%
   *   optimal: peaks at 60%, overlaps low (45%) and high (70%)
   *   high:    starts rising at 65%, peaks at 85%+
   */
  private fuzzifyHumidity(humidity: number): {
    low: number;
    optimal: number;
    high: number;
  } {
    return {
      low:     this.triangularMF(humidity, 0,   0,   40,  60),
      optimal: this.triangularMF(humidity, 45,  60,  75),
      high:    this.triangularMF(humidity, 65,  85,  100, 100),
    };
  }

  /**
   * Triangular / Trapezoidal membership function
   *
   * Shape:
   *   a ──── b ════ c ──── d
   *        rises  flat  falls
   *
   * If d is omitted, c == d (pure triangle, no flat top).
   * Returns 0 outside [a, d], 1 on [b, c], linear ramps on [a,b] and [c,d].
   */
  private triangularMF(
    x: number,
    a: number,
    b: number,
    c: number,
    d?: number,
  ): number {
    if (d === undefined) d = c;

    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
  }

  /**
   * Evaluate fuzzy rules using MINIMUM (AND) operator
   * α_i = min(μ_FDS(x), μ_TCI(y))
   */
  private evaluateRulesWithMinimum(
    feather: { low: number; medium: number; high: number },
    temp: { cold: number; optimal: number; hot: number },
    humidity: { low: number; optimal: number; high: number } | null,
    fds: number,
    tci: number,
  ): Record<string, number> {
    const rules: Record<string, number> = {};

    // ==========================================
    // CORE RULES (Feather Density + Temperature)
    // ==========================================

    // Rule 1: High feather + Optimal temp → HIGH fertility
    rules.rule1_high_feather_optimal_temp = Math.min(feather.high, temp.optimal);

    // Rule 2: High feather + Cold temp → MEDIUM-HIGH fertility
    // (Good insulation protects against cold)
    rules.rule2_high_feather_cold_temp = Math.min(feather.high, temp.cold);

    // Rule 3: High feather + Hot temp → MEDIUM-LOW fertility
    // (Dense feathers retain heat)
    rules.rule3_high_feather_hot_temp = Math.min(feather.high, temp.hot);

    // Rule 4: Medium feather + Optimal temp → MEDIUM fertility
    rules.rule4_medium_feather_optimal_temp = Math.min(feather.medium, temp.optimal);

    // Rule 5 & 6: Medium feather + Cold/Hot → LOW-MEDIUM fertility
    rules.rule5_medium_feather_cold_temp = Math.min(feather.medium, temp.cold);
    rules.rule6_medium_feather_hot_temp = Math.min(feather.medium, temp.hot);

    // Rule 7: Low feather + Cold → LOW fertility
    rules.rule7_low_feather_cold_temp = Math.min(feather.low, temp.cold);

    // Rule 8: Low feather + Optimal → MEDIUM-LOW fertility
    rules.rule8_low_feather_optimal_temp = Math.min(feather.low, temp.optimal);

    // Rule 9: Low feather + Hot → LOW fertility
    rules.rule9_low_feather_hot_temp = Math.min(feather.low, temp.hot);

    // ==========================================
    // HUMIDITY ENHANCEMENT RULES
    // ==========================================
    if (humidity) {
      // Rule 10: Perfect conditions
      rules.rule10_perfect_conditions = Math.min(
        feather.high,
        temp.optimal,
        humidity.optimal,
      );

      // Rule 11: Low humidity penalty
      rules.rule11_low_humidity_stress = Math.min(feather.high, humidity.low);

      // Rule 12: High humidity penalty
      rules.rule12_high_humidity_stress = Math.min(feather.high, humidity.high);
    }

    // ==========================================
    // THERMAL COMFORT INDEX (TCI) RULES
    // ==========================================
    if (tci >= 0.8) {
      rules.rule13_high_heat_stress = tci;
    }

    // Filter out zero-strength rules
    const activeRules: Record<string, number> = {};
    for (const [rule, strength] of Object.entries(rules)) {
      if (strength > 0) {
        activeRules[rule] = strength;
      }
    }

    return activeRules;
  }

  /**
   * Centroid Defuzzification Method
   * Z* = ∫μC(z)·z dz / ∫μC(z) dz
   */
  private centroidDefuzzification(ruleStrengths: Record<string, number>): number {
    const ruleOutputs: Record<string, { center: number; width: number }> = {
      rule1_high_feather_optimal_temp:  { center: 90, width: 10 },
      rule10_perfect_conditions:        { center: 95, width:  5 },
      rule2_high_feather_cold_temp:     { center: 70, width: 15 },
      rule4_medium_feather_optimal_temp:{ center: 65, width: 15 },
      rule3_high_feather_hot_temp:      { center: 55, width: 15 },
      rule5_medium_feather_cold_temp:   { center: 50, width: 15 },
      rule6_medium_feather_hot_temp:    { center: 45, width: 15 },
      rule8_low_feather_optimal_temp:   { center: 40, width: 15 },
      rule7_low_feather_cold_temp:      { center: 25, width: 15 },
      rule9_low_feather_hot_temp:       { center: 20, width: 15 },
      rule11_low_humidity_stress:       { center: 35, width: 10 },
      rule12_high_humidity_stress:      { center: 30, width: 10 },
      rule13_high_heat_stress:          { center: 20, width: 10 },
    };

    let numerator = 0;
    let denominator = 0;

    for (let z = 0; z <= 100; z++) {
      let membershipAtZ = 0;

      for (const [rule, strength] of Object.entries(ruleStrengths)) {
        const output = ruleOutputs[rule];
        if (!output) continue;

        const membership = this.triangularMF(
          z,
          output.center - output.width,
          output.center,
          output.center + output.width,
        );

        const impliedMembership = Math.min(strength, membership);
        membershipAtZ = Math.max(membershipAtZ, impliedMembership);
      }

      numerator += membershipAtZ * z;
      denominator += membershipAtZ;
    }

    const centroid = denominator > 0 ? numerator / denominator : 50;
    return Math.max(0, Math.min(100, centroid));
  }

  /**
   * Convert fertility score to categorical level
   */
  private getFertilityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score < 40) return 'LOW';
    if (score < 70) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    featherDensity: 'LOW' | 'HIGH',
    temperature: number,
    humidity: number | undefined,
    fertilityLevel: string,
    fertilityScore: number,
    fds: number,
    tci: number,
  ): string {
    let explanation = `Fertility prediction: ${fertilityLevel} (${fertilityScore.toFixed(1)}% likelihood). `;

    explanation += `Feather Density Score (FDS): ${fds.toFixed(2)} (${featherDensity} resilience). `;
    if (fds >= 0.75) {
      explanation += 'Excellent feather coverage provides superior thermal regulation. ';
    } else if (fds >= 0.4) {
      explanation += 'Moderate feather coverage offers adequate insulation. ';
    } else {
      explanation += 'Low feather coverage may compromise thermal comfort. ';
    }

    explanation += `Thermal Comfort Index (TCI): ${tci.toFixed(2)}. `;
    if (tci >= 0.8) {
      explanation += 'High heat stress detected - fertility may be compromised. ';
    } else if (tci >= 0.5) {
      explanation += 'Moderate thermal stress present. ';
    } else {
      explanation += 'Thermal conditions are favorable. ';
    }

    if (temperature < 18) {
      explanation += `Temperature (${temperature}°C) below optimal range (18-24°C) - cold stress may reduce fertility. `;
    } else if (temperature > 24) {
      explanation += `Temperature (${temperature}°C) above optimal range (18-24°C) - heat stress may affect fertility. `;
    } else {
      explanation += `Temperature (${temperature}°C) within optimal range. `;
    }

    if (humidity !== undefined) {
      if (humidity < 50) {
        explanation += `Low humidity (${humidity}%) may cause respiratory stress and dehydration. `;
      } else if (humidity > 70) {
        explanation += `High humidity (${humidity}%) may promote pathogen growth and reduce heat dissipation. `;
      } else {
        explanation += `Humidity (${humidity}%) within optimal range (50-70%). `;
      }
    }

    return explanation.trim();
  }
}