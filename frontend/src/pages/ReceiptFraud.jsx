import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, Upload, CheckCircle, AlertTriangle, Search, ShieldAlert, Fingerprint, Microscope, Scale, ShieldCheck, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const loadingSteps = [
  "📄 Reading retailer receipt...",
  "📄 Reading customer receipt...",  
  "🔍 Comparing all fields...",
  "🔬 Checking for image manipulation...",
  "⚡ Generating verdict..."
]

export default function ReceiptFraud() {
  const [formData, setFormData] = useState({ order_amount: '' })
  const [files, setFiles] = useState({ orig: null, cust: null })
  const [previews, setPreviews] = useState({ orig: null, cust: null })
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % loadingSteps.length)
      }, 800)
    } else {
      setStepIndex(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleFileChange = (side, file) => {
    if (!file) return
    setFiles(prev => ({ ...prev, [side]: file }))
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => ({ ...prev, [side]: e.target.result }))
      reader.readAsDataURL(file)
    } else {
      setPreviews(prev => ({ ...prev, [side]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files.orig || !files.cust) {
      alert("Please upload both receipts")
      return
    }

    setLoading(true)
    setResult(null)
    
    const data = new FormData()
    data.append('retailer_receipt', files.orig)
    data.append('customer_receipt', files.cust)
    data.append('order_amount', formData.order_amount)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/receipt-fraud`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
      setResult({
        success: false,
        error: error.response?.data?.error || error.message,
        confidence: 0,
        verdict: 'API ERROR - DO NOT APPROVE',
        summary: 'The analysis failed due to a system error. Please check your connection or API configuration.',
        recommended_action: 'Manual comparison required. System analysis failed.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Color Logic helper
  const getBannerConfig = (res) => {
    if (!res) return null
    if (res.confidence === 0 || res.verdict?.includes('ERROR') || res.success === false) {
      return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-500', icon: <XCircle className="w-6 h-6" />, label: '❌ ANALYSIS FAILED — Do Not Auto-Approve' }
    }
    if (res.verdict === "TAMPERING DETECTED" || res.fraud_probability === "HIGH" || res.fraud_probability === "CRITICAL") {
      return { bg: 'bg-red-600/20', border: 'border-red-600/50', text: 'text-red-600', icon: <ShieldAlert className="w-6 h-6" />, label: '🚨 TAMPERING DETECTED' }
    }
    if (res.verdict === "SUSPICIOUS - MANUAL REVIEW REQUIRED" || res.fraud_probability === "MEDIUM") {
      return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-500', icon: <AlertTriangle className="w-6 h-6" />, label: '⚠️ SUSPICIOUS — Manual Review Required' }
    }
    if (res.verdict === "RECEIPTS MATCH") {
      if (res.confidence >= 70) {
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-500', icon: <ShieldCheck className="w-6 h-6" />, label: '✅ RECEIPTS MATCH' }
      } else {
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-500', icon: <AlertTriangle className="w-6 h-6" />, label: '⚠️ LOW CONFIDENCE MATCH — Manual Review' }
      }
    }
    return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-500', icon: <Search className="w-6 h-6" />, label: 'UNKNOWN STATUS' }
  }

  const banner = getBannerConfig(result)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface/50 border border-white/5 rounded-xl px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
            <Fingerprint className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Forensic Receipt Scanner</h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Version 4.5 • Deep Vision Analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-accent/5 px-3 py-1.5 rounded-full border border-accent/20 shadow-inner">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(0,210,255,1)]" />
          <span className="text-[9px] font-black text-accent uppercase tracking-widest">Quantum Vision Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Upload className="w-4 h-4 text-accent" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Upload Evidence</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Retailer Source (Base)</label>
                <label className={`relative group flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files.orig ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/[0.02] hover:border-accent/30 hover:bg-white/[0.05]'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('orig', e.target.files[0])} />
                  {previews.orig ? (
                    <img src={previews.orig} className="absolute inset-0 w-full h-full object-contain p-3 rounded-2xl" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="p-4 rounded-full bg-white/5"><FileText className="w-8 h-8 text-white" /></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">Upload Original</span>
                    </div>
                  )}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent text-background text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">Ground Truth</div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Customer Claimed</label>
                <label className={`relative group flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files.cust ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 bg-white/[0.02] hover:border-amber-500/30 hover:bg-white/[0.05]'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('cust', e.target.files[0])} />
                  {previews.cust ? (
                    <img src={previews.cust} className="absolute inset-0 w-full h-full object-contain p-3 rounded-2xl" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="p-4 rounded-full bg-white/5"><ShieldAlert className="w-8 h-8 text-white" /></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">Upload Claimed</span>
                    </div>
                  )}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-background text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">Evidence</div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Order Amount Comparison (₹)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold">₹</div>
                <input 
                  type="number" 
                  value={formData.order_amount} 
                  onChange={(e) => setFormData({order_amount: e.target.value})} 
                  placeholder="Reference Amount (optional)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-mono text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !files.orig || !files.cust} 
              className={`group relative w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all overflow-hidden ${loading ? 'bg-white/5 text-gray-500' : 'bg-accent text-background hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent/20'}`}
            >
              <div className="relative z-10 flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span>Processing Analysis...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Run Forensic Comparison</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative min-h-[600px]">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center space-x-3">
            <Microscope className="w-4 h-4 text-accent" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Forensic Output</span>
          </div>

          <div className="flex-1 p-8 overflow-y-auto max-h-[700px] custom-scrollbar">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-md z-20 space-y-8"
                >
                  <div className="relative w-64 h-40 border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-0 h-1 bg-accent shadow-[0_0_30px_rgba(0,210,255,1)] z-30"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,210,255,0.05)_0%,transparent_70%)]" />
                    <div className="p-6 space-y-4 opacity-10">
                      {[1,2,3,4].map(i => <div key={i} className="h-2 w-full bg-white rounded-full" />)}
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <p className="text-accent font-black text-[11px] animate-pulse tracking-[0.4em] uppercase">{loadingSteps[stepIndex]}</p>
                    <div className="flex justify-center space-x-1">
                      {loadingSteps.map((_, i) => (
                        <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${i === stepIndex ? 'bg-accent w-8' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Verdict Banner */}
                  <div className={`p-6 rounded-2xl border-2 flex items-center space-x-4 shadow-lg ${banner.bg} ${banner.border}`}>
                    <div className={`${banner.text} drop-shadow-[0_0_10px_currentColor]`}>{banner.icon}</div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-black tracking-tighter ${banner.text}`}>{banner.label}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Verification ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Forensic Certainty</span>
                        <div className={`text-sm font-black uppercase tracking-widest ${
                          result.confidence === 0 ? 'text-red-500' :
                          result.confidence <= 40 ? 'text-red-400' :
                          result.confidence <= 70 ? 'text-amber-400' :
                          result.confidence <= 90 ? 'text-blue-400' : 'text-emerald-400'
                        }`}>
                          {result.confidence === 0 ? 'ANALYSIS FAILED' :
                           result.confidence <= 40 ? 'LOW CONFIDENCE' :
                           result.confidence <= 70 ? 'MEDIUM CONFIDENCE' :
                           result.confidence <= 90 ? 'HIGH CONFIDENCE' : 'VERY HIGH CONFIDENCE'}
                        </div>
                      </div>
                      <span className="text-2xl font-black font-mono tracking-tighter text-white">{result.confidence}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          result.confidence === 0 ? 'bg-red-600' :
                          result.confidence <= 40 ? 'bg-red-500' :
                          result.confidence <= 70 ? 'bg-amber-500' :
                          result.confidence <= 90 ? 'bg-blue-500' : 'bg-emerald-500'
                        } shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                      />
                    </div>
                  </div>

                  {/* Manipulation Alert */}
                  {result.image_manipulation_detected && (
                    <div className="p-5 rounded-2xl bg-red-600/10 border border-red-600/30 space-y-2 animate-pulse">
                      <div className="flex items-center space-x-2 text-red-600">
                        <Microscope className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">🔬 Image Manipulation Detected</span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-300 leading-relaxed pl-7 border-l border-red-600/20">
                        {result.image_manipulation_details}
                      </p>
                    </div>
                  )}

                  {/* Mismatch Table */}
                  {result.mismatches?.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-amber-500">
                        <Scale className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">⚠️ {result.mismatches.length} Field Discrepancies Found</span>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        <table className="w-full text-[10px] text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 font-black text-gray-500 uppercase tracking-widest">
                              <th className="px-4 py-3">Field</th>
                              <th className="px-4 py-3">Source</th>
                              <th className="px-4 py-3">Evidence</th>
                              <th className="px-4 py-3">Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {result.mismatches.map((m, idx) => (
                              <tr key={idx} className={`transition-colors ${
                                m.severity === 'HIGH' ? 'bg-red-500/5 hover:bg-red-500/10' : 
                                m.severity === 'MEDIUM' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-white/5'
                              }`}>
                                <td className="px-4 py-4 font-black text-gray-300 uppercase tracking-tighter">{m.field}</td>
                                <td className="px-4 py-4 font-mono text-emerald-500/80">{m.original_value}</td>
                                <td className="px-4 py-4 font-mono text-red-500/80">{m.customer_value}</td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                                    m.severity === 'HIGH' ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 
                                    'bg-amber-600 text-white shadow-[0_0_8px_rgba(217,119,6,0.4)]'
                                  }`}>{m.severity}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Matching Fields */}
                  {result.matching_fields?.length > 0 && result.verdict === "RECEIPTS MATCH" && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">✅ {result.matching_fields.length} Fields Verified Matching</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.matching_fields.map((f, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Fingerprint className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">🤖 AI Forensic Analysis</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed text-gray-400 border-l-4 border-l-accent">
                      {result.summary}
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className={`p-6 rounded-2xl border-2 ${
                    result.verdict === "RECEIPTS MATCH" && result.confidence >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${
                        result.verdict === "RECEIPTS MATCH" && result.confidence >= 70 ? 'text-emerald-500' : 'text-red-500'
                      }`}>Recommended Action</span>
                      <div className={`p-1.5 rounded-lg ${result.verdict === "RECEIPTS MATCH" && result.confidence >= 70 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {result.verdict === "RECEIPTS MATCH" && result.confidence >= 70 ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                    <p className="text-[12px] font-mono text-white leading-relaxed">
                      {result.recommended_action}
                    </p>
                    {(result.tampering_detected || result.confidence === 0 || result.success === false) && (
                      <div className="mt-4 pt-4 border-t border-red-500/20 flex items-center space-x-2 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">⚠️ Do NOT process this refund until manually verified.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center bg-white/[0.01]">
                    <Search className="w-10 h-10 text-gray-700 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-xs uppercase tracking-[0.4em] text-gray-500">System Standby</p>
                    <p className="text-[10px] font-mono text-gray-600 max-w-[250px] leading-relaxed">
                      Please upload the retailer original and customer evidence to initiate deep vision forensic comparison.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
