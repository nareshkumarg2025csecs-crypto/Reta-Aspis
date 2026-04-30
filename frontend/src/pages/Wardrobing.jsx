import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import ResultDisplay from '../components/ResultDisplay'
import { Shirt } from 'lucide-react'

export default function Wardrobing() {
  const [formData, setFormData] = useState({
    purchase_date: '',
    return_date: '',
    baseline_rate: '',
    buyer_return_count: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const response = await api.post('/wardrobing', formData)
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing wardrobing fraud. Please check the backend connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <Shirt className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold tracking-wide">Wardrobing Analyzer</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date</label>
              <input 
                type="date" 
                name="purchase_date"
                required
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Return Date</label>
              <input 
                type="date" 
                name="return_date"
                required
                value={formData.return_date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">SKU Baseline Return Rate (%)</label>
            <input 
              type="number" 
              name="baseline_rate"
              required
              min="0" max="100" step="0.1"
              value={formData.baseline_rate}
              onChange={handleChange}
              placeholder="e.g. 15"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Buyer Return Count (Optional)</label>
            <input 
              type="number" 
              name="buyer_return_count"
              min="0"
              value={formData.buyer_return_count}
              onChange={handleChange}
              placeholder="e.g. 3"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 text-background font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Calculate Risk Score'}
          </button>
        </form>
      </div>

      {/* Result Panel */}
      <div className="min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 h-full shadow-xl"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full"
                />
              </div>
              <div className="space-y-2">
                <p className="text-accent font-bold uppercase tracking-widest text-xs animate-pulse">Running Forensic Scan...</p>
                <p className="text-[10px] text-gray-500 font-mono max-w-[250px] mx-auto leading-relaxed">
                  Analyzing purchase intervals and cross-referencing calendar metadata for weekend patterns.
                </p>
                <p className="text-[9px] text-accent/40 font-mono mt-4 italic">
                  Note: Initial analysis may take 30-40s as our AI core initializes.
                </p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ResultDisplay result={result} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 h-full shadow-xl"
            >
              <Shirt className="w-12 h-12 text-white/5" />
              <p className="text-gray-500 text-sm font-medium">Enter order details to begin forensic analysis</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
