import { Idea } from '../types';
import { Calendar, TrendingUp, ChevronRight } from 'lucide-react';

interface IdeasListProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
}

export function IdeasList({ ideas, onSelectIdea }: IdeasListProps) {
  const getVerdictColor = (verdict: string | undefined) => {
    switch (verdict) {
      case 'pursue':
        return 'bg-green-100 text-green-800';
      case 'park':
        return 'bg-yellow-100 text-yellow-800';
      case 'drop':
        return 'bg-red-100 text-red-800';
      case 'research_more':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No ideas yet. Submit your first idea to get started.</p>
        </div>
      ) : (
        ideas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => onSelectIdea(idea)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {idea.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {idea.description}
                </p>

                <div className="flex flex-wrap gap-3 text-sm">
                  {idea.domain && (
                    <span className="text-gray-500">
                      {idea.domain}
                    </span>
                  )}
                  {idea.primary_objective && (
                    <span className="text-gray-500 capitalize">
                      {idea.primary_objective}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>

                  {idea.evaluation && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Score: {idea.evaluation.overall_score.toFixed(1)}/10
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end gap-2">
                {idea.evaluation && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getVerdictColor(
                      idea.evaluation.verdict
                    )}`}
                  >
                    {idea.evaluation.verdict.replace('_', ' ')}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
