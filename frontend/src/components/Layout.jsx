import { NavLink, Outlet, Link } from 'react-router-dom'
import { Shield, Shirt, Camera, Users, PackageCheck, FileText, Box } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Shield },
  { name: 'Wardrobing', path: '/dashboard/wardrobing', icon: Shirt },
  { name: 'Fake Damage', path: '/dashboard/fake-damage', icon: Camera },
  { name: 'Return Ring', path: '/dashboard/return-ring', icon: Users },
  { name: 'Friendly Fraud', path: '/dashboard/friendly-fraud', icon: PackageCheck },
  { name: 'Receipt Fraud', path: '/dashboard/receipt-fraud', icon: FileText },
  { name: 'INR Abuse', path: '/dashboard/inr-abuse', icon: Box },
]

export default function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-64 border-r border-white/10 bg-surface flex flex-col">
        <Link to="/" className="h-16 flex items-center px-6 border-b border-white/10 hover:bg-white/5 transition-colors">
          <Shield className="w-8 h-8 text-accent mr-3" />
          <h1 className="text-xl font-bold font-sans text-white tracking-tight">Reta Aspis</h1>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-background p-8">
        <Outlet />
      </main>
    </div>
  )
}
