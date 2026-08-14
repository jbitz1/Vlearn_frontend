import React from 'react';
import ReactPlayer from 'react-player';
import { Image as ImageIcon, PlayCircle, Video, Settings, Loader2, FlaskConical } from 'lucide-react';
import SimulationViewerContainer from '../../Pages/User/Simulations/SimulationViewerContainer';

export const ImagePlaceholderBlock = ({ block }) => {
    const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
    
    // If the image is resolved by editors
    if (content.resolved_image_url) {
        return (
            <div className="my-10 flex flex-col items-center">
                <figure className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl w-full hover:shadow-md transition-shadow">
                    <img src={content.resolved_image_url} alt={block.title} className="w-full h-auto object-cover rounded-xl" />
                    {block.title && <figcaption className="text-gray-500 mt-4 mb-2 text-sm text-center font-medium px-4">{block.title}</figcaption>}
                </figure>
            </div>
        );
    }
    
    // Fallback to placeholder
    return (
        <div className="my-10 bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center flex flex-col items-center">
            <ImageIcon className="text-slate-400 w-12 h-12 mb-3" />
            <h3 className="text-slate-700 font-bold mb-2">Image Placeholder: {block.title}</h3>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Description: {content.description}</p>
        </div>
    );
};

export const VideoRefBlock = ({ block }) => {
    const content = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
    
    return (
        <div className="my-12 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-bold text-white m-0 flex items-center gap-2">
                    <PlayCircle className="text-red-500 w-5 h-5 shrink-0" /> {block.title || 'Video Resource'}
                </h2>
                {content.learning_objective && (
                    <span className="text-slate-400 text-xs font-medium bg-slate-800 px-3 py-1.5 rounded-full border border-slate-600/50">
                        Objective: {content.learning_objective}
                    </span>
                )}
            </div>
            
            {content.resolved_video_id ? (
                <div className="aspect-video bg-black w-full relative">
                    <iframe 
                        className="w-full aspect-video h-auto"
                        src={`https://www.youtube.com/embed/${content.resolved_video_id}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            ) : (
                <div className="bg-slate-800/50 border-t border-slate-800 p-6 sm:p-12 md:p-16 flex flex-col items-center text-center">
                    <Video className="text-slate-500 w-12 h-12 mb-4 opacity-50" />
                    <p className="text-slate-400 font-medium">Video Placeholder</p>
                    <p className="text-slate-500 text-sm mt-2">Waiting for video resource to be attached.</p>
                </div>
            )}
        </div>
    );
};

export const SimulationPlaceholderBlock = ({ block }) => {
    const content = typeof block.content === 'string' ? (tryJsonParse(block.content)) : block.content || {};
    const metadata = block.metadata || {};

    const simKey = metadata.simulation_key || content.simulation_key || 'charles_law';
    const archetype = metadata.archetype || content.archetype || simKey;
    const config = metadata.config || content.config || {
        context_spec: metadata.context_spec || content.context_spec || {}
    };

    const simObject = {
        title: block.title || 'Interactive Simulation',
        key: simKey,
        archetype: archetype,
        subject: metadata.subject || 'CHEMISTRY',
        topic: metadata.concept_group || 'Interactive Simulation',
        config: config
    };

    return (
        <div className="my-10">
            <SimulationViewerContainer simulation={simObject} />
        </div>
    );
};

function tryJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return { simulation_objective: str };
    }
}
