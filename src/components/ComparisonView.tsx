import { Idea, DIMENSION_LABELS } from '../types';
import { X } from 'lucide-react';

interface ComparisonViewProps {
  ideas: Idea[];
  onRemoveIdea: (ideaId: string) => void;
  onClose: () => void;
}

export function ComparisonView({ ideas, onRemoveIdea, onClose }: ComparisonViewProps) {
  const getDimensionScore = (idea: Idea, dimensionName: string): number | null => {
    const dimensionScore = idea.evaluation?.dimension_scores?.find(
      (ds) => ds.dimension_name === dimensionName
    );
    return dimensionScore ? dimensionScore.score : null;
  };

  const allDimensions = Object.keys(DIMENSION_LABELS);

  const getBestScore = (dimensionName: string): number => {
    const scores = ideas
      .map((idea) => getDimensionScore(idea, dimensionName))
      .filter((score): score is number => score !== null);
    return scores.length > 0 ? Math.max(...scores) : 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Compare Ideas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {ideas.length < 2 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Select at least 2 ideas to compare</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 p-3 text-left font-semibold text-gray-900 border-b-2 border-gray-200 min-w-[200px]">
                      Metric
                    </th>
                    {ideas.map((idea) => (
                      <th
                        key={idea.id}
                        className="p-3 text-left font-semibold text-gray-900 border-b-2 border-gray-200 min-w-[200px]"
                      >
                        <div className="flex justify-between items-start">
                          <span className="line-clamp-2">{idea.title}</span>
                          <button
                            onClick={() => onRemoveIdea(idea.id)}
                            className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Overall Score
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3">
                        {idea.evaluation ? (
                          <span className="text-lg font-bold text-blue-600">
                            {idea.evaluation.overall_score.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Verdict
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3">
                        {idea.evaluation ? (
                          <span className="capitalize">
                            {idea.evaluation.verdict.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Pathway
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3">
                        {idea.evaluation?.pathway ? (
                          <span className="capitalize">{idea.evaluation.pathway}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-gray-50">
                    <td colSpan={ideas.length + 1} className="p-3 font-bold text-gray-900">
                      Dimension Scores
                    </td>
                  </tr>

                  {allDimensions.map((dimension) => {
                    const bestScore = getBestScore(dimension);
                    return (
                      <tr key={dimension} className="border-b border-gray-200">
                        <td className="sticky left-0 bg-white p-3 text-sm text-gray-700">
                          {DIMENSION_LABELS[dimension]}
                        </td>
                        {ideas.map((idea) => {
                          const score = getDimensionScore(idea, dimension);
                          const isBest = score === bestScore && score !== null && bestScore > 0;
                          return (
                            <td key={idea.id} className="p-3">
                              {score !== null ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium ${
                                      isBest ? 'text-green-600' : 'text-gray-700'
                                    }`}
                                  >
                                    {score.toFixed(1)}
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                    <div
                                      className={`h-2 rounded-full ${
                                        isBest ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${(score / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  <tr className="bg-gray-50">
                    <td colSpan={ideas.length + 1} className="p-3 font-bold text-gray-900">
                      Details
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Domain
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3 text-sm">
                        {idea.domain || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Timeline
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3 text-sm">
                        {idea.timeline || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="sticky left-0 bg-white p-3 font-medium text-gray-900">
                      Budget
                    </td>
                    {ideas.map((idea) => (
                      <td key={idea.id} className="p-3 text-sm">
                        {idea.budget || 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
