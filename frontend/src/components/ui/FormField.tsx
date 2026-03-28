import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

function FormField({ label, required = false, children }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export default FormField;
