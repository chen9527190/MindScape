import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { generateSummary, polishContent } from '../services/geminiService';
import { Save, Wand2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface EditorProps {
  post?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

const Editor: React.FC<EditorProps> = ({ post, onSave, onCancel }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags.join(', ') || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  // Auto-generate summary if not present, but for now we just save content
  const handleSave = async () => {
    let summary = post?.summary;
    
    // If it's a new post or content changed significantly, maybe suggest a summary?
    // For this MVP, we will try to generate a summary if one doesn't exist or if requested.
    // Here we just save the basic data.
    
    const newPost: BlogPost = {
      id: post?.id || crypto.randomUUID(),
      title,
      content,
      summary: summary || content.slice(0, 150) + '...',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: post?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (!post?.summary && content.length > 50) {
        setIsGenerating(true);
        const aiSummary = await generateSummary(content);
        newPost.summary = aiSummary;
        setIsGenerating(false);
    }

    onSave(newPost);
  };

  const handlePolish = async () => {
    if (!content) return;
    setIsPolishing(true);
    const polished = await polishContent(content);
    setContent(polished);
    setIsPolishing(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <div className="flex gap-2">
           <button
            onClick={handlePolish}
            disabled={isPolishing || !content}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {isPolishing ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
            AI Polish
          </button>
          <button
            onClick={handleSave}
            disabled={isGenerating || !title}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            {isGenerating ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 px-0 mb-6"
        />
        
        <div className="mb-6">
           <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)..."
            className="w-full text-sm text-slate-600 placeholder-slate-400 bg-slate-50 border-none rounded-md py-2 px-3 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="w-full h-[60vh] resize-none text-lg text-slate-700 leading-relaxed placeholder-slate-300 border-none focus:ring-0 px-0"
        />
      </div>
    </div>
  );
};

export default Editor;