import React from 'react';

interface WizardProps {
  steps: string[];
  step: number;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  children?: React.ReactNode;
  autosaveStatus?: string;
  canContinue?: boolean;
}

export const Wizard: React.FC<WizardProps> = ({ steps, step, onPrev, onNext, onSaveDraft, onPreview, children, autosaveStatus, canContinue = true }) => {
  const progress = Math.round(((step - 1) / Math.max(1, steps.length - 1)) * 100);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-sm text-slate-300">Step {step} of {steps.length} • {progress}%</div>
        </div>
        <div className="ml-4 flex items-center gap-3 text-sm">
          <div className="text-slate-400">{autosaveStatus}</div>
          <button type="button" onClick={onSaveDraft} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">Save draft</button>
          <button type="button" onClick={onPreview} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">Preview</button>
        </div>
      </div>

      <div>{children}</div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onPrev} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Back</button>
        <button type="button" onClick={onNext} disabled={!canContinue} className={`rounded-full px-4 py-2 text-sm font-medium ${canContinue ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 cursor-not-allowed'}`}>Continue</button>
      </div>
    </div>
  );
};

export default Wizard;
