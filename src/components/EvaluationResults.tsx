import { Evaluation, DimensionScore, DIMENSION_LABELS } from '../types';
import { CheckCircle, XCircle, PauseCircle, AlertCircle } from 'lucide-react';

interface EvaluationResultsProps {
  evaluation: Evaluation;
  dimensionScores: DimensionScore[];
}

export function EvaluationResults({ evaluation, dimensionScores }: EvaluationResultsProps) {
  const getVerdictIcon = () => {
    switch (evaluation.verdict) {
      case 'pursue':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'park':
        return <PauseCircle className="w-8 h-8 text-yellow-500" />;
      case 'drop':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'research_more':
        return <AlertCircle className="w-8 h-8 text-blue-500" />;
    }
  };

  const getVerdictColor = () => {
    switch (evaluation.verdict) {
      case 'pursue':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'park':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'drop':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'research_more':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <div className={`border-2 rounded-lg p-6 ${getVerdictColor()}`}>
        <div className="flex items-center gap-4 mb-4">
          {getVerdictIcon()}
          <div>
            <h2 className="text-2xl font-bold capitalize">
              {evaluation.verdict.replace('_', ' ')}
            </h2>
            <p className="text-lg">
              Overall Score: <span className="font-bold">{evaluation.overall_score.toFixed(1)}/10</span>
            </p>
          </div>
        </div>

        {evaluation.pathway && (
          <div className="mt-4">
            <p className="font-medium">Recommended Pathway:</p>
            <p className="text-lg capitalize">{evaluation.pathway}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4">Overall Analysis</h3>
        <p className="text-gray-700 whitespace-pre-line">{evaluation.reasoning}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6">Dimension Scores</h3>
        <div className="space-y-6">
          {dimensionScores.map((ds) => (
            <div key={ds.dimension_name} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">
                  {DIMENSION_LABELS[ds.dimension_name]}
                </h4>
                <span className={`text-lg font-bold ${getScoreColor(ds.score)}`}>
                  {ds.score.toFixed(1)}/10
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full ${getScoreBarColor(ds.score)}`}
                  style={{ width: `${(ds.score / 10) * 100}%` }}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Reasoning: </span>
                  <span className="text-gray-600">{ds.reasoning}</span>
                </div>

                {ds.evidence && (
                  <div>
                    <span className="font-medium text-gray-700">Evidence: </span>
                    <span className="text-gray-600">{ds.evidence}</span>
                  </div>
                )}

                {ds.assumptions && (
                  <div>
                    <span className="font-medium text-gray-700">Assumptions: </span>
                    <span className="text-gray-600">{ds.assumptions}</span>
                  </div>
                )}

                {ds.uncertainties && (
                  <div>
                    <span className="font-medium text-gray-700">Uncertainties: </span>
                    <span className="text-gray-600">{ds.uncertainties}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {evaluation.action_plan && evaluation.action_plan.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">90-Day Action Plan</h3>
          <div className="space-y-4">
            {evaluation.action_plan.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Day {item.day}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.action}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.risk_map && evaluation.risk_map.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            {evaluation.risk_map.map((risk, idx) => (
              <div key={idx} className="border-l-4 border-gray-300 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900 capitalize">{risk.category}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      risk.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : risk.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Mitigation: </span>
                  {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.skill_gaps && evaluation.skill_gaps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Skill Gaps</h3>
          <div className="flex flex-wrap gap-2">
            {evaluation.skill_gaps.map((skill, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {evaluation.extracted_features && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Extracted Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluation.extracted_features.required_skills && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {evaluation.extracted_features.required_skills.map((skill: string, idx: number) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.extracted_features.required_resources && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Resources</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {evaluation.extracted_features.required_resources.map((resource: string, idx: number) => (
                    <li key={idx}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.extracted_features.dependencies && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {evaluation.extracted_features.dependencies.map((dep: string, idx: number) => (
                    <li key={idx}>{dep}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.extracted_features.technical_unknowns && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Unknowns</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {evaluation.extracted_features.technical_unknowns.map((unknown: string, idx: number) => (
                    <li key={idx}>{unknown}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {evaluation.comparable_products && evaluation.comparable_products.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Comparable Products</h3>
          <div className="flex flex-wrap gap-2">
            {evaluation.comparable_products.map((product, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
