import React, { lazy, Suspense } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

const simulationRegistry = {
  charles_law: lazy(() => import('./CharlesLawSim')),
  reaction_rate: lazy(() => import('./ReactionRatesim')),
  electrolysis: lazy(() => import('./ElectrolysisSim')),
  chemical_equilibrium: lazy(() => import('./ChemicalSim')),
  chemical: lazy(() => import('./ChemicalSim')),
  circuit: lazy(() => import('./CircuitSim')),
  freefall: lazy(() => import('./FreefallSim')),
  optics: lazy(() => import('./OpticsSim')),
  acid_base_dissociation: lazy(() => import('./AcidBaseDissociationSim')),
  chem_acid_base_dissociation: lazy(() => import('./AcidBaseDissociationSim')),
  acid_base: lazy(() => import('./AcidBaseDissociationSim')),
  salt_solubility_precipitation: lazy(() => import('./SaltSolubilitySim')),
  chem_salts_solubility_precipitation: lazy(() => import('./SaltSolubilitySim')),
  hess_law_pathways: lazy(() => import('./HessLawSim')),
  chem_hess_law_pathways: lazy(() => import('./HessLawSim')),
  chem_heat_of_solution_pack: lazy(() => import('./HeatOfSolutionSim')),
  heat_of_solution_pack: lazy(() => import('./HeatOfSolutionSim')),
  chem_collision_theory_kinetics: lazy(() => import('./CollisionTheorySim')),
  collision_theory_kinetics: lazy(() => import('./CollisionTheorySim')),
  chem_haber_process_optimizer: lazy(() => import('./HaberProcessSim')),
  chem_voltaic_cell_flow: lazy(() => import('./VoltaicCellSim')),
  chem_electroplating: lazy(() => import('./ElectroplatingSim')),
  electroplating: lazy(() => import('./ElectroplatingSim')),
  chem_electrode_potential_explorer: lazy(() => import('./ElectrodePotentialSim')),
  electrode_potential_explorer: lazy(() => import('./ElectrodePotentialSim')),
  chem_preferential_discharge: lazy(() => import('./PreferentialDischargeSim')),
  preferential_discharge: lazy(() => import('./PreferentialDischargeSim')),
  chem_activity_series_displacement: lazy(() => import('./ActivitySeriesSim')),
  chem_metal_reactivity_series: lazy(() => import('./MetalReactivitySim')),
  metal_reactivity_series: lazy(() => import('./MetalReactivitySim')),
  chem_soap_micelle_action: lazy(() => import('./SoapMicelleSim')),
  soap_micelle_action: lazy(() => import('./SoapMicelleSim')),
  chem_functional_group_tests: lazy(() => import('./FunctionalGroupTestsSim')),
  functional_group_tests: lazy(() => import('./FunctionalGroupTestsSim')),
  chem_radioactive_decay_half_life: lazy(() => import('./RadioactiveDecaySim')),
  radioactive_decay_half_life: lazy(() => import('./RadioactiveDecaySim')),
  chem_nuclear_fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
  nuclear_fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
};

export default function SimulationWidgetFactory({ archetype, simulationKey, config = {}, title = '', onTelemetry }) {
  const targetKey = (archetype || simulationKey || '').toLowerCase();
  const SelectedWidget = simulationRegistry[targetKey];

  if (!SelectedWidget) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-amber-50 border border-amber-200 rounded-3xl text-center text-amber-800">
        <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-lg font-bold">Widget Component Not Registered</h3>
        <p className="text-sm mt-1">
          No matching client-side component was found for archetype <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{targetKey}</code>.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-custom-orange mb-3" />
          <p className="text-sm font-medium">Mounting {title || 'Simulation'} Widget...</p>
        </div>
      }
    >
      <SelectedWidget config={config} onTelemetry={onTelemetry} />
    </Suspense>
  );
}
