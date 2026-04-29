import { useState, useRef } from 'react'
import axios from 'axios'
import { FileText, Upload, CheckCircle, AlertTriangle, Search, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReceiptFraud() {
  const [formData, setFormData] = useState({ order_amount: '' })
  const [files, setFiles] = useState({ orig: null, cust: null })
  const [previews, setPreviews] = useState({ orig: null, cust: null })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

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
      const response = await axios.post('http://localhost:5000/api/receipt-fraud', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing receipts. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-surface/50 border border-white/5 rounded-xl px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/30 animate-pulse">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Receipt Fraud Detector</h1>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Module: AI Vision Scanner v3.0</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">AI Core Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Input Panel */}
        <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center space-x-3">
                <Search className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold uppercase tracking-widest">Input Analysis Parameters</span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                {/* Upload Zones */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Retailer Original</label>
                        <label className={`relative group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${files.orig ? 'border-accent bg-accent/5' : 'border-white/10 bg-white/5 hover:border-accent/50 hover:bg-white/10'}`}>
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange('orig', e.target.files[0])} />
                            {previews.orig ? (
                                <img src={previews.orig} className="absolute inset-0 w-full h-full object-contain p-2 rounded-xl" alt="Preview" />
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <Upload className={`w-8 h-8 mb-2 ${files.orig ? 'text-accent' : 'text-gray-500'}`} />
                                    <span className="text-[10px] font-mono text-gray-400 uppercase text-center px-4">
                                        {files.orig ? files.orig.name : 'Upload Original'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-accent/20 text-accent text-[8px] px-2 py-0.5 rounded border border-accent/30 font-bold uppercase">Source</div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Customer Claimed</label>
                        <label className={`relative group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${files.cust ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-white/10'}`}>
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange('cust', e.target.files[0])} />
                            {previews.cust ? (
                                <img src={previews.cust} className="absolute inset-0 w-full h-full object-contain p-2 rounded-xl" alt="Preview" />
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <Upload className={`w-8 h-8 mb-2 ${files.cust ? 'text-amber-500' : 'text-gray-500'}`} />
                                    <span className="text-[10px] font-mono text-gray-400 uppercase text-center px-4">
                                        {files.cust ? files.cust.name : 'Upload Claim'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-500 text-[8px] px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase">Claim</div>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Expected Order Amount (₹)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">₹</div>
                        <input 
                            type="number" 
                            required 
                            value={formData.order_amount} 
                            onChange={(e) => setFormData({order_amount: e.target.value})} 
                            placeholder="e.g. 256.00"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent transition-all font-mono" 
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || !files.orig || !files.cust} 
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all shadow-lg ${loading ? 'bg-white/10 text-gray-500 cursor-wait' : 'bg-accent text-background hover:scale-[1.01] hover:shadow-accent/20'}`}
                >
                    {loading ? 'Performing AI Scan...' : 'Run Receipt Check'}
                </button>
                
                <p className="text-[10px] text-gray-500 font-mono text-center leading-relaxed px-4">
                    AI will perform pixel-level forensic analysis comparing the original invoice against the customer submission. Even 1% deviation in font or amount will be flagged.
                </p>
            </form>
        </div>

        {/* RIGHT: Result Panel */}
        <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold uppercase tracking-widest">Analysis Results</span>
            </div>

            <div className="flex-1 relative p-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10 space-y-6"
                        >
                            <div className="relative w-48 h-28 border border-white/10 rounded-lg overflow-hidden bg-white/5">
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_15px_rgba(0,200,255,0.8)] z-20"
                                />
                                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#0a0b0d_70%)]" />
                                <div className="p-4 space-y-2 opacity-30">
                                    <div className="h-1 w-3/4 bg-gray-500 rounded" />
                                    <div className="h-1 w-1/2 bg-gray-500 rounded" />
                                    <div className="h-1 w-2/3 bg-gray-500 rounded" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-accent font-mono text-xs font-bold animate-pulse tracking-widest">CLAUDE AI IS SCANNING...</p>
                                <p className="text-[10px] text-gray-500 font-mono max-w-[200px] mx-auto leading-relaxed">
                                    Checking font consistency, pixel noise, and amount alignment
                                </p>
                            </div>
                        </motion.div>
                    ) : result ? (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 h-full"
                        >
                            <div className={`p-5 rounded-xl border flex items-center space-x-4 ${result.tampering_detected ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                {result.tampering_detected ? (
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                ) : (
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                )}
                                <div>
                                    <h3 className={`text-lg font-bold tracking-tight ${result.tampering_detected ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {result.tampering_detected ? '🚫 TAMPERING DETECTED' : '✅ RECEIPTS MATCH'}
                                    </h3>
                                    <p className="text-[10px] font-mono text-gray-400 uppercase">Confidence Level: {result.confidence}%</p>
                                </div>
                            </div>

                            {/* Confidence Bar */}
                            <div className="space-y-2 px-1">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>AI Confidence Score</span>
                                    <span className={result.confidence > 70 ? 'text-emerald-500' : 'text-amber-500'}>{result.confidence}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.confidence}%` }}
                                        className={`h-full ${result.tampering_detected ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                    />
                                </div>
                            </div>

                            {result.tampering_detected && result.mismatches?.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest after:flex-1 after:h-[1px] after:bg-white/5">
                                        <span>Found {result.mismatches.length} Mismatches</span>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                        <table className="w-full text-[11px] text-left">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/5 font-mono text-gray-500">
                                                    <th className="px-3 py-2">Field</th>
                                                    <th className="px-3 py-2">Original</th>
                                                    <th className="px-3 py-2">Claim</th>
                                                    <th className="px-3 py-2 text-right">Severity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {result.mismatches.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors font-mono">
                                                        <td className="px-3 py-2.5 font-bold text-gray-300">{m.field}</td>
                                                        <td className="px-3 py-2.5 text-emerald-500/80">{m.original_value}</td>
                                                        <td className="px-3 py-2.5 text-red-500/80">{m.customer_value}</td>
                                                        <td className="px-3 py-2.5 text-right">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                                m.severity === 'HIGH' || m.severity === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                                                                'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                                                            }`}>{m.severity}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Analysis Summary</div>
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5 font-mono text-[11px] leading-relaxed text-gray-400">
                                    {result.summary}
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${result.tampering_detected ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${result.tampering_detected ? 'text-red-500' : 'text-emerald-500'}`}>Recommended Action</div>
                                <p className="text-[11px] font-mono text-gray-400">{result.recommended_action || (result.tampering_detected ? 'Decline return immediately.' : 'Approve return.')}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-600">
                            <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-mono text-xs uppercase tracking-widest">Awaiting Input</p>
                                <p className="text-[10px] font-mono max-w-[200px] opacity-60">Upload both original and customer receipts to begin scan.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  )
}
