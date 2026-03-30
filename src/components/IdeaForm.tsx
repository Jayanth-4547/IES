import { useState } from 'react';
import { IdeaFormData } from '../types';
import { Zap, Upload, FileText } from 'lucide-react';

interface IdeaFormProps {
  onSubmit: (data: IdeaFormData) => void;
  isSubmitting: boolean;
}

export function IdeaForm({ onSubmit, isSubmitting }: IdeaFormProps) {
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [description, setDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    target_users: '',
    domain: '',
    tech_stack: '',
    timeline: '',
    budget: '',
    skill_match: '',
    primary_objective: '',
  });

  const handleExtractDetails = async (content: string) => {
    setIsExtracting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-details`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            description: inputMode === 'text' ? content : undefined,
            pdfContent: inputMode === 'pdf' ? content : undefined,
            llmProvider: 'groq',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to extract details');
      }

      const extracted = await response.json();
      setFormData({
        title: extracted.title,
        description: content,
        target_users: extracted.target_users,
        domain: extracted.domain,
        tech_stack: extracted.tech_stack,
        timeline: extracted.timeline,
        budget: extracted.budget,
        skill_match: extracted.skill_match,
        primary_objective: extracted.primary_objective,
      });
      setMode('detailed');
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Could not auto-extract details. Please fill in manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    try {
      let text = '';

      if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          let content = '';
          for (let i = 0; i < uint8Array.length; i++) {
            const byte = uint8Array[i];
            if (byte >= 32 && byte <= 126) {
              content += String.fromCharCode(byte);
            } else if (byte === 10 || byte === 13) {
              content += '\n';
            }
          }

          text = content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n')
            .substring(0, 5000);
        } catch {
          text = await file.text();
        }
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 10) {
        alert('Could not extract text from file. Please use a text file or paste directly.');
        return;
      }

      setFileName(file.name);
      await handleExtractDetails(text);
    } catch (error) {
      console.error('File read error:', error);
      alert('Could not read file. Please try a text file or paste directly.');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe your idea or upload a PDF');
      return;
    }
    handleExtractDetails(description);
  };

  const handleDetailedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (mode === 'quick') {
    return (
      <form onSubmit={handleQuickSubmit} className="space-y-6">
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => {
              setInputMode('text');
              setFileName('');
            }}
            className={`pb-2 px-2 font-medium text-sm transition-colors ${
              inputMode === 'text'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Text Description
          </button>
          <button
            type="button"
            onClick={() => setInputMode('pdf')}
            className={`pb-2 px-2 font-medium text-sm transition-colors ${
              inputMode === 'pdf'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upload PDF/File
          </button>
        </div>

        {inputMode === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Idea *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Just write what you're thinking. We'll automatically extract the details.
            </p>
            <textarea
              required={inputMode === 'text'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's your idea? What problem does it solve? Who would use it? What makes it interesting?"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Your Document *
            </label>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePdfUpload(file);
                  }
                }}
                className="hidden"
                disabled={isExtracting}
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                {fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, TXT, MD, or DOC files</p>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={isExtracting || !description.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isExtracting ? 'Extracting Details...' : 'Extract & Continue'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailedSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <Zap className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-700">
          Review and adjust the auto-extracted details, or submit as-is
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idea Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Target Users
          </label>
          <input
            type="text"
            value={formData.target_users}
            onChange={(e) => handleChange('target_users', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Domain
          </label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => handleChange('domain', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tech Stack
          </label>
          <input
            type="text"
            value={formData.tech_stack}
            onChange={(e) => handleChange('tech_stack', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Timeline
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => handleChange('timeline', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Budget
          </label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Primary Objective
          </label>
          <select
            value={formData.primary_objective}
            onChange={(e) => handleChange('primary_objective', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="career">Career</option>
            <option value="startup">Startup</option>
            <option value="phd">PhD</option>
            <option value="research">Research</option>
            <option value="learning">Learning</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Relevant Skills
        </label>
        <textarea
          value={formData.skill_match}
          onChange={(e) => handleChange('skill_match', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Optional: describe your skills"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setMode('quick');
            setDescription('');
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Analyzing...' : 'Analyze Idea'}
        </button>
      </div>
    </form>
  );
}
