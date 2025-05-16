import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  label: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: string;
  onStepClick: (stepId: string) => void;
}

export function StepProgressBar({ steps, currentStep, onStepClick }: StepProgressBarProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted" />
      
      {/* Active progress indicator */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300"
        style={{ 
          width: `${(currentIndex / (steps.length - 1)) * 100}%`
        }} 
      />
      
      <ol className="relative z-10 flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentIndex;
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex flex-col items-center",
                (isActive || isCompleted) ? "cursor-pointer" : "cursor-not-allowed"
              )}
              onClick={() => (isActive || isCompleted) && onStepClick(step.id)}
            >
              <motion.div 
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isActive || isCompleted 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-muted bg-background text-foreground"
                )}
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </motion.div>
              
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isActive || isCompleted 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}