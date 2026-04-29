import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  Plus, 
  X, 
  Search, 
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react'
import ScoreMeter from '../components/ResultDisplay' // Reusing some styles if possible, but implementing custom ones below

const PAYMENT_OPTIONS = [
  "Cash on Delivery (COD)",
  "UPI (PhonePe / GPay / Paytm)",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Amazon Pay / Flipkart Pay Later / Wallet"
];

const REASON_OPTIONS = [
  "Item not received",
  "Item is defective / does not work",
  "Item damaged on arrival",
  "Wrong item delivered",
  "Item not as described",
  "Changed my mind / No longer needed",
  "Found better price elsewhere",
  "Ordered by mistake"
];

export default function ReturnRing() {
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    return_count_7days: '',
    normal_return_rate: '',
    pincodes: [],
    timestamps: ['', ''],
    payment_methods: [],
    return_reasons: []
  });

  const [pincodeInput, setPincodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePincodeAdd = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && pincodeInput.length === 6) {
      e.preventDefault();
      setFormData({ ...formData, pincodes: [...formData.pincodes, pincodeInput] });
      setPincodeInput('');
    }
  };

  const removePincode = (index) => {
    setFormData({ ...formData, pincodes: formData.pincodes.filter((_, i) => i !== index) });
  };

  const updateTimestamp = (index, val) => {
    const newTs = [...formData.timestamps];
    newTs[index] = val;
    setFormData({ ...formData, timestamps: newTs });
  };

  const addTimestamp = () => {
    if (formData.timestamps.length < 20) {
      setFormData({ ...formData, timestamps: [...formData.timestamps, ''] });
    }
  };

  const removeTimestamp = (index) => {
    const newTs = formData.timestamps.filter((_, i) => i !== index);
    setFormData({ ...formData, timestamps: newTs });
  };

  const handleCheckbox = (field, val) => {
    const current = [...formData[field]];
    if (current.includes(val)) {
      setFormData({ ...formData, [field]: current.filter(x => x !== val) });
    } else {
      setFormData({ ...formData, [field]: [...current, val] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.pincodes.length < 2) return alert("Please enter at least 2 pincodes");
    if (formData.timestamps.filter(t => t).length < 2) return alert("Please enter at least 2 return timestamps");

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/return-ring', {
        ...formData,
        timestamps: formData.timestamps.filter(t => t)
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error detecting return ring.");
    } finally {
      setLoading(false);
    }
  };

  // Live Pincode Analysis
  const pincodeCounts = formData.pincodes.reduce((acc, p) => {
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  // Live Timing Analysis
  const validTimes = formData.timestamps.filter(t => t).map(t => new Date(t)).sort((a, b) => a - b);
  const timeDiffHours = validTimes.length >= 2 
    ? (validTimes[validTimes.length - 1] - validTimes[0]) / (1000 * 60 * 60)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Return Ring Detector</h1>
        <p className="text-gray-400">Detect coordinated refund fraud using only your seller dashboard data — no customer personal info needed</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-start space-x-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-blue-100/80 leading-relaxed">
            A <strong>Return Ring</strong> is when a group of people use multiple fake accounts to claim refunds on the same product at the same time. Each claim looks genuine alone — but together they show a pattern. Enter details about the suspicious product and its return pattern below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM LEFT */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: Product */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent" />
                The Product Being Targeted
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Product Name or SKU</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. boAt Rockerz 450"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Product Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="1499"
                      value={formData.product_price}
                      onChange={(e) => setFormData({...formData, product_price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Rings target products above ₹500</p>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Returns (Last 7 Days)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="6"
                      value={formData.return_count_7days}
                      onChange={(e) => setFormData({...formData, return_count_7days: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Normal Weekly Return Rate</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="1"
                    value={formData.normal_return_rate}
                    onChange={(e) => setFormData({...formData, normal_return_rate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Check your average returns per week from analytics</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Pincodes */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-accent" />
                Where are the returns coming from?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Delivery Pincodes</label>
                  <div className="flex flex-wrap gap-2 mb-3 bg-white/5 border border-white/10 p-2 rounded-lg min-h-[44px]">
                    {formData.pincodes.map((p, idx) => (
                      <span key={idx} className="flex items-center bg-accent/20 text-accent border border-accent/30 rounded-md px-2 py-1 text-xs font-mono">
                        {p}
                        <button type="button" onClick={() => removePincode(idx)} className="ml-2 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      maxLength="6"
                      placeholder={formData.pincodes.length === 0 ? "Type 6-digit pincode and Enter" : ""}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={handlePincodeAdd}
                      className="bg-transparent border-none outline-none text-white text-xs flex-1 min-w-[120px]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>{formData.pincodes.length} pincodes entered</span>
                    <span>Enter at least 2</span>
                  </div>
                </div>

                {/* Live Warning */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(pincodeCounts).map(([p, count]) => {
                    if (count >= 3) return <div key={p} className="bg-red-500/10 text-red-500 border border-red-500/30 rounded-full px-3 py-1 text-[10px] font-bold">🚨 Pincode {p} appears {count} times — HIGH RISK</div>
                    if (count >= 2) return <div key={p} className="bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full px-3 py-1 text-[10px] font-bold">⚠️ Pincode {p} appears {count} times</div>
                    return null;
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: Timestamps */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-accent" />
                When did the returns arrive?
              </h2>
              <div className="space-y-3">
                {formData.timestamps.map((ts, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input 
                      type="datetime-local" 
                      required 
                      value={ts}
                      onChange={(e) => updateTimestamp(idx, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors text-xs"
                    />
                    {idx >= 2 && (
                      <button type="button" onClick={() => removeTimestamp(idx)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addTimestamp} 
                  className="w-full py-2 border border-dashed border-white/10 rounded-lg text-gray-500 hover:text-accent hover:border-accent/50 transition-colors text-xs flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Return Timestamp
                </button>

                {validTimes.length >= 2 && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-1">
                    <div className="text-[10px] text-gray-500 font-mono">⏱ Earliest: {validTimes[0].toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 font-mono">⏱ Latest: {validTimes[validTimes.length-1].toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-accent font-mono uppercase tracking-tighter">
                      ⏱ Total window: {timeDiffHours < 24 ? `${timeDiffHours.toFixed(1)} hours` : `${(timeDiffHours/24).toFixed(1)} days`}
                    </div>
                    {timeDiffHours <= 48 && (
                      <div className="text-[10px] text-amber-500 font-bold flex items-center mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" /> All returns filed within 48 hours — suspicious burst detected
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Payment & Reason */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-accent" />
                Payment & Return Reason Pattern
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-3">Payment methods used</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PAYMENT_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-start space-x-3 cursor-pointer group">
                        <div 
                          onClick={() => handleCheckbox('payment_methods', opt)}
                          className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.payment_methods.includes(opt) ? 'bg-accent border-accent' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}
                        >
                          {formData.payment_methods.includes(opt) && <CheckCircle className="w-3 h-3 text-background" />}
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-3">Return reason(s) given</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {REASON_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-start space-x-3 cursor-pointer group">
                        <div 
                          onClick={() => handleCheckbox('return_reasons', opt)}
                          className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.return_reasons.includes(opt) ? 'bg-accent border-accent' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}
                        >
                          {formData.return_reasons.includes(opt) && <CheckCircle className="w-3 h-3 text-background" />}
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || formData.pincodes.length < 2 || formData.timestamps.filter(t => t).length < 2}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm shadow-xl transition-all ${loading ? 'bg-white/10 text-gray-500' : 'bg-accent text-background hover:scale-[1.01] hover:shadow-accent/30'}`}
            >
              {loading ? 'Analyzing Data Patterns...' : '🕵️ Detect Return Ring'}
            </button>
          </form>
        </div>

        {/* RESULT RIGHT */}
        <div className="space-y-6 lg:sticky lg:top-8 self-start">
          <AnimatePresence mode="wait">
            {!result && !loading ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Search className="w-8 h-8 text-gray-700" />
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Waiting for Analysis</p>
                  <p className="text-[10px] text-gray-600 font-mono max-w-[200px]">Enter product data and suspicious return patterns to detect coordinated fraud groups.</p>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-surface border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-accent font-bold uppercase tracking-widest text-xs animate-pulse">Running Ring Detection...</p>
                  <p className="text-[10px] text-gray-500 font-mono">Cross-checking SKU velocity, geo-clustering, and timing bursts across {formData.pincodes.length} orders.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* VERDICT BANNER */}
                <div className={`rounded-2xl p-6 border-b-4 ${
                  result.risk === 'HIGH' ? 'bg-red-500/10 border-red-500' : 
                  result.risk === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500' : 
                  'bg-emerald-500/10 border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                      result.risk === 'HIGH' ? 'bg-red-500 text-white' : 
                      result.risk === 'MEDIUM' ? 'bg-amber-500 text-white' : 
                      'bg-emerald-500 text-white'
                    }`}>
                      {result.verdict}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">Case ID: FS-{Math.floor(Math.random()*10000)}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <motion.circle 
                          cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={251.2}
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * result.score) / 100 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={result.risk === 'HIGH' ? 'text-red-500' : result.risk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white">{result.score}</span>
                        <span className="text-[8px] text-gray-500 uppercase font-mono">Risk</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold mb-1 ${result.risk === 'HIGH' ? 'text-red-500' : result.risk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {result.risk} RISK PATTERN DETECTED
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        This score represents the aggregate probability of coordinated return fraud based on velocity, geography, and timing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SIGNAL BREAKDOWN */}
                <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 bg-white/5 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Pattern Signal Analysis
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/[0.02] text-gray-500 font-mono text-[9px] uppercase border-b border-white/5">
                          <th className="px-4 py-2">Signal</th>
                          <th className="px-4 py-2">Findings</th>
                          <th className="px-4 py-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.signals.map((s, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-bold text-gray-300">{s.signal}</td>
                            <td className="px-4 py-3 text-gray-400 text-[10px] leading-tight">{s.detail}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-mono font-bold ${
                                s.deduction >= 20 ? 'text-red-500' : 
                                s.deduction >= 10 ? 'text-amber-500' : 
                                s.deduction > 0 ? 'text-yellow-500' : 'text-gray-600'
                              }`}>
                                +{s.deduction}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PINCODE CLUSTER ANALYSIS */}
                {result.duplicate_pincodes?.length > 0 && (
                  <div className="bg-surface border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white flex items-center uppercase tracking-widest">
                      <MapPin className="w-4 h-4 mr-2 text-accent" />
                      Pincode Cluster Analysis
                    </h3>
                    <div className="space-y-3">
                      {result.duplicate_pincodes.map(p => (
                        <div key={p.pincode} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-gray-300">Pincode: {p.pincode}</span>
                            <span className="text-accent font-bold">{p.count} Orders</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(p.count / Math.max(...result.duplicate_pincodes.map(x=>x.count))) * 100}%` }}
                              className={`h-full ${p.count >= 3 ? 'bg-red-500' : 'bg-amber-500'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Info className="w-3 h-3 text-amber-500 mt-0.5" />
                        <p className="text-[10px] text-amber-500/80 leading-relaxed">
                          <strong>Tip:</strong> Search these pincodes on <strong>indiapost.gov.in</strong> to check if these addresses belong to the same apartment complex, street, or hosteling area.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIMELINE VIEW */}
                {result.score > 30 && (
                  <div className="bg-surface border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-white flex items-center uppercase tracking-widest">
                      <Clock className="w-4 h-4 mr-2 text-accent" />
                      Return Request Timeline
                    </h3>
                    <div className="relative pt-6 pb-2 px-2 overflow-x-auto">
                      <div className="min-w-[400px]">
                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-white/10" />
                        <div className="flex justify-between items-center relative">
                          {formData.timestamps.filter(t => t).sort((a,b) => new Date(a)-new Date(b)).map((ts, idx, arr) => {
                            const date = new Date(ts);
                            let gapColor = 'border-gray-700';
                            if (idx < arr.length - 1) {
                              const gap = (new Date(arr[idx+1]) - date) / (1000 * 60 * 60);
                              if (gap < 6) gapColor = 'border-red-500';
                              else if (gap < 24) gapColor = 'border-amber-500';
                            }

                            return (
                              <div key={idx} className="relative flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full bg-surface border-2 z-10 ${
                                  idx === 0 || idx === arr.length - 1 ? 'border-accent' : 'border-gray-500'
                                }`} />
                                <span className="text-[8px] font-mono text-gray-500 mt-2 absolute -bottom-4 whitespace-nowrap">
                                  {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[8px] font-mono text-gray-400 absolute -top-4">R#{idx+1}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono text-center italic mt-4">Burst detected across {result.timing_window_hours.toFixed(1)} hour window.</p>
                  </div>
                )}

                {/* AI ANALYSIS */}
                <div className="bg-surface border border-white/10 rounded-2xl p-5 bg-gradient-to-br from-white/[0.03] to-transparent">
                  <div className="flex items-center space-x-2 text-accent mb-3">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">🤖 AI Forensic Analysis</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-mono italic">
                    "{result.explanation}"
                  </p>
                </div>

                {/* ACTION CARD */}
                <div className="space-y-4">
                  <div className={`rounded-2xl p-5 border ${
                    result.risk === 'HIGH' ? 'bg-red-500/5 border-red-500/20' : 
                    result.risk === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' : 
                    'bg-emerald-500/5 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <ShieldAlert className={`w-5 h-5 ${result.risk === 'HIGH' ? 'text-red-500' : result.risk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${result.risk === 'HIGH' ? 'text-red-500' : result.risk === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {result.risk} RISK ACTION PROTOCOL
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      {result.recommended_action}
                    </p>

                    {result.risk === 'HIGH' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Amazon Platform</span>
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight">{result.platform_steps.amazon}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">Flipkart Platform</span>
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight">{result.platform_steps.flipkart}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">Other / Meesho</span>
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight">{result.platform_steps.other}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
