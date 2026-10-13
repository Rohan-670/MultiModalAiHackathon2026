import React from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Formats mathematical text, LaTeX fragments, and variables
 * into clean, readable typography with Greek letters and mathematical symbols.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Format common LaTeX patterns into readable math symbols
  const formatMathString = (raw: string): string => {
    return raw
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\nabla/g, '∇')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\partial/g, '∂')
      .replace(/\\mathbb\{R\}/g, 'ℝ')
      .replace(/\\in/g, '∈')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\infty/g, '∞')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\pi/g, 'π')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^4/g, '⁴')
      .replace(/\^5/g, '⁵')
      .replace(/\^T/g, 'ᵀ')
      .replace(/_0/g, '₀')
      .replace(/_1/g, '₁')
      .replace(/_2/g, '₂')
      .replace(/_3/g, '₃')
      .replace(/_t/g, 'ₜ')
      .replace(/_\{t\+1\}/g, 'ₜ₊₁')
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, ' ')
      .replace(/\\quad/g, '  ');
  };

  // Split by markdown math delimiters $...$ or $$...$$
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const content = part.slice(2, -2);
          return (
            <span
              key={idx}
              className="block my-2 py-1 px-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg font-mono text-sm text-teal-800 dark:text-teal-300 font-medium overflow-x-auto"
            >
              {formatMathString(content)}
            </span>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const content = part.slice(1, -1);
          return (
            <span
              key={idx}
              className="inline-block px-1 py-0.2 rounded font-mono text-xs sm:text-sm text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/50"
            >
              {formatMathString(content)}
            </span>
          );
        } else {
          return <span key={idx}>{formatMathString(part)}</span>;
        }
      })}
    </span>
  );
};
