import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Shirt, 
  Camera, 
  Users, 
  PackageCheck, 
  FileText, 
  Box,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'

const modules = [
  { 
    name: 'Wardrobing', 
    path: '/wardrobing', 
    icon: Shirt, 
    desc: 'Detect "wear and return" patterns in apparel using purchase intervals and event triggers.',
    color: 'emerald'
  },
  { 
    name: 'Fake Damage', 
    path: '/fake-damage', 
    icon: Camera, 
    desc: 'Verify product damage using AI forensic analysis, EXIF integrity, and structural plausibility.',
    color: 'blue'
  },
  { 
    name: 'Return Ring', 
    path: '/return-ring', 
    icon: Users, 
    desc: 'Expose coordinated fraud groups using geographic clustering and timing burst analysis.',
    color: 'purple'
  },
  { 
    name: 'Friendly Fraud', 
    path: '/friendly-fraud', 
    icon: PackageCheck, 
    desc: 'Identify "Item Not Received" abuse via delivery gap and account tenure scoring.',
    color: 'amber'
  },
  { 
    name: 'Receipt Fraud', 
    path: '/receipt-fraud', 
    icon: FileText, 
    desc: 'Detect pixel-level tempering and digital edits in customer-submitted return receipts.',
    color: 'cyan'
  },
  { 
    name: 'INR Abuse', 
    path: '/inr-abuse', 
    icon: Box, 
    desc: 'Verify claim legitimacy using carrier GPS logs and local neighborhood theft risk data.',
    color: 'rose'
  },
]

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-sans text-white mb-2 uppercase tracking-tight">Scanner Modules</h2>
          <p className="text-gray-500 font-medium">Select a forensic module to begin deep-packet analysis of the return request.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded-full">
          <ShieldAlert className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black text-accent uppercase tracking-widest">System Status: Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, idx) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(m.path)}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            <div className="relative glass p-6 rounded-3xl hover:border-accent/40 transition-all duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                  <m.icon className="w-8 h-8 text-white group-hover:text-accent transition-colors" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 font-sans tracking-tight">{m.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{m.desc}</p>
              
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Forensic Level 4</span>
                <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-accent' : 'bg-white/10'}`} />
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
