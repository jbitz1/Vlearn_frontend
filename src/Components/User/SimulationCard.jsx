import React from 'react';
import { Play, BookOpen } from 'lucide-react';

export default function SimulationCard({ simulation, onLaunch }) {
  const { title, topic, subject, description } = simulation;

  return (
    <div
      className="relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 border bg-white border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-custom-orange/40"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-custom-blue border border-blue-100">
            <BookOpen className="w-3 h-3 mr-1" />
            {topic || subject}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Interactive Sim
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 text-gray-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
          {description || 'Interactive simulation model for visual concept mastery.'}
        </p>
      </div>

      {/* Footer / Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onLaunch(simulation)}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-custom-orange text-white font-medium text-sm shadow-md hover:bg-orange-600 transition-all cursor-pointer group"
        >
          <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
          Launch Simulation
        </button>
      </div>
    </div>
  );
}
