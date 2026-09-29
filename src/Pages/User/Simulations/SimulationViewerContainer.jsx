import React, { useState, useRef, useEffect } from 'react';
import SimulationWidgetFactory from './SimulationWidgetFactory';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  Minimize2,
  X,
  Tv,
  Lightbulb,
  Compass,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import ReportVisualizationModal from '../../../Components/Common/ReportVisualizationModal';

/**
 * Fallback Context Guides for Simulations without explicitly loaded backend configs
 */
const DEFAULT_SIM_GUIDES = {
  crt: {
    overview: 'Observe how electric and magnetic fields steer high-speed electrons emitted by a heated cathode.',
    how_to_use: [
      'Click "1-Click Demo: Sine Wave" to observe how the X time-base and Y input voltages form a classic waveform.',
      'Adjust the Anode Accelerating Voltage (Va) slider to see electron beam speed change in real time.',
      'Switch between Sine, DC, and Square signal types to compare beam traces on the green phosphor graticule.',
      'Toggle the Time-Base generator switch to observe the horizontal sweep action versus a stationary vertical deflection line.',
    ],
    expected_results: [
      {
        action: 'Increasing Anode Voltage (Va)',
        expected_outcome: 'Higher electron velocity v = sqrt(2*e*Va/m), reducing transit time through Y-plates and decreasing deflection sensitivity.',
        key_takeaway: 'Higher accelerating voltage produces faster electrons and a brighter, stiffer beam requiring more voltage to deflect.',
      },
      {
        action: 'Turning Time-Base OFF',
        expected_outcome: 'The horizontal sweep halts, collapsing the wave into a single vertical line on the screen.',
        key_takeaway: 'The time-base applies a sawtooth sweep voltage that spreads the Y-signal across time (horizontal axis).',
      },
    ],
  },
  x_ray: {
    overview: 'Explore how high-velocity cathode electrons bombard a heavy metal target to produce penetrating X-ray photons.',
    how_to_use: [
      'Click "1-Click: Standard Medical Diagnostic" to auto-tune the filament current and high voltage.',
      'Use the Anode High Voltage (kV) slider to adjust penetrating power (Hardness) and minimum cutoff wavelength (λ_min).',
      'Use the Filament Heating Current (mA) slider to control electron flux and beam intensity (quantity of X-rays).',
      'Select different test specimens (Hand, Soft Tissue, Heavy Metal) to inspect radiographic contrast.',
    ],
    expected_results: [
      {
        action: 'Increasing High Voltage (kV)',
        expected_outcome: 'Produces harder, more penetrating X-rays with a shorter minimum wavelength (λ_min = hc/eVa).',
        key_takeaway: 'Quality (hardness/penetrating ability) depends strictly on accelerating voltage, NOT filament current.',
      },
      {
        action: 'Increasing Filament Current (mA)',
        expected_outcome: 'Heats cathode hotter, releasing more thermionic electrons per second, increasing X-ray intensity proportionally.',
        key_takeaway: 'Quantity (intensity/rate of photons) depends strictly on filament heating current, NOT accelerating voltage.',
      },
    ],
  },
  photoelectric: {
    overview: 'Investigate the quantum emission of electrons from metal surfaces illuminated by incident electromagnetic radiation.',
    how_to_use: [
      'Click "1-Click: Threshold Frequency Test" to automatically find the cutoff frequency f0 for the chosen metal.',
      'Select a target metal cathode (e.g. Zinc, Cesium, Sodium) to load its unique work function (Φ).',
      'Slide radiation frequency from Infrared to Ultraviolet to discover where photoelectrons begin ejecting.',
      'Adjust the Retarding Stopping Potential (Vs) until photocurrent drops to exactly zero to measure maximum kinetic energy (KE_max).',
    ],
    expected_results: [
      {
        action: 'Increasing Light Frequency (f > f0)',
        expected_outcome: 'Photoelectrons are ejected instantly with higher kinetic energy (KE_max = hf - Φ); stopping potential Vs increases linearly.',
        key_takeaway: 'Electron kinetic energy depends solely on light frequency, never on light brightness or intensity.',
      },
      {
        action: 'Increasing Brightness/Intensity at f < f0',
        expected_outcome: 'Even at 1000 W/m² intense red light, zero electrons are emitted.',
        key_takeaway: 'Light behaves as discrete energy packets (photons). A single photon must have energy E = hf >= Φ to liberate an electron.',
      },
    ],
  },
  nuclear_fission_chain_reaction: {
    overview: 'Witness nuclear fission of Uranium-235 and observe subcritical, critical, and supercritical chain reactions.',
    how_to_use: [
      'Click "1-Click: Critical Steady Power" to balance neutron generation and absorption in a stable equilibrium.',
      'Adjust the Boron/Cadmium Control Rod insertion depth slider to regulate neutron absorption.',
      'Press "Fire Thermal Neutron" to initiate fission of a U-235 nucleus.',
      'Observe the mass defect conversion to kinetic energy: E = Δm · c².',
    ],
    expected_results: [
      {
        action: 'Withdrawing Control Rods (Supercritical k > 1)',
        expected_outcome: 'Neutrons multiply exponentially: each fission produces 2 to 3 fast neutrons that trigger subsequent fissions.',
        key_takeaway: 'Uncontrolled chain reactions release explosive energy (atomic weapon); controlled reactions sustain steady power generation.',
      },
      {
        action: 'Inserting Control Rods Fully (Subcritical k < 1)',
        expected_outcome: 'Control rods absorb free neutrons, halting chain propagation and safely shutting down the reactor core.',
        key_takeaway: 'Cadmium and boron have high neutron capture cross-sections, allowing fine control of the multiplication factor k.',
      },
    ],
  },
  radioactive_decay_half_life: {
    overview: 'Model the spontaneous disintegration of unstable radionuclides and verify the exponential decay law N(t) = N0 · (1/2)^(t/T).',
    how_to_use: [
      'Click "1-Click: 3 Half-Lives Simulation" to run an automated decay sequence from 100% down to 12.5% parent nuclei.',
      'Select an isotope (e.g. Carbon-14, Iodine-131, Radon-222) to observe its characteristic half-life.',
      'Press Play/Pause to watch individual parent nuclei (blue) randomly decay into stable daughter nuclei (gold).',
      'Inspect the live exponential decay curve matching the count rate meter.',
    ],
    expected_results: [
      {
        action: 'Advancing Time by Exactly One Half-Life (t = T_half)',
        expected_outcome: 'Exactly half (50%) of the remaining parent nuclei decay, leaving N0/2 undecayed atoms.',
        key_takeaway: 'Half-life is constant and completely unaffected by chemical bonding, pressure, or temperature.',
      },
    ],
  },
  dna_replication_protein_synthesis_3d: {
    overview: 'Explore the 3D double helix, semi-conservative replication fork, mRNA transcription, and ribosomal translation.',
    how_to_use: [
      'Click "1-Click Full Synthesis Run" to view an automated demonstration from DNA unzipping to polypeptide chain elongation.',
      'In "3D Double Helix", drag your cursor to rotate the Watson-Crick B-DNA model 360 degrees and inspect complementary base pairing.',
      'In "Step 1: DNA Replication", advance the replication fork to examine continuous leading strand and Okazaki lagging strand synthesis.',
      'In "Genetic Code & Codon Chart", dial any 3-base triplet to view its corresponding amino acid, tRNA anticodon, and degeneracy.',
    ],
    expected_results: [
      {
        action: 'DNA Helicase Unwinding',
        expected_outcome: 'Breaks weak hydrogen bonds between purines and pyrimidines, creating a replication fork.',
        key_takeaway: 'Replication is semi-conservative: each daughter duplex contains one conserved parental strand and one new daughter strand.',
      },
      {
        action: 'Ribosomal Translation',
        expected_outcome: 'tRNA anticodons bind mRNA codons in the A-site; peptidyl transferase links amino acids with peptide bonds.',
        key_takeaway: 'Translation begins at the start codon AUG (Methionine) and terminates when encountering UAA, UAG, or UGA stop codons.',
      },
    ],
  },
  meiosis_genetic_variation: {
    overview: 'Explore meiotic reduction division (2n = 4 to n = 2), chiasmata crossing over, independent assortment, and gamete genetic variation.',
    how_to_use: [
      'Use the Stage Stepper to advance through Interphase, Prophase I, Metaphase I, Anaphase I, Telophase I, Meiosis II, and 4 Gametes.',
      'Toggle "Crossing Over [ON / OFF]" to observe the direct impact of chiasmata exchange on generating recombinant vs parental chromatids.',
      'In Metaphase I, flip the "Equator Orientation" to model Mendel’s Law of Independent Assortment.',
      'In Anaphase I, toggle "Simulate Non-Disjunction" to investigate the cytogenetic origin of aneuploidies like Down syndrome.',
      'Take the KCSE Exam Quiz to test your mastery of Form 4 genetics concepts.',
    ],
    expected_results: [
      {
        action: 'Crossing Over Active (Prophase I)',
        expected_outcome: 'Non-sister chromatids reciprocal exchange produces 4 genetically distinct haploid gametes (100% variation across 4 cells).',
        key_takeaway: 'Crossing over breaks linkage groups and creates novel recombinant allele combinations necessary for evolution and natural selection.',
      },
      {
        action: 'Crossing Over Switched OFF',
        expected_outcome: 'Only 2 parental genotype combinations are produced (duplicate clones).',
        key_takeaway: 'Without crossing over, genetic variation is strictly constrained to independent assortment of maternal and paternal chromosomes.',
      },
    ],
  },
  monohybrid_dihybrid_punnett_genetics: {
    overview: 'Investigate Mendelian inheritance laws through interactive 4-square and 16-square Punnett grids and test cross diagnostics.',
    how_to_use: [
      'In "Monohybrid Cross", pick parental alleles (TT, Tt, tt) for plant height or flower colour to observe gamete segregation and 3:1 F2 phenotypic ratios.',
      'In "Dihybrid Cross", explore simultaneous inheritance of seed shape (R/r) and cotyledon colour (Y/y) producing the classic 9:3:3:1 ratio.',
      'In "Test Cross Diagnostic", cross an unknown tall parent with a homozygous recessive tester (tt) to resolve its genotype.',
      'Complete the KCSE Exam Challenge questions to verify inheritance calculations.',
    ],
    expected_results: [
      {
        action: 'Crossing Heterozygotes (Tt x Tt)',
        expected_outcome: 'Yields a 3:1 phenotypic ratio (75% Tall, 25% Dwarf) and a 1:2:1 genotypic ratio (1 TT : 2 Tt : 1 tt).',
        key_takeaway: 'Alleles segregate equally during meiosis so that each haploid gamete carries only one allele per gene locus.',
      },
      {
        action: 'Backcrossing Heterozygous Parent (Tt x tt)',
        expected_outcome: 'Produces a 1:1 phenotypic ratio (50% Tall : 50% Dwarf).',
        key_takeaway: 'The appearance of recessive progeny in a test cross unequivocally proves the parent with dominant phenotype is heterozygous.',
      },
    ],
  },
  default: {
    overview: 'Engage with this interactive laboratory model to test physical and biological variables.',
    how_to_use: [
      'Use the 1-Click preset buttons at the top of the simulation to quickly test standard experimental setups.',
      'Adjust the interactive sliders to vary parameters and watch the live apparatus update in real time.',
      'Examine the live telemetry displays and meters to analyze the scientific relationships.',
      'Test your understanding by answering the interactive exam practice challenge at the bottom of the lab.',
    ],
    expected_results: [
      {
        action: 'Systematic Parameter Tuning',
        expected_outcome: 'The real-time visual canvas and quantitative meters reflect principles immediately.',
        key_takeaway: 'Compare simulation observations with theoretical models to master Form 4 syllabus concepts.',
      },
    ],
  },
};

/**
 * Top Header Navigation Bar
 */
function SimulationHeader({
  title,
  topic,
  subject,
  subjectDisplay,
  overview,
  isFullscreen,
  toggleFullscreen,
  onClose,
  isModal,
  onReportIssue,
}) {
  return (
    <header
      className={`w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
        isModal ? 'sticky top-0 z-30' : 'rounded-2xl sm:rounded-3xl border border-gray-200'
      }`}
    >
      {/* Title & Metadata */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-custom-blue/10 text-custom-blue border border-custom-blue/20">
            <BookOpen className="w-3.5 h-3.5 mr-1 shrink-0" />
            {topic || subjectDisplay || subject || 'Interactive Simulation'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0" />
            Interactive Lab Model
          </span>
        </div>

        <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
          {title || 'Interactive Simulation'}
        </h1>

        {overview && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 max-w-4xl">
            {overview}
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center shrink-0">
        {/* Report Issue Button */}
        {onReportIssue && (
          <button
            onClick={onReportIssue}
            title="Report Issue with this visualization"
            aria-label="Report Issue"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Report Issue</span>
          </button>
        )}

        {/* Projector / Screen Fullscreen Mode */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Projector / Fullscreen Mode'}
          aria-label="Projector Fullscreen Mode"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all cursor-pointer"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-custom-blue shrink-0" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Tv className="w-3.5 h-3.5 text-custom-blue shrink-0" />
              <span className="hidden sm:inline">Projector View</span>
            </>
          )}
        </button>

        {/* Exit Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Exit Simulation"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>Exit Simulation</span>
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Top Quick Student Guide Banner (Prominently displays 3 simple steps directly above simulation canvas)
 */
function TopQuickGuideBanner({ howToUse, overview }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stepsToShow = isExpanded ? howToUse : howToUse.slice(0, 3);

  return (
    <div className="w-full bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border border-sky-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-custom-blue text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
            Student Experiment Guide & Instructions
          </span>
        </div>
        {howToUse.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-custom-blue hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>View All Steps ({howToUse.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {overview && (
        <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed font-medium">
          {overview}
        </p>
      )}

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {stepsToShow.map((step, idx) => (
          <div
            key={idx}
            className="bg-white/90 backdrop-blur-xs border border-sky-100 rounded-xl p-3 shadow-2xs flex items-start gap-2.5"
          >
            <span className="w-5 h-5 rounded-lg bg-custom-blue text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              {idx + 1}
            </span>
            <p className="text-xs text-gray-800 leading-snug font-medium">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Companion Guide & Expected Outcomes Section (Rendered below the simulation stage)
 */
function SimulationGuideSection({ howToUse, expectedResults }) {
  if (howToUse.length === 0 && expectedResults.length === 0) return null;

  return (
    <section aria-label="Laboratory Guide and Expected Outcomes" className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
      {/* "How to Use" Step-by-Step Guide */}
      {howToUse.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 font-bold text-gray-900 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-sm sm:text-base">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-custom-orange shrink-0" />
            How to Use & Laboratory Protocol
          </div>
          <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
            {howToUse.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 rounded-xl sm:rounded-2xl border border-gray-100">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl bg-custom-orange/10 text-custom-orange font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expected Outcomes & Observations */}
      {expectedResults.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 font-bold text-gray-900 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            What to Observe & Expected Outcomes
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {expectedResults.map((item, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs sm:text-sm space-y-1.5"
              >
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {item.action || `Observation ${idx + 1}`}
                </div>
                {item.expected_outcome && (
                  <p className="text-gray-700 pl-3 leading-relaxed">
                    <strong className="text-gray-900 font-semibold">Outcome: </strong>
                    {item.expected_outcome}
                  </p>
                )}
                {item.key_takeaway && (
                  <p className="text-emerald-800 font-medium pl-3 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100/80 leading-relaxed">
                    <strong>Key Takeaway: </strong>
                    {item.key_takeaway}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Main Simulation Viewer Container
 * Full-screen scrollable presentation:
 * - Clean header with title, projector toggle, and exit button
 * - Prominent Top Quick Student Guide Banner
 * - Expansive interactive simulation stage (visuals, clickable areas, graphs, sliders)
 * - Natural vertical scroll to access derivations, calculations, and companion guide protocols
 */
export default function SimulationViewerContainer({
  simulation = {},
  onTelemetry,
  onClose,
  isFullscreenModal = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { title, subject_display, subject, topic, archetype, key, config = {} } = simulation;

  // Context guide details with fallback
  const fallback = DEFAULT_SIM_GUIDES[key] || DEFAULT_SIM_GUIDES[archetype] || DEFAULT_SIM_GUIDES.default;
  const context = config?.context_spec || {};
  const howToUse = Array.isArray(context.how_to_use) && context.how_to_use.length > 0
    ? context.how_to_use
    : fallback.how_to_use;
  const expectedResults = Array.isArray(context.expected_results) && context.expected_results.length > 0
    ? context.expected_results
    : fallback.expected_results;
  const overview = context.overview || fallback.overview;

  // Toggle browser fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const target = containerRef.current || document.documentElement;
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col space-y-6 ${className}`}
    >
      {/* 1. Header Bar */}
      <SimulationHeader
        title={title}
        topic={topic}
        subject={subject}
        subjectDisplay={subject_display}
        overview={overview}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
        isModal={isFullscreenModal}
        onReportIssue={() => setIsReportModalOpen(true)}
      />

      {/* 2. Top Quick Student Guide Banner (Always Visible Before Sim Canvas) */}
      <TopQuickGuideBanner
        howToUse={howToUse}
        overview={overview}
      />

      {/* 3. Interactive Simulation Stage */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-xs border border-gray-200/80">
        <SimulationWidgetFactory
          archetype={archetype}
          simulationKey={key}
          config={config}
          title={title}
          onTelemetry={onTelemetry}
        />
      </div>

      {/* 4. Companion Guide & Expected Outcomes Deck */}
      <SimulationGuideSection
        howToUse={howToUse}
        expectedResults={expectedResults}
      />

      {/* Report Issue Modal */}
      <ReportVisualizationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        visual={{
          id: simulation.id || key,
          title: title || 'Interactive Simulation',
          type: 'simulation',
          topic_id: simulation.topic_id || topic,
          subject: subject_display || subject,
          archetype: archetype
        }}
      />
    </div>
  );
}
