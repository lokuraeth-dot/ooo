
import React from 'react';
import { BlogIdea } from '../types';
import { TagIcon } from './IconComponents';

interface BlogIdeaCardProps {
  idea: BlogIdea;
}

const BlogIdeaCard: React.FC<BlogIdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg ring-1 ring-slate-700/50 hover:ring-sky-500 transition-all duration-300 flex flex-col h-full">
      <h3 className="text-xl font-bold text-sky-300 mb-3">{idea.title}</h3>
      <p className="text-slate-300 mb-4 flex-grow">{idea.summary}</p>
      <div className="mt-auto pt-4 border-t border-slate-700">
        <div className="flex items-center mb-2">
            <TagIcon className="w-5 h-5 text-slate-400 mr-2"/>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Keywords</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-sky-500/10 text-sky-300 text-xs font-medium px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogIdeaCard;
