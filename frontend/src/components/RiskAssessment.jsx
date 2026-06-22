import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiExclamationCircle, HiCheckCircle, HiInformationCircle, HiSparkles, HiChartBar } from 'react-icons/hi';
import api from '../utils/api';

const riskColors = {
  none: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: HiCheckCircle },
  low: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: HiInformationCircle },
  medium: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', icon: HiExclamationCircle },
  high: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: HiExclamationCircle },
};

const featureLabels = {
  absence_rate: 'Absence Rate',
  max_consecutive_absences: 'Consecutive Absences',
  overall_attendance_rate: 'Overall Attendance',
  volatility: 'Attendance Volatility',
  unexcused_ratio: 'Unexcused Absences',
  trend_direction: 'Declining Trend',
  last_absence_recency: 'Recent Absence',
  recent_absence_rate: 'Recent Absence Rate',
  late_rate: 'Late Rate',
  total_sessions: 'Total Sessions',
};

export default function RiskAssessment({ studentId, courseId, compact = false }) {
  const [mlData, setMlData] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const [fallbackData, setFallbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !courseId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/attendance/ml-prediction/${studentId}/${courseId}`),
      api.get(`/attendance/insights/${studentId}/${courseId}`),
    ])
      .then(([mlRes, insightsRes]) => {
        setMlData(mlRes.data);
        setInsightData({
          riskAssessment: insightsRes.data.riskAssessment,
          ai: insightsRes.data.ai,
        });
      })
      .catch(() => {
        api.get(`/attendance/insights/${studentId}/${courseId}`)
          .then(({ data: result }) => {
            setFallbackData(result.riskAssessment);
            setInsightData({ riskAssessment: result.riskAssessment, ai: result.ai });
          })
          .catch((err2) => setError(err2.response?.data?.message || 'Failed to load risk assessment'));
      })
      .finally(() => setLoading(false));
  }, [studentId, courseId]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-red-400 text-sm">
        <HiExclamationCircle className="w-5 h-5 mb-1" />
        {error}
      </div>
    );
  }

  const source = mlData?.source || 'rules';
  const riskLevel = mlData?.riskLevel || fallbackData?.riskLevel || 'none';
  const riskScore = mlData?.riskScore ?? fallbackData?.riskScore ?? 0;
  const confidence = mlData?.confidence ?? null;
  const probabilities = mlData?.probabilities ?? null;
  const topFactors = mlData?.topFactors ?? [];
  const flags = (insightData?.riskAssessment?.flags || fallbackData?.flags || []);
  const summary = (insightData?.riskAssessment?.summary || fallbackData?.summary || '');
  const recommendation = (insightData?.riskAssessment?.recommendation || fallbackData?.recommendation || '');
  const insights = insightData?.ai?.fallback || null;

  const colors = riskColors[riskLevel] || riskColors.none;
  const Icon = colors.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-sm font-medium ${colors.text}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </span>
        <span className="text-xs text-surface-500 dark:text-surface-400">({riskScore}/100)</span>
        {source === 'ml' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">ML</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card border ${colors.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Risk Assessment</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">Attendance risk analysis</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${colors.text}`}>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </div>
          <div className="text-xs text-surface-500 dark:text-surface-400">Score: {riskScore}/100</div>
        </div>
      </div>

      {/* Risk Score Bar */}
      <div className="mb-4">
        <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              riskLevel === 'high' ? 'bg-red-500' :
              riskLevel === 'medium' ? 'bg-orange-500' :
              riskLevel === 'low' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          />
        </div>
      </div>

      {/* Source Badge */}
      <div className="flex items-center gap-2 mb-3">
        {source === 'ml' ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <HiChartBar className="w-3 h-3" />
            ML Model (Random Forest)
          </span>
        ) : source === 'rules' ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Rule-Based Fallback
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-surface-700 dark:text-surface-300 border border-slate-500/30">
            Insufficient Data
          </span>
        )}
        {confidence !== null && (
          <span className="text-xs text-surface-500 dark:text-surface-400">
            Confidence: {confidence}%
          </span>
        )}
      </div>

      {/* ML Probabilities */}
      {probabilities && (
        <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-2">Class Probabilities</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(probabilities).map(([level, prob]) => {
              const pct = (prob * 100).toFixed(1);
              const barColor = level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-orange-500' : level === 'low' ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={level} className="text-center">
                  <div className="text-xs text-surface-500 dark:text-surface-400 capitalize mb-1">{level}</div>
                  <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-surface-700 dark:text-surface-300">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Contributing Factors */}
      {topFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Top Contributing Factors</h4>
          <div className="flex flex-wrap gap-1">
            {topFactors.map((factor, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                {featureLabels[factor] || factor.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warning Flags */}
      {flags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Warning Flags</h4>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-300 dark:border-surface-600"
              >
                <HiExclamationCircle className="w-3 h-3 text-yellow-400" />
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary and Recommendation */}
      {(summary || recommendation) && (
        <div className="space-y-3 text-sm">
          {summary && (
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
              <p className="text-surface-700 dark:text-surface-300">{summary}</p>
            </div>
          )}
          {recommendation && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-300">
                <span className="font-medium">Recommendation:</span> {recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Insights Section */}
      {insights && (
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2 mb-3">
            <HiSparkles className="w-4 h-4 text-surface-500 dark:text-surface-400" />
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">Insights</h4>
          </div>

          <div className="space-y-2">
            {insights.insight && (
              <div className="p-2 rounded bg-surface-50 dark:bg-surface-800/30 border border-surface-200 dark:border-surface-700">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Observation</p>
                <p className="text-sm text-surface-800 dark:text-surface-200">{insights.insight}</p>
              </div>
            )}

            {insights.intervention && (
              <div className="p-2 rounded bg-purple-500/5 border border-purple-500/10">
                <p className="text-xs text-purple-400 mb-1">Suggested Intervention</p>
                <p className="text-sm text-purple-200">{insights.intervention}</p>
              </div>
            )}

            {insights.pattern && (
              <div className="p-2 rounded bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-400 mb-1">Pattern Detected</p>
                <p className="text-sm text-amber-200">{insights.pattern}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
