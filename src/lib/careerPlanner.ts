// src/lib/careerPlanner.ts

// --- TYPE DEFINITIONS ---

// Event types: Promotion, Job Change, Education/Sabbatical, Start Side Project
export type CareerEventType = "promotion" | "job_change" | "education" | "side_project";

// Base interface for a career event
export interface BaseCareerEvent {
  year: number; // Year into the simulation this event occurs
  type: CareerEventType;
  description: string;
}

export interface PromotionEvent extends BaseCareerEvent {
  type: "promotion";
  salaryIncreasePercent: number; // e.g., 15 for 15%
}

export interface JobChangeEvent extends BaseCareerEvent {
  type: "job_change";
  newSalary: number; // New absolute annual salary
}

export interface EducationEvent extends BaseCareerEvent {
  type: "education";
  durationYears: number; // How many years the education/sabbatical lasts
  incomeDuringEvent: number; // Annual income during this period (can be 0)
  costPerYear: number; // e.g., tuition
}

export interface SideProjectEvent extends BaseCareerEvent {
  type: "side_project";
  initialAnnualIncome: number;
  growthRatePercent: number; // Annual growth rate of the side income
}

export type CareerEvent = PromotionEvent | JobChangeEvent | EducationEvent | SideProjectEvent;

// Main input for the simulation
export interface CareerSimulationInput {
  currentAge: number;
  simulationYears: number;
  initialSalary: number;
  initialAssets: number;
  // Global assumptions
  baseSalaryIncreasePercent: number; // Annual cost-of-living raise
  inflationPercent: number; // Affects expenses
  investmentReturnPercent: number; // Annual return on invested assets
  // User-defined events
  events: CareerEvent[];
}

// Output data point for each year of the simulation
export interface SimulationYearOutput {
  year: number;
  age: number;
  salary: number;
  sideIncome: number;
  totalIncome: number;
  expenses: number;
  savings: number;
  investedAssets: number;
  netWorth: number;
  eventDescription?: string;
}

// --- SIMULATION LOGIC ---

// A simplified net income calculation for the simulation
function calculateNet(gross: number): number {
  // This is a very rough approximation for simulation purposes.
  // It doesn't account for detailed tax brackets or deductions.
  if (gross <= 50000000) return gross * 0.85;
  if (gross <= 80000000) return gross * 0.8;
  if (gross <= 120000000) return gross * 0.75;
  return gross * 0.7;
}

export function runCareerSimulation(
  inputs: CareerSimulationInput
): SimulationYearOutput[] {
  const results: SimulationYearOutput[] = [];
  let currentSalary = inputs.initialSalary;
  let currentSideIncome = 0;
  let investedAssets = inputs.initialAssets;

  const eventsByYear = new Map<number, CareerEvent>();
  inputs.events.forEach(event => eventsByYear.set(event.year, event));

  for (let i = 0; i < inputs.simulationYears; i++) {
    const year = i + 1;
    const age = inputs.currentAge + year;
    let eventDescription: string | undefined = undefined;

    // Apply base salary increase (except for year 1)
    if (i > 0) {
      currentSalary *= (1 + inputs.baseSalaryIncreasePercent / 100);
    }

    // Apply side income growth
    if (currentSideIncome > 0) {
        // Assuming a simple growth model for now
        // A more robust model would check which event started the side income
    }

    // Check for and apply career events
    if (eventsByYear.has(i)) {
      const event = eventsByYear.get(i)!;
      eventDescription = event.description;
      switch (event.type) {
        case "promotion":
          currentSalary *= (1 + (event as any).salaryIncreasePercent / 100);
          break;
        case "job_change":
          currentSalary = (event as any).newSalary;
          break;
        case "side_project":
          // This is simplified. A real model would handle multiple side projects.
          currentSideIncome = (event as any).initialAnnualIncome;
          break;
        case "education":
          // This is highly simplified. A real model would handle the duration.
          currentSalary = (event as any).incomeDuringEvent;
          investedAssets -= (event as any).costPerYear;
          break;
      }
    }
    
    const totalIncome = currentSalary + currentSideIncome;
    const netIncome = calculateNet(totalIncome);
    
    // Simplified expense model: 50% of initial net income, adjusted for inflation
    const baseExpense = calculateNet(inputs.initialSalary) * 0.5;
    const expenses = baseExpense * Math.pow(1 + inputs.inflationPercent / 100, i);

    const savings = netIncome - expenses;

    // Update invested assets
    investedAssets = (investedAssets + savings) * (1 + inputs.investmentReturnPercent / 100);

    results.push({
      year,
      age,
      salary: Math.round(currentSalary),
      sideIncome: Math.round(currentSideIncome),
      totalIncome: Math.round(totalIncome),
      expenses: Math.round(expenses),
      savings: Math.round(savings),
      investedAssets: Math.round(investedAssets),
      netWorth: Math.round(investedAssets), // Simplified: net worth = invested assets
      eventDescription,
    });
  }

  return results;
}