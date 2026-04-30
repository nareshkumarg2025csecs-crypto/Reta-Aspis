import { useState } from 'react'
import api from '../api'
import ResultDisplay from '../components/ResultDisplay'
import { Box } from 'lucide-react'

export default function INRAbuse() {
  const [formData, setFormData] = useState({
    carrier_delivered: false,
    gps_matches_address: false,
    claim_filed_hours_after_delivery: '',
    past_inr_claims: '',
    has_delivery_photo: false,
    has_signature: false,
    pincode_theft_risk: 'Medium'
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
      const response = await api.post('/inr-abuse', formData)
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing INR abuse.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <Box className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold tracking-wide">INR Abuse Analyzer</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Hours Since Delivery</label>
              <input type="number" name="claim_filed_hours_after_delivery" min="0" required value={formData.claim_filed_hours_after_delivery} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Past INR Claims (12mo)</label>
              <input type="number" name="past_inr_claims" min="0" required value={formData.past_inr_claims} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Neighborhood Theft Risk</label>
            <select name="pincode_theft_risk" value={formData.pincode_theft_risk} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Carrier Data</h3>
            
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="carrier_delivered" checked={formData.carrier_delivered} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">Carrier data shows "Delivered"</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="gps_matches_address" checked={formData.gps_matches_address} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">GPS coordinate matches delivery address</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="has_delivery_photo" checked={formData.has_delivery_photo} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">Carrier provided photo proof of delivery</span>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input type="checkbox" name="has_signature" checked={formData.has_signature} onChange={handleChange} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-gray-300">Signature obtained on delivery</span>
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
