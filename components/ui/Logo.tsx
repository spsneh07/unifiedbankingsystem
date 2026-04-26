import { Landmark } from 'lucide-react'

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 36, className = '', variant = 'dark' }: LogoProps) {
  const iconSize = Math.floor(size * 0.55);
  
  return (
    <div 
      className={`flex items-center justify-center rounded-xl bg-[#00d4aa] glow-accent ${className}`}
      style={{ width: size, height: size }}
    >
      <Landmark 
        size={iconSize} 
        className={variant === 'dark' ? 'text-[#0a0c10]' : 'text-white'} 
      />
    </div>
  )
}
