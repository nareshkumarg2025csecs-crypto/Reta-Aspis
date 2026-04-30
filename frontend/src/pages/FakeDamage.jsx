import { useState } from 'react'
import axios from 'axios'
import ResultDisplay from '../components/ResultDisplay'
import { Camera, Upload } from 'lucide-react'

export default function FakeDamage() {
  const [formData, setFormData] = useState({
    order_date: '',
    return_date: '',
    product_sku: '',
    damage_description: '',
    previous_damage_claims: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Please upload a damage photo")
      return
    }

    setLoading(true)
    setResult(null)
    
    const data = new FormData()
    data.append('damage_photo', file)
    Object.keys(formData).forEach(key => data.append(key, formData[key]))

    try {
      const response = await axios.post('http://localhost:5000/api/fake-damage', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
      alert("Error analyzing fake damage. Please check the backend connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center mb-6 border-b border-white/10 pb-4">
          <Camera className="w-6 h-6 text-accent mr-3" />
          <h2 className="text-xl font-bold tracking-wide">Fake Damage Analyzer</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Damage Photo Upload</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        {file && <p className="text-xs text-accent">{file.name}</p>}
                    </div>
                    <input type="file" name="damage_photo" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Order Date</label>
              <input type="date" name="order_date" required value={formData.order_date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Return Claim Date</label>
              <input type="date" name="return_date" required value={formData.return_date} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Product SKU / Type</label>
            <input type="text" name="product_sku" required value={formData.product_sku} onChange={handleChange} placeholder="e.g. Glass screen protector" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Damage Description (Customer Claim)</label>
            <textarea name="damage_description" required value={formData.damage_description} onChange={handleChange} placeholder="e.g. The screen arrived completely shattered" rows="2" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Previous Damage Claims (Last 6 Months)</label>
            <input type="number" name="previous_damage_claims" min="0" required value={formData.previous_damage_claims} onChange={handleChange} placeholder="e.g. 1" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent transition-colors" />
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
