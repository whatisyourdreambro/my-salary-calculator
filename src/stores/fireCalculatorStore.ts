import { create } from 'zustand';

// Types from the component
export type CalculationStep = 'intro' | 'essentials' | 'investment' | 'events' | 'result';
export type InvestmentStrategy = 'conservative' | 'balanced' | 'aggressive';

export interface LifeEvent {
  year: number;
  type: 'oneTimeExpense' | 'oneTimeIncome';
  amount: string;
  description: string;
}

export interface FireInputs {
  currentAge: string;
  monthlySpending: string;
  currentSavings: string;
  monthlySavings: string;
  salaryGrowthRate: string;
  investmentStrategy: InvestmentStrategy;
  customReturn: string;
  retirementIncome: string;
}

// Store State and Actions
interface FireCalculatorState {
  step: CalculationStep;
  inputs: FireInputs;
  lifeEvents: LifeEvent[];
  setStep: (step: CalculationStep) => void;
  handleInputChange: (field: keyof FireInputs, value: string | InvestmentStrategy) => void;
  addLifeEvent: () => void;
  updateLifeEvent: (index: number, field: keyof LifeEvent, value: string | number) => void;
  removeLifeEvent: (index: number) => void;
  reset: () => void; // Added a reset function for convenience
}

const initialState = {
  step: 'intro' as CalculationStep,
  inputs: {
    currentAge: '30',
    monthlySpending: '3,000,000',
    currentSavings: '50,000,000',
    monthlySavings: '1,500,000',
    salaryGrowthRate: '5',
    investmentStrategy: 'balanced' as InvestmentStrategy,
    customReturn: '',
    retirementIncome: '0',
  },
  lifeEvents: [],
};

export const useFireCalculatorStore = create<FireCalculatorState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  handleInputChange: (field, value) =>
    set((state) => ({ inputs: { ...state.inputs, [field]: value } })),
  addLifeEvent: () =>
    set((state) => ({
      lifeEvents: [
        ...state.lifeEvents,
        {
          year: 1,
          type: 'oneTimeExpense',
          amount: '10,000,000',
          description: '이벤트',
        },
      ],
    })),
  updateLifeEvent: (index, field, value) =>
    set((state) => {
      const newEvents = [...state.lifeEvents];
      const event = { ...newEvents[index], [field]: value };
      newEvents[index] = event;
      return { lifeEvents: newEvents };
    }),
  removeLifeEvent: (index) =>
    set((state) => ({
      lifeEvents: state.lifeEvents.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
