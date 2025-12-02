import React, { useState, useEffect, useMemo } from 'react';
import { BlogPost, ViewState } from './types';
import Editor from './components/Editor';
import IdeaGenerator from './components/IdeaGenerator';
import { 
  BookOpen, 
  PenTool, 
  Lightbulb, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  ChevronRight,
  Search
} from 'lucide-react';

const STORAGE_KEY = 'mindscape_posts';

const App: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.LIST);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load posts on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse posts", e);
      }
    } else {
        // Initial sample data
        const sample: BlogPost = {
            id: '1',
            title: 'Welcome to MindScape',
            content: 'This is your personal space to think, write, and learn. Click the "Edit" button or "Write" in the sidebar to start documenting your journey.',
            summary: 'A brief welcome note introducing the purpose of this application.',
            tags: ['Welcome', 'Guide'],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        setPosts([sample]);
    }
  }, []);

  // Save posts on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const handleSavePost = (post: BlogPost) => {
    setPosts(prev => {
      const index = prev.findIndex(p => p.id === post.id);
      if (index >= 0) {
        const newPosts = [...prev];
        newPosts[index] = post;
        return newPosts;
      }
      return [post, ...prev];
    });
    setView(ViewState.LIST);
    setCurrentPostId(null);
  };

  const handleDeletePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this note?")) {
        setPosts(prev => prev.filter(p => p.id !== id));
        if (currentPostId === id) {
            setView(ViewState.LIST);
            setCurrentPostId(null);
        }
    }
  };

  const handleEdit = (id: string) => {
    setCurrentPostId(id);
    setView(ViewState.EDIT);
  };

  const handleRead = (id: string) => {
    setCurrentPostId(id);
    setView(ViewState.READ);
  };

  const currentPost = useMemo(() => 
    posts.find(p => p.id === currentPostId), 
  [posts, currentPostId]);

  const filteredPosts = useMemo(() => {
      if (!searchQuery) return posts;
      const lowerQ = searchQuery.toLowerCase();
      return posts.filter(p => 
        p.title.toLowerCase().includes(lowerQ) || 
        p.tags.some(t => t.toLowerCase().includes(lowerQ))
      );
  }, [posts, searchQuery]);

  // --- Views ---

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-10 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white font-bold text-xl mb-1">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            M
          </div>
          MindScape
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Personal Knowledge Base</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button 
          onClick={() => { setView(ViewState.LIST); setCurrentPostId(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.LIST && !currentPostId ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
        >
          <BookOpen size={20} />
          <span>My Notes</span>
        </button>
        <button 
          onClick={() => { setView(ViewState.EDIT); setCurrentPostId(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.EDIT && !currentPostId ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
        >
          <PenTool size={20} />
          <span>Write</span>
        </button>
        <button 
          onClick={() => { setView(ViewState.IDEAS); setCurrentPostId(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === ViewState.IDEAS ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
        >
          <Lightbulb size={20} />
          <span>Brainstorm</span>
        </button>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="text-xs text-slate-500">
            {posts.length} Notes Captured
        </div>
      </div>
    </div>
  );

  const MobileHeader = () => (
     <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <span className="font-bold">MindScape</span>
        <div className="flex gap-4">
            <button onClick={() => setView(ViewState.LIST)}><BookOpen size={20}/></button>
            <button onClick={() => { setView(ViewState.EDIT); setCurrentPostId(null); }}><Plus size={20}/></button>
        </div>
     </div>
  );

  const PostListView = () => (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">My Notes</h1>
            <p className="text-slate-500 mt-1">Your collection of thoughts and learnings.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search notes..." 
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
                onClick={() => { setView(ViewState.EDIT); setCurrentPostId(null); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
                <Plus size={18} />
                <span className="hidden sm:inline">New Note</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400">No notes found. Start writing!</p>
            </div>
        ) : (
            filteredPosts.map(post => (
            <div 
                key={post.id} 
                onClick={() => handleRead(post.id)}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                            <Calendar size={12} />
                            {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-slate-600 line-clamp-2 mb-4">
                            {post.summary || post.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                    <Tag size={10} className="mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(post.id); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Edit"
                        >
                            <PenTool size={16} />
                        </button>
                         <button 
                            onClick={(e) => handleDeletePost(e, post.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  const PostReadView = () => {
    if (!currentPost) return null;
    return (
        <div className="max-w-4xl mx-auto animate-fade-in bg-white min-h-[80vh] rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 relative">
             <div className="absolute top-8 right-8 flex gap-2">
                <button 
                    onClick={() => handleEdit(currentPost.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <PenTool size={20} />
                </button>
                <button 
                    onClick={() => setView(ViewState.LIST)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{currentPost.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(currentPost.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <div className="flex gap-2">
                         {currentPost.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {currentPost.summary && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 text-indigo-900 italic rounded-r-lg">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-400 mb-1">AI Summary</h4>
                    {currentPost.summary}
                </div>
            )}

            <div className="prose prose-slate prose-lg max-w-none">
                {currentPost.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-slate-700 leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {view === ViewState.LIST && <PostListView />}
          {view === ViewState.EDIT && (
            <Editor 
                post={currentPost} 
                onSave={handleSavePost} 
                onCancel={() => setView(ViewState.LIST)} 
            />
          )}
          {view === ViewState.READ && <PostReadView />}
          {view === ViewState.IDEAS && <IdeaGenerator />}
        </main>
      </div>
    </div>
  );
};

export default App;