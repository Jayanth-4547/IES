import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { IdeaForm } from './components/IdeaForm';
import { ProfileSelector } from './components/ProfileSelector';
import { EvaluationResults } from './components/EvaluationResults';
import { IdeasList } from './components/IdeasList';
import { ComparisonView } from './components/ComparisonView';
import { Idea, IdeaFormData, EvaluationProfile } from './types';
import { Lightbulb, ListChecks, GitCompare, Plus, Settings } from 'lucide-react';

type View = 'submit' | 'ideas' | 'settings';

function App() {
  const [view, setView] = useState<View>('submit');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<EvaluationProfile>({
    name: 'Default',
    priority_mode: 'balanced',
    risk_tolerance: 'medium',
    time_horizon: 'medium',
    dimension_weights: {
      technical_feasibility: 1.0,
      implementation_complexity: 1.0,
      time_to_mvp: 1.0,
      market_potential: 1.0,
      competition_saturation: 1.0,
      research_novelty: 1.0,
      scalability: 1.0,
      monetization_viability: 1.0,
      personal_fit: 1.0,
      regulatory_risk: 1.0,
      maintenance_burden: 1.0,
      failure_probability: 1.0,
      differentiation_strength: 1.0,
      learning_value: 1.0,
      long_term_optionality: 1.0,
    },
  });

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    const { data: ideasData, error } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading ideas:', error);
      return;
    }

    const ideasWithEvaluations = await Promise.all(
      ideasData.map(async (idea) => {
        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('idea_id', idea.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (evalData) {
          const { data: dimScores } = await supabase
            .from('dimension_scores')
            .select('*')
            .eq('evaluation_id', evalData.id);

          return {
            ...idea,
            evaluation: {
              ...evalData,
              dimension_scores: dimScores || [],
            },
          };
        }

        return idea;
      })
    );

    setIdeas(ideasWithEvaluations);
  };

  const handleSubmitIdea = async (ideaData: IdeaFormData) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-idea`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ideaData,
            profile,
            llmProvider: 'groq',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      await loadIdeas();
      setView('ideas');
    } catch (error: any) {
      console.error('Error analyzing idea:', error);
      alert(error.message || 'Failed to analyze idea. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectIdea = async (idea: Idea) => {
    if (!idea.evaluation) {
      const { data: evalData } = await supabase
        .from('evaluations')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (evalData) {
        const { data: dimScores } = await supabase
          .from('dimension_scores')
          .select('*')
          .eq('evaluation_id', evalData.id);

        setSelectedIdea({
          ...idea,
          evaluation: {
            ...evalData,
            dimension_scores: dimScores || [],
          },
        });
      } else {
        setSelectedIdea(idea);
      }
    } else {
      setSelectedIdea(idea);
    }
  };

  const toggleComparisonIdea = (ideaId: string) => {
    setComparisonIds((prev) =>
      prev.includes(ideaId)
        ? prev.filter((id) => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const comparisonIdeas = ideas.filter((idea) => comparisonIds.includes(idea.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Idea Intelligence System
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setView('submit');
                  setSelectedIdea(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'submit'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-5 h-5" />
                Submit
              </button>

              <button
                onClick={() => {
                  setView('ideas');
                  setSelectedIdea(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'ideas'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ListChecks className="w-5 h-5" />
                Ideas
              </button>

              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <GitCompare className="w-5 h-5" />
                Compare ({comparisonIds.length})
              </button>

              <button
                onClick={() => setView('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'submit' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Submit Your Idea
              </h2>
              <IdeaForm onSubmit={handleSubmitIdea} isSubmitting={isAnalyzing} />
            </div>
          </div>
        )}

        {view === 'ideas' && (
          <div>
            {selectedIdea ? (
              <div>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Ideas
                </button>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedIdea.title}
                      </h2>
                      <p className="text-gray-600">{selectedIdea.description}</p>
                    </div>
                    <button
                      onClick={() => toggleComparisonIdea(selectedIdea.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        comparisonIds.includes(selectedIdea.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {comparisonIds.includes(selectedIdea.id)
                        ? 'Remove from Compare'
                        : 'Add to Compare'}
                    </button>
                  </div>
                </div>

                {selectedIdea.evaluation && (
                  <EvaluationResults
                    evaluation={selectedIdea.evaluation}
                    dimensionScores={selectedIdea.evaluation.dimension_scores || []}
                  />
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Ideas</h2>
                </div>
                <IdeasList ideas={ideas} onSelectIdea={handleSelectIdea} />
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Evaluation Settings
              </h2>
              <ProfileSelector onProfileChange={setProfile} />
            </div>
          </div>
        )}
      </main>

      {showComparison && (
        <ComparisonView
          ideas={comparisonIdeas}
          onRemoveIdea={(ideaId) => toggleComparisonIdea(ideaId)}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

export default App;
