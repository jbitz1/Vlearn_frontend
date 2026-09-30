import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { normalizePhetUrl } from '../../../utils/phetUrlHelper';

/**
 * PhetSimulationRunner
 * 
 * Secure, responsive embed runner for official PhET HTML5 simulations.
 * Enforces sandboxing, full-screen permissions, loading state management,
 * and CC-BY 4.0 legal attribution.
 */
export default function PhetSimulationRunner({
  url,
  title = 'PhET Interactive Simulation',
  config = {},
  onTelemetry,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Strictly normalize & validate URL
  const targetUrl = normalizePhetUrl(url || config?.external_url || config?.url);

  useEffect(() => {
    setIsLoading(true);
  }, [targetUrl, reloadKey]);

  useEffect(() => {
    if (targetUrl && onTelemetry) {
      onTelemetry({
        event: 'phet_sim_mount',
        url: targetUrl,
        title,
      });
    }
  }, [targetUrl, title, onTelemetry]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    if (onTelemetry) {
      onTelemetry({
        event: 'phet_sim_loaded',
        url: targetUrl,
        title,
      });
    }
  };

  const handleReload = () => {
    setReloadKey((k) => k + 1);
  };

  if (!targetUrl) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-amber-50 border border-amber-200 rounded-3xl text-center text-amber-800">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-lg font-bold">Unsupported Simulation Source</h3>
        <p className="text-sm mt-1 text-amber-700">
          The requested simulation URL is not recognized as a supported PhET HTML5 simulation hosted under <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">phet.colorado.edu</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Simulation Stage Container */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] min-h-[500px] md:min-h-[600px] max-h-[85vh] bg-slate-950 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs text-white">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
            <p className="text-base font-semibold tracking-wide">Loading PhET Simulation...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to official PhET interactive HTML5 runner</p>
          </div>
        )}

        {/* Iframe Runner */}
        <iframe
          key={`${targetUrl}-${reloadKey}`}
          src={targetUrl}
          title={title || 'PhET Interactive Simulation'}
          className="w-full h-full border-0 block"
          allowFullScreen
          allow="fullscreen"
          scrolling="no"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          onLoad={handleIframeLoad}
        />

        {/* Top Control Bar Floating Actions */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            title="Reload simulation"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 backdrop-blur-md text-xs font-medium transition-colors cursor-pointer"
          >
            <span>PhET Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Attribution Banner */}
      <div className="w-full mt-3 px-2 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-1.5 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Simulation provided by{' '}
            <a
              href="https://phet.colorado.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 font-semibold underline decoration-amber-300 underline-offset-2"
            >
              PhET Interactive Simulations
            </a>
            , University of Colorado Boulder — Licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-800 underline underline-offset-2"
            >
              CC-BY 4.0
            </a>
          </span>
        </div>
        <div className="text-[11px] text-gray-400 font-mono shrink-0">
          Official HTML5 Embed
        </div>
      </div>
    </div>
  );
}
