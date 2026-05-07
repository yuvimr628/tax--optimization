/**
 * TaxEngine.js — Deterministic Indian Income Tax Calculation Engine (FY 2024–25)
 * Shared logic synced with Backend Universal Engine.
 */

export const TAX_CONSTANTS = {
  STANDARD_DEDUCTION: 50000,
  STANDARD_DEDUCTION_NEW: 75000,
  LIMIT_80C: 150000,
  LIMIT_80D_DEFAULT: 25000,
  LIMIT_80D_SENIOR: 50000,
  LIMIT_NPS: 50000,
  LIMIT_HOME_LOAN: 200000,
  SURCHARGE_THRESHOLD: 5000000,
  CESS_RATE: 0.04,
  
  OLD_REGIME_SLABS: [
    { min: 0, max: 250000, rate: 0.00 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 },
  ],

  NEW_REGIME_SLABS: [
    { min: 0, max: 300000, rate: 0.00 },
    { min: 300000, max: 600000, rate: 0.05 },
    { min: 600000, max: 900000, rate: 0.10 },
    { min: 900000, max: 1200000, rate: 0.15 },
    { min: 1200000, max: 1500000, rate: 0.20 },
    { min: 1500000, max: Infinity, rate: 0.30 },
  ]
};

function computeSlabTax(taxableIncome, slabs) {
  let tax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break;

    const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
    const slabTax = Math.round(taxableInSlab * slab.rate);

    if (taxableInSlab > 0) {
      breakdown.push({
        range: `₹${(slab.min / 100000).toFixed(1)}L – ${slab.max === Infinity ? "Above" : `₹${(slab.max / 100000).toFixed(1)}L`}`,
        rate: `${(slab.rate * 100).toFixed(0)}%`,
        taxableAmount: taxableInSlab,
        tax: slabTax,
      });
      tax += slabTax;
    }
  }

  return { tax, breakdown };
}

export function calculateTaxOldRegime(inputs) {
  const { 
    annualGrossIncome: gross, 
    investments80C = 0, 
    health80D = 0, 
    nps80CCD1B = 0, 
    hra = 0, 
    homeLoan = 0, 
    isSenior = false,
    profTax = 0 
  } = inputs;

  const deduction80C = Math.min(Number(investments80C), TAX_CONSTANTS.LIMIT_80C);
  const limit80D = isSenior ? TAX_CONSTANTS.LIMIT_80D_SENIOR : TAX_CONSTANTS.LIMIT_80D_DEFAULT;
  const deduction80D = Math.min(Number(health80D), limit80D);
  const deductionNPS = Math.min(Number(nps80CCD1B), TAX_CONSTANTS.LIMIT_NPS);
  const deductionHRA = Number(hra);
  const deductionHomeLoan = Math.min(Number(homeLoan), TAX_CONSTANTS.LIMIT_HOME_LOAN);
  const standardDeduction = TAX_CONSTANTS.STANDARD_DEDUCTION;

  const totalDeductions = standardDeduction + deduction80C + deduction80D + deductionNPS + deductionHRA + deductionHomeLoan + Number(profTax);
  const taxableIncome = Math.max(0, Number(gross) - totalDeductions);

  const { tax: baseTax, breakdown } = computeSlabTax(taxableIncome, TAX_CONSTANTS.OLD_REGIME_SLABS);

  let rebate87A = 0;
  if (taxableIncome <= 500000) rebate87A = baseTax;

  let taxAfterRebate = Math.max(0, baseTax - rebate87A);
  const surcharge = taxableIncome > TAX_CONSTANTS.SURCHARGE_THRESHOLD ? taxAfterRebate * 0.10 : 0;
  const cess = Math.round((taxAfterRebate + surcharge) * TAX_CONSTANTS.CESS_RATE);
  const finalTax = taxAfterRebate + surcharge + cess;

  return {
    regime: 'OLD',
    gross: Number(gross),
    deductions: { standard: standardDeduction, section80C: deduction80C, section80D: deduction80D, nps80CCD: deductionNPS, hra: deductionHRA, homeLoan: deductionHomeLoan, total: totalDeductions },
    taxableIncome, baseTax, rebate87A, surcharge, cess, finalTax, slabBreakdown: breakdown,
  };
}

export function calculateTaxNewRegime(inputs) {
  const { annualGrossIncome: gross } = inputs;
  
  const standardDeduction = TAX_CONSTANTS.STANDARD_DEDUCTION_NEW;
  const totalDeductions = standardDeduction;
  const taxableIncome = Math.max(0, Number(gross) - totalDeductions);

  const { tax: baseTax, breakdown } = computeSlabTax(taxableIncome, TAX_CONSTANTS.NEW_REGIME_SLABS);

  let rebate87A = 0;
  let taxAfterRebate = baseTax;
  let marginalRelief = 0;

  if (taxableIncome <= 700000) {
    rebate87A = baseTax;
    taxAfterRebate = 0;
  } else if (taxableIncome > 700000 && taxableIncome <= 727770) {
    const excessIncome = taxableIncome - 700000;
    if (baseTax > excessIncome) {
        marginalRelief = baseTax - excessIncome;
        taxAfterRebate = excessIncome;
    }
  }

  const surcharge = taxableIncome > TAX_CONSTANTS.SURCHARGE_THRESHOLD ? taxAfterRebate * 0.10 : 0;
  const cess = Math.round((taxAfterRebate + surcharge) * TAX_CONSTANTS.CESS_RATE);
  const finalTax = taxAfterRebate + surcharge + cess;

  return {
    regime: 'NEW',
    gross: Number(gross),
    deductions: { standard: standardDeduction, section80C: 0, section80D: 0, nps80CCD: 0, hra: 0, homeLoan: 0, total: totalDeductions },
    taxableIncome, baseTax, rebate87A, marginalRelief, surcharge, cess, finalTax, slabBreakdown: breakdown,
  };
}

export function getScenarios(inputs) {
  const oldRegime = calculateTaxOldRegime(inputs);
  const newRegime = calculateTaxNewRegime(inputs);

  const recommendedRegimeName = newRegime.finalTax < oldRegime.finalTax ? 'NEW' : (oldRegime.finalTax < newRegime.finalTax ? 'OLD' : 'EITHER');
  const recommended = recommendedRegimeName === 'NEW' ? newRegime : (recommendedRegimeName === 'OLD' ? oldRegime : 'EITHER');
  const difference = Math.abs(oldRegime.finalTax - newRegime.finalTax);

  const optimizedOld = calculateTaxOldRegime({
    ...inputs,
    investments80C: TAX_CONSTANTS.LIMIT_80C,
    health80D: inputs.isSenior ? TAX_CONSTANTS.LIMIT_80D_SENIOR : TAX_CONSTANTS.LIMIT_80D_DEFAULT,
    nps80CCD1B: TAX_CONSTANTS.LIMIT_NPS
  });

  return {
    oldRegime,
    newRegime,
    recommended: recommended === 'EITHER' ? 'EITHER' : { regime: recommendedRegimeName, details: recommended },
    difference,
    optimizedOld
  };
}
