import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import SimulationViewerContainer from '../../Pages/User/Simulations/SimulationViewerContainer';

/**
 * FullscreenSimulationModal
 * Uses React Portal to attach directly to document.body.
 * This guarantees the simulation takes over the ENTIRE device screen (100vw x 100vh),
 * completely covering all logos, dashboards, navbars, and lesson progress trackers.
 */
export default function FullscreenSimulationModal({
  simulation,
  isOpen,
  onClose,
  onTelemetry,
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle ESC key to exit
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !isMounted || !simulation || typeof document === 'undefined') {
    return null;
  }

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={simulation.title || 'Interactive Simulation'}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-slate-900/95 backdrop-blur-md overflow-y-auto overflow-x-hidden flex flex-col"
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <SimulationViewerContainer
          simulation={simulation}
          onTelemetry={onTelemetry}
          onClose={onClose}
          isFullscreenModal={true}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
