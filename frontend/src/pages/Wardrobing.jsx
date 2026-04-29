import { useState } from 'react'
import axios from 'axios'
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
      const response = await axios.post('http://localhost:5000/api/wardrobing', formData)
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
      <div>
        {result && <ResultDisplay result={result} />}
      </div>
    </div>
  )
}
