import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Lock, Eye, Terminal, ChevronRight } from 'lucide-react'
import GridScan from '../components/GridScan'

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      {/* 3D Grid Scanner Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#2F293A"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          scanDuration={3.0}
        />
      </div>

      {/* Background FX (Existing) */}
      <div className="grid-bg opacity-20 pointer-events-none" />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-4 max-w-4xl"
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-4 rounded-3xl bg-accent/10 border border-accent/30 shadow-[0_0_50px_rgba(0,200,255,0.2)]"
          >
            <Shield className="w-16 h-16 text-accent" />
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold font-sans text-white mb-6 tracking-tight leading-none">
          RETA<span className="text-accent"> ASPIS</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          The industry standard for AI-driven forensic auditing. 
          Identify pixel-level tampering and coordinated scam patterns in milliseconds.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="group relative px-10 py-5 bg-accent text-background font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,200,255,0.4)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
            <span className="relative flex items-center text-lg uppercase tracking-widest">
              Initialize Scanner <ChevronRight className="ml-2 w-6 h-6" />
            </span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-accent font-mono text-xl font-bold">99.8%</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Accuracy</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-accent font-mono text-xl font-bold">&lt;1.2s</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Latency</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Features */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-12 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
        <Feature icon={Zap} label="Real-time" />
        <Feature icon={Eye} label="Forensic" />
        <Feature icon={Lock} label="Secure" />
        <Feature icon={Terminal} label="API" />
      </div>
    </div>
  )
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Icon className="w-6 h-6 text-white" />
      <span className="text-[10px] font-mono uppercase tracking-[0.3em]">{label}</span>
    </div>
  )
}
