import { useState } from 'react'
import axios from 'axios'
import ResultDisplay from '../components/ResultDisplay'
import { PackageCheck } from 'lucide-react'

export default function FriendlyFraud() {
  const [formData, setFormData] = useState({
    delivery_timestamp: '',
    claim_timestamp: '',
    post_delivery_engagement: false,
    purchase_date: '',
    is_new_account: false,
    past_inr_claims: '',
    same_device_used: false
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/friendly-fraud`, formData)
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing friendly fraud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <PackageCheck className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold tracking-wide">Friendly Fraud Analyzer</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date</label>
              <input type="date" name="purchase_date" required value={formData.purchase_date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Past INR Claims</label>
              <input type="number" name="past_inr_claims" min="0" required value={formData.past_inr_claims} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Delivery Timestamp</label>
              <input type="datetime-local" name="delivery_timestamp" required value={formData.delivery_timestamp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Claim Timestamp</label>
              <input type="datetime-local" name="claim_timestamp" required value={formData.claim_timestamp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="post_delivery_engagement" checked={formData.post_delivery_engagement} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">Customer logged in/engaged AFTER delivery but BEFORE dispute</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="is_new_account" checked={formData.is_new_account} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">New Account (&lt; 30 days old)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="same_device_used" checked={formData.same_device_used} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">Dispute filed from same Device/IP as original order</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/80 text-background font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Calculate Risk Score'}
          </button>
        </form>
      </div>

      <div>
        {result && <ResultDisplay result={result} />}
      </div>
    </div>
  )
}
