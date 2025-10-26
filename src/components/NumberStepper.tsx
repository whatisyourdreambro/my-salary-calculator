"use client";

interface NumberStepperProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  unit: string;
}

export default function NumberStepper({
  label,
  value,
  onValueChange,
  min = 0,
  max,
  unit,
}: NumberStepperProps) {
  const handleDecrement = () => {
    const newValue = value - 1;
    if (newValue >= min) {
      onValueChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + 1;
    if (max === undefined || newValue <= max) {
      onValueChange(newValue);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center justify-between p-2 mt-2 bg-secondary/50 rounded-lg">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 text-xl rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="font-bold text-lg tabular-nums">
          {value} {unit}
        </span>
        <button
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className="w-8 h-8 text-xl rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
}
