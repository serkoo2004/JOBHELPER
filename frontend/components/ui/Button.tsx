import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs tracking-[0.16em]',
  md: 'px-5 py-3 text-sm tracking-[0.18em]',
  lg: 'px-6 py-3.5 text-sm tracking-[0.22em]',
};

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[var(--shadow-accent)] hover:translate-y-[-1px] hover:opacity-95',
  secondary:
    'border border-[var(--border-medium)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] hover:border-[var(--border-accent)] hover:bg-[color:var(--bg-hover)]',
  ghost:
    'bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]',
};

const baseClass =
  'inline-flex items-center justify-center rounded-full font-semibold uppercase transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60';

export default function Button(props: ButtonProps | LinkProps) {
  const { children, variant = 'primary', size = 'md', className = '' } = props;
  const finalClassName = `${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();

  if ('href' in props && props.href) {
    const { href, variant: _variant, size: _size, className: _className, ...rest } = props;
    return (
      <Link href={href} className={finalClassName} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, ...buttonProps } = props as ButtonProps;
  return (
    <button {...buttonProps} className={finalClassName}>
      {children}
    </button>
  );
}
