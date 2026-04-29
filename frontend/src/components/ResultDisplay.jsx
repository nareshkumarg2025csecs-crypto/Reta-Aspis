import { motion } from 'framer-motion'
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'

export default function ResultDisplay({ result }) {
  if (!result) return null;

  const { score, riskLevel, penaltyBreakdown, recommendedAction, explanation } = result;

  const getRiskColor = (score) => {
    if (score <= 30) return '#10b981'; // Green
    if (score <= 70) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getRiskIcon = (level) => {
    if (level === 'LOW') return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
    if (level === 'MEDIUM') return <Shield className="w-6 h-6 text-amber-500" />;
    return <ShieldAlert className="w-6 h-6 text-red-500" />;
  };

  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold mb-2">Risk Assessment</h2>
          <div className="flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 border border-white/10 w-fit">
            {getRiskIcon(riskLevel)}
            <span className="font-semibold tracking-wide">
              {riskLevel === 'LOW' && '✅ LOW RISK — Auto Approve'}
              {riskLevel === 'MEDIUM' && '⚠️ MEDIUM RISK — Manual Review'}
              {riskLevel === 'HIGH' && '🚫 HIGH RISK — Decline / Escalate'}
            </span>
          </div>
        </div>

        {/* Circular Score Meter */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-white/10"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <motion.circle
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeWidth="8"
              strokeDasharray={283}
              strokeLinecap="round"
              stroke={getRiskColor(score)}
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3 font-semibold">Penalty Breakdown</h3>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-300">Check</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Result</th>
                  <th className="px-4 py-3 font-medium text-gray-300 text-right">Deduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {penaltyBreakdown?.length > 0 ? (
                  penaltyBreakdown.map((penalty, idx) => (
                    <tr key={idx} className="bg-white/[0.02] hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-300">{penalty.check}</td>
                      <td className="px-4 py-3 text-gray-400">{penalty.reason}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-400">-{penalty.points}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-gray-500 italic">No deductions applied</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Recommended Action</h3>
          <p className="text-gray-200">{recommendedAction}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Explanation</h3>
          <p className="text-gray-300 leading-relaxed text-sm bg-white/5 p-4 rounded-lg border border-white/5">
            {explanation || "Generating AI analysis..."}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
