type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray'

const map: Record<Variant, string> = {
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  blue: 'badge-blue',
  gray: 'badge-gray',
}

export default function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: Variant }) {
  return <span className={`badge ${map[variant]}`}>{children}</span>
}
