export type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray'

const map: Record<Variant, string> = {
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  blue: 'badge-blue',
  gray: 'badge-gray',
}

export default function Badge({ children, variant = 'gray', className = '' }: { children: React.ReactNode; variant?: Variant; className?: string }) {
  return <span className={`badge ${map[variant]} ${className}`.trim()}>{children}</span>
}
