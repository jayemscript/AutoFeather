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
   * @param featherDensity - LOW or HIGH from YOLOv8 classification
   * @param temperature - Temperature in Celsius
   * @param humidity - Optional humidity percentage (0-100)
   * @returns Fuzzy logic fertility prediction result
   */
  async inferFertility(
    featherDensity: 'LOW' | 'HIGH',
    temperature: number,
    humidity?: number,
  ): Promise<FuzzyLogicResult> {
    this.logger.log(
      `🔬 Starting Fuzzy Logic Inference - Density: ${featherDensity}, Temp: ${temperature}°C, Humidity: ${humidity ?? 'N/A'}%`,
    );

    // ==========================================
    // STEP 1: FUZZIFICATION
    // ==========================================
    // Convert crisp inputs to fuzzy membership values

    // Feather Density Score (FDS)
    // HIGH = 0.75 (High Resilience), LOW = 0.25 (Low Resilience)
    const fds = featherDensity === 'HIGH' ? 0.75 : 0.25;

    // Thermal Comfort Index (TCI) - based on temperature
    const tci = this.calculateThermalComfortIndex(temperature, humidity);

    this.logger.log(`📊 Fuzzification: FDS=${fds}, TCI=${tci}`);

    // Fuzzy membership values
    const featherMembership = this.fuzzifyFeatherDensity(fds);
    const tempMembership = this.fuzzifyTemperature(temperature);
    const humidityMembership = humidity ? this.fuzzifyHumidity(humidity) : null;

    // ==========================================
    // STEP 2: FUZZY INFERENCE (RULE EVALUATION)
    // ==========================================
    // Using Minimum (AND) operator as per Equation 1
    const ruleStrengths = this.evaluateRulesWithMinimum(
      featherMembership,
      tempMembership,
      humidityMembership,
      fds,
      tci,
    );

    this.logger.log(
      ` Rule Evaluation: ${Object.keys(ruleStrengths).length} rules fired`,
    );

    // ==========================================
    // STEP 3: DEFUZZIFICATION
    // ==========================================
    // Using Centroid Method as per Equation 2
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
   * Based on temperature and humidity
   *
   * TCI = 0.80 (High Heat Stress) is threshold
   * Lower TCI = better thermal comfort
   */
  private calculateThermalComfortIndex(
    temp: number,
    humidity?: number,
  ): number {
    // Optimal temperature range: 18-24°C
    // Optimal humidity range: 50-70%

    const tempStress = this.calculateTemperatureStress(temp);
    const humidityStress = humidity
      ? this.calculateHumidityStress(humidity)
      : 0;

    // Combine stresses (weighted average)
    const tci = humidity ? tempStress * 0.7 + humidityStress * 0.3 : tempStress;

    // Normalize to 0-1 range
    return Math.min(1, Math.max(0, tci));
  }

  /**
   * Calculate temperature stress component
   */
  private calculateTemperatureStress(temp: number): number {
    // Optimal: 18-24°C (stress = 0)
    // Cold: < 18°C (increasing stress)
    // Hot: > 24°C (increasing stress)

    if (temp >= 18 && temp <= 24) {
      // Optimal range - low stress
      return 0.2;
    } else if (temp < 18) {
      // Cold stress increases linearly
      const coldStress = (18 - temp) / 18; // 0 at 18°C, 1 at 0°C
      return Math.min(1, 0.2 + coldStress * 0.6);
    } else {
      // Heat stress increases exponentially
      const heatStress = (temp - 24) / 16; // 0 at 24°C, 1 at 40°C
      return Math.min(1, 0.2 + heatStress * 0.8);
    }
  }

  /**
   * Calculate humidity stress component
   */
  private calculateHumidityStress(humidity: number): number {
    // Optimal: 50-70% (stress = 0)
    if (humidity >= 50 && humidity <= 70) {
      return 0.1;
    } else if (humidity < 50) {
      // Dry stress
      const dryStress = (50 - humidity) / 50;
      return Math.min(1, 0.1 + dryStress * 0.4);
    } else {
      // High humidity stress
      const humidStress = (humidity - 70) / 30;
      return Math.min(1, 0.1 + humidStress * 0.5);
    }
  }

  /**
   * Fuzzify Feather Density Score (FDS)
   * High Resilience: FDS ≥ 0.75
   * Medium Resilience: 0.4 ≤ FDS < 0.75
   * Low Resilience: FDS < 0.4
   */
  private fuzzifyFeatherDensity(fds: number): {
    low: number;
    medium: number;
    high: number;
  } {
    return {
      low: this.triangularMF(fds, 0, 0, 0.4),
      medium: this.triangularMF(fds, 0.3, 0.55, 0.8),
      high: this.triangularMF(fds, 0.7, 1, 1),
    };
  }

  /**
   * Fuzzify temperature
   * Cold: < 18°C
   * Optimal: 18-24°C
   * Hot: > 24°C
   */
  private fuzzifyTemperature(temp: number): {
    cold: number;
    optimal: number;
    hot: number;
  } {
    return {
      cold: this.triangularMF(temp, 0, 0, 18, 22),
      optimal: this.triangularMF(temp, 18, 21, 24),
      hot: this.triangularMF(temp, 22, 30, 50, 50),
    };
  }

  /**
   * Fuzzify humidity
   */
  private fuzzifyHumidity(humidity: number): {
    low: number;
    optimal: number;
    high: number;
  } {
    return {
      low: this.triangularMF(humidity, 0, 0, 40, 60),
      optimal: this.triangularMF(humidity, 50, 60, 70),
      high: this.triangularMF(humidity, 60, 80, 100, 100),
    };
  }

  /**
   * Triangular membership function
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
   * As per Equation 1: α_i = min(μ_FDS(x), μ_TCI(y))
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

    // Rule 1: High feather density (FDS ≥ 0.75) + Optimal temp → HIGH Fertility
    rules.rule1_high_feather_optimal_temp = Math.min(
      feather.high,
      temp.optimal,
    );

    // Rule 2: High feather density + Cold temp → MEDIUM Fertility
    // (Good insulation protects against cold)
    rules.rule2_high_feather_cold_temp = Math.min(feather.high, temp.cold);

    // Rule 3: High feather density + Hot temp → MEDIUM-LOW Fertility
    // (Dense feathers retain heat, not ideal)
    rules.rule3_high_feather_hot_temp = Math.min(feather.high, temp.hot);

    // Rule 4: Medium feather density + Optimal temp → MEDIUM Fertility
    rules.rule4_medium_feather_optimal_temp = Math.min(
      feather.medium,
      temp.optimal,
    );

    // Rule 5: Medium feather density + Cold/Hot → LOW-MEDIUM Fertility
    rules.rule5_medium_feather_cold_temp = Math.min(feather.medium, temp.cold);
    rules.rule6_medium_feather_hot_temp = Math.min(feather.medium, temp.hot);

    // Rule 7: Low feather density (FDS < 0.4) + Cold temp → LOW Fertility
    // (Poor insulation in cold = high stress)
    rules.rule7_low_feather_cold_temp = Math.min(feather.low, temp.cold);

    // Rule 8: Low feather density + Optimal temp → MEDIUM-LOW Fertility
    rules.rule8_low_feather_optimal_temp = Math.min(feather.low, temp.optimal);

    // Rule 9: Low feather density + Hot temp → LOW Fertility
    rules.rule9_low_feather_hot_temp = Math.min(feather.low, temp.hot);

    // ==========================================
    // HUMIDITY ENHANCEMENT RULES (if humidity provided)
    // ==========================================
    if (humidity) {
      // Rule 10: Perfect conditions (High FDS + Optimal temp + Optimal humidity)
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
    // If TCI ≥ 0.80 (High Heat Stress), reduce fertility
    if (tci >= 0.8) {
      rules.rule13_high_heat_stress = tci;
    }

    // Filter out rules with zero strength
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
   * As per Equation 2: Z* = ∫μC(z)·z dz / ∫μC(z) dz
   *
   * Computes the center of gravity of the aggregated fuzzy set
   */
  private centroidDefuzzification(
    ruleStrengths: Record<string, number>,
  ): number {
    // Define output fuzzy sets for each rule (fertility percentages)
    const ruleOutputs: Record<string, { center: number; width: number }> = {
      // High Fertility Rules
      rule1_high_feather_optimal_temp: { center: 90, width: 10 },
      rule10_perfect_conditions: { center: 95, width: 5 },

      // Medium-High Fertility Rules
      rule2_high_feather_cold_temp: { center: 70, width: 15 },
      rule4_medium_feather_optimal_temp: { center: 65, width: 15 },

      // Medium Fertility Rules
      rule3_high_feather_hot_temp: { center: 55, width: 15 },
      rule5_medium_feather_cold_temp: { center: 50, width: 15 },
      rule6_medium_feather_hot_temp: { center: 45, width: 15 },

      // Medium-Low Fertility Rules
      rule8_low_feather_optimal_temp: { center: 40, width: 15 },

      // Low Fertility Rules
      rule7_low_feather_cold_temp: { center: 25, width: 15 },
      rule9_low_feather_hot_temp: { center: 20, width: 15 },

      // Stress Penalty Rules
      rule11_low_humidity_stress: { center: 35, width: 10 },
      rule12_high_humidity_stress: { center: 30, width: 10 },
      rule13_high_heat_stress: { center: 20, width: 10 },
    };

    // Centroid calculation using discrete approximation
    const numPoints = 101; // 0 to 100 with step 1
    let numerator = 0;
    let denominator = 0;

    for (let z = 0; z <= 100; z++) {
      let membershipAtZ = 0;

      // For each rule, calculate membership at this z value
      for (const [rule, strength] of Object.entries(ruleStrengths)) {
        const output = ruleOutputs[rule];
        if (!output) continue;

        // Triangular membership function for output
        const membership = this.triangularMF(
          z,
          output.center - output.width,
          output.center,
          output.center + output.width,
        );

        // Take the maximum of (rule_strength AND output_membership)
        // This is the implication step in Mamdani
        const impliedMembership = Math.min(strength, membership);

        // Aggregation: take maximum across all rules
        membershipAtZ = Math.max(membershipAtZ, impliedMembership);
      }

      // Centroid formula
      numerator += membershipAtZ * z;
      denominator += membershipAtZ;
    }

    // Compute centroid
    const centroid = denominator > 0 ? numerator / denominator : 50;

    // Ensure result is in [0, 100]
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

    // Feather Density Analysis
    explanation += `Feather Density Score (FDS): ${fds.toFixed(2)} (${featherDensity} resilience). `;
    if (fds >= 0.75) {
      explanation +=
        'Excellent feather coverage provides superior thermal regulation. ';
    } else if (fds >= 0.4) {
      explanation += 'Moderate feather coverage offers adequate insulation. ';
    } else {
      explanation += 'Low feather coverage may compromise thermal comfort. ';
    }

    // Thermal Comfort Index
    explanation += `Thermal Comfort Index (TCI): ${tci.toFixed(2)}. `;
    if (tci >= 0.8) {
      explanation +=
        'High heat stress detected - fertility may be compromised. ';
    } else if (tci >= 0.5) {
      explanation += 'Moderate thermal stress present. ';
    } else {
      explanation += 'Thermal conditions are favorable. ';
    }

    // Temperature Assessment
    if (temperature < 18) {
      explanation += `Temperature (${temperature}°C) below optimal range (18-24°C) - cold stress may reduce fertility. `;
    } else if (temperature > 24) {
      explanation += `Temperature (${temperature}°C) above optimal range (18-24°C) - heat stress may affect fertility. `;
    } else {
      explanation += `Temperature (${temperature}°C) within optimal range. `;
    }

    // Humidity Assessment
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
