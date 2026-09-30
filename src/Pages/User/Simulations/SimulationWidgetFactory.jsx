import React, { lazy, Suspense } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { normalizePhetUrl } from '../../../utils/phetUrlHelper';
import PhetSimulationRunner from './PhetSimulationRunner';

const simulationRegistry = {
  charles_law: lazy(() => import('./CharlesLawGuidedSim')),
  chem_charles_law: lazy(() => import('./CharlesLawGuidedSim')),
  charles_law_guided: lazy(() => import('./CharlesLawGuidedSim')),
  chem_charles_law_guided: lazy(() => import('./CharlesLawGuidedSim')),
  boyles_law: lazy(() => import('./BoylesLawSim')),
  chem_boyles_law: lazy(() => import('./BoylesLawSim')),
  grahams_law: lazy(() => import('./GrahamsLawSim')),
  chem_grahams_law: lazy(() => import('./GrahamsLawSim')),
  grahams_law_diffusion: lazy(() => import('./GrahamsLawSim')),
  chem_grahams_law_diffusion: lazy(() => import('./GrahamsLawSim')),
  reaction_rate: lazy(() => import('./ReactionRatesim')),
  electrolysis: lazy(() => import('./ElectrolysisSim')),
  chemical_equilibrium: lazy(() => import('./ChemicalSim')),
  chemical: lazy(() => import('./ChemicalSim')),
  circuit: lazy(() => import('./CircuitSim')),
  freefall: lazy(() => import('./FreefallSim')),
  compound_microscope_telescope: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  phys_compound_microscope_telescope: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  compound_microscope: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  astronomical_telescope: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  optical_instruments: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  phys_optical_instruments: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  microscope_telescope: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  optics: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  thin_lens: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  thin_lens_ray_tracing: lazy(() => import('./CompoundMicroscopeTelescopeSim')),
  convex_lens_image_formation: lazy(() => import('./ConvexLensSim')),
  phys_convex_lens_image_formation: lazy(() => import('./ConvexLensSim')),
  convex_lens: lazy(() => import('./ConvexLensSim')),
  convex_lens_ray_tracer: lazy(() => import('./ConvexLensSim')),
  lens_formula_calculator: lazy(() => import('./LensFormulaSim')),
  phys_lens_formula_calculator: lazy(() => import('./LensFormulaSim')),
  lens_formula_verification: lazy(() => import('./LensFormulaSim')),
  lens_formula: lazy(() => import('./LensFormulaSim')),
  eye_defects_simulator: lazy(() => import('./EyeDefectsSim')),
  phys_eye_defects_simulator: lazy(() => import('./EyeDefectsSim')),
  eye_defects_correction: lazy(() => import('./EyeDefectsSim')),
  eye_defects: lazy(() => import('./EyeDefectsSim')),
  homologous_pentadactyl_limb: lazy(() => import('./HomologousLimbsEvolutionSim')),
  bio_homologous_pentadactyl_limb: lazy(() => import('./HomologousLimbsEvolutionSim')),
  homologous_limbs_evolution: lazy(() => import('./HomologousLimbsEvolutionSim')),
  pentadactyl_limb: lazy(() => import('./HomologousLimbsEvolutionSim')),
  homologous_structures: lazy(() => import('./HomologousLimbsEvolutionSim')),
  adaptive_radiation: lazy(() => import('./HomologousLimbsEvolutionSim')),
  divergent_evolution: lazy(() => import('./HomologousLimbsEvolutionSim')),
  natural_selection_peppered_moth: lazy(() => import('./NaturalSelectionEvolutionSim')),
  bio_natural_selection_peppered_moth: lazy(() => import('./NaturalSelectionEvolutionSim')),
  peppered_moth: lazy(() => import('./NaturalSelectionEvolutionSim')),
  industrial_melanism: lazy(() => import('./NaturalSelectionEvolutionSim')),
  natural_selection: lazy(() => import('./NaturalSelectionEvolutionSim')),
  lens_power_diopters: lazy(() => import('./LensPowerSim')),
  phys_lens_power_diopters: lazy(() => import('./LensPowerSim')),
  lens_power: lazy(() => import('./LensPowerSim')),
  lens_diopters: lazy(() => import('./LensPowerSim')),
  diverging_lens_simulator: lazy(() => import('./DivergingLensSim')),
  phys_diverging_lens_simulator: lazy(() => import('./DivergingLensSim')),
  diverging_lens: lazy(() => import('./DivergingLensSim')),
  diverging_lens_virtual: lazy(() => import('./DivergingLensSim')),
  vertical_circle_loop: lazy(() => import('./VerticalCircleLoopSim')),
  phys_vertical_circle_loop: lazy(() => import('./VerticalCircleLoopSim')),
  vertical_circle_motion: lazy(() => import('./VerticalCircleLoopSim')),
  vertical_circular_motion: lazy(() => import('./VerticalCircleLoopSim')),
  rollercoaster_loop: lazy(() => import('./VerticalCircleLoopSim')),
  loop_the_loop: lazy(() => import('./VerticalCircleLoopSim')),
  circular_motion_angular_quantities: lazy(() => import('./AngularQuantitiesSim')),
  phys_circular_motion_angular_quantities: lazy(() => import('./AngularQuantitiesSim')),
  angular_quantities: lazy(() => import('./AngularQuantitiesSim')),
  circular_motion: lazy(() => import('./AngularQuantitiesSim')),
  centripetal_acceleration: lazy(() => import('./CentripetalAccelerationSim')),
  phys_centripetal_acceleration: lazy(() => import('./CentripetalAccelerationSim')),
  centripetal_accel: lazy(() => import('./CentripetalAccelerationSim')),
  centripetal_force_sources: lazy(() => import('./CentripetalForceSourcesSim')),
  phys_centripetal_force_sources: lazy(() => import('./CentripetalForceSourcesSim')),
  centripetal_force: lazy(() => import('./CentripetalForceSourcesSim')),
  banked_track_dynamics: lazy(() => import('./BankedTrackSim')),
  phys_banked_track_dynamics: lazy(() => import('./BankedTrackSim')),
  banked_track: lazy(() => import('./BankedTrackSim')),
  phys_banked_track: lazy(() => import('./BankedTrackSim')),
  banked_curve_dynamics: lazy(() => import('./BankedTrackSim')),
  banked_road: lazy(() => import('./BankedTrackSim')),
  banked_track_vehicle_cornering: lazy(() => import('./BankedTrackSim')),
  phys_banked_track_vehicle_cornering: lazy(() => import('./BankedTrackSim')),
  archimedes_principle_buoyancy: lazy(() => import('./ArchimedesPrincipleSim')),
  phys_archimedes_principle_buoyancy: lazy(() => import('./ArchimedesPrincipleSim')),
  archimedes_principle: lazy(() => import('./ArchimedesPrincipleSim')),
  buoyancy_balance: lazy(() => import('./ArchimedesPrincipleSim')),
  archimedes: lazy(() => import('./ArchimedesPrincipleSim')),
  law_of_floatation_equilibrium: lazy(() => import('./LawOfFloatationSim')),
  phys_law_of_floatation_equilibrium: lazy(() => import('./LawOfFloatationSim')),
  law_of_floatation: lazy(() => import('./LawOfFloatationSim')),
  floatation_equilibrium: lazy(() => import('./LawOfFloatationSim')),
  plimsoll_line: lazy(() => import('./LawOfFloatationSim')),
  plimsoll: lazy(() => import('./LawOfFloatationSim')),
  hydrometer_calibration_density: lazy(() => import('./HydrometerSim')),
  phys_hydrometer_calibration_density: lazy(() => import('./HydrometerSim')),
  hydrometer: lazy(() => import('./HydrometerSim')),
  hydrometer_calibration: lazy(() => import('./HydrometerSim')),
  relative_density: lazy(() => import('./HydrometerSim')),
  balloons_and_submarines_buoyancy: lazy(() => import('./BalloonsAndSubmarinesSim')),
  phys_balloons_and_submarines_buoyancy: lazy(() => import('./BalloonsAndSubmarinesSim')),
  balloons_and_submarines: lazy(() => import('./BalloonsAndSubmarinesSim')),
  submarine_buoyancy: lazy(() => import('./BalloonsAndSubmarinesSim')),
  weather_balloon_buoyancy: lazy(() => import('./BalloonsAndSubmarinesSim')),
  submarine: lazy(() => import('./BalloonsAndSubmarinesSim')),
  weather_balloon: lazy(() => import('./BalloonsAndSubmarinesSim')),
  crt: lazy(() => import('./CRTSim')),
  phys_crt: lazy(() => import('./CRTSim')),
  crt_sim: lazy(() => import('./CRTSim')),
  cathode_ray_tube: lazy(() => import('./CRTSim')),
  crt_electron: lazy(() => import('./CRTSim')),
  cathode_ray: lazy(() => import('./CRTSim')),
  cathode_ray_oscilloscope: lazy(() => import('./CRTSim')),
  em_wave_orthogonal_fields: lazy(() => import('./EMWaveOrthogonalFieldsSim')),
  phys_em_wave_orthogonal_fields: lazy(() => import('./EMWaveOrthogonalFieldsSim')),
  em_wave_builder: lazy(() => import('./EMWaveOrthogonalFieldsSim')),
  orthogonal_em_wave: lazy(() => import('./EMWaveOrthogonalFieldsSim')),
  em_wave: lazy(() => import('./EMWaveOrthogonalFieldsSim')),
  em_spectrum_analyzer_bands: lazy(() => import('./EMSpectrumAnalyzerSim')),
  phys_em_spectrum_analyzer_bands: lazy(() => import('./EMSpectrumAnalyzerSim')),
  em_spectrum_analyzer: lazy(() => import('./EMSpectrumAnalyzerSim')),
  em_radiation_attenuation_hazards: lazy(() => import('./RadiationShieldingSim')),
  phys_em_radiation_attenuation_hazards: lazy(() => import('./RadiationShieldingSim')),
  radiation_attenuation_hazards: lazy(() => import('./RadiationShieldingSim')),
  attenuation_hazards: lazy(() => import('./RadiationShieldingSim')),
  radiation_shielding: lazy(() => import('./RadiationShieldingSim')),
  radiation_shielding_sim: lazy(() => import('./RadiationShieldingSim')),
  speed_of_light_experiments: lazy(() => import('./SpeedOfLightLabSim')),
  phys_speed_of_light_experiments: lazy(() => import('./SpeedOfLightLabSim')),
  speed_of_light_lab: lazy(() => import('./SpeedOfLightLabSim')),
  speed_of_light: lazy(() => import('./SpeedOfLightLabSim')),
  fizeau_toothed_wheel: lazy(() => import('./SpeedOfLightLabSim')),
  romer_io_eclipse: lazy(() => import('./SpeedOfLightLabSim')),
  x_ray: lazy(() => import('./XRaySim')),
  phys_x_ray: lazy(() => import('./XRaySim')),
  xray: lazy(() => import('./XRaySim')),
  phys_xray: lazy(() => import('./XRaySim')),
  coolidge_xray: lazy(() => import('./XRaySim')),
  coolidge_tube: lazy(() => import('./XRaySim')),
  x_ray_production: lazy(() => import('./XRaySim')),
  phys_x_ray_production: lazy(() => import('./XRaySim')),
  faradays_law_magnetic_flux: lazy(() => import('./FaradaysLawInductionSim')),
  phys_faradays_law_magnetic_flux: lazy(() => import('./FaradaysLawInductionSim')),
  faradays_law: lazy(() => import('./FaradaysLawInductionSim')),
  faraday_induction: lazy(() => import('./FaradaysLawInductionSim')),
  induction_sandbox: lazy(() => import('./FaradaysLawInductionSim')),
  lenzs_law_eddy_currents: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  phys_lenzs_law_eddy_currents: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  lenzs_law: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  eddy_currents: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  lenz_law: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  eddy_currents_damping: lazy(() => import('./LenzsLawEddyCurrentsSim')),
  ac_generator_slip_rings: lazy(() => import('./ACGeneratorSim')),
  phys_ac_generator_slip_rings: lazy(() => import('./ACGeneratorSim')),
  ac_generator: lazy(() => import('./ACGeneratorSim')),
  dynamo: lazy(() => import('./ACGeneratorSim')),
  alternating_current_dynamo: lazy(() => import('./ACGeneratorSim')),
  photoelectric: lazy(() => import('./PhotoelectricSim')),
  phys_photoelectric: lazy(() => import('./PhotoelectricSim')),
  photoelectric_effect: lazy(() => import('./PhotoelectricSim')),
  phys_photoelectric_effect: lazy(() => import('./PhotoelectricSim')),
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
  phys_radioactive_decay_half_life: lazy(() => import('./RadioactiveDecaySim')),
  radioactive_decay_half_life: lazy(() => import('./RadioactiveDecaySim')),
  radioactive_decay: lazy(() => import('./RadioactiveDecaySim')),
  phys_radioactive_decay: lazy(() => import('./RadioactiveDecaySim')),
  half_life: lazy(() => import('./RadioactiveDecaySim')),
  chem_nuclear_fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
  phys_nuclear_fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
  nuclear_fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
  nuclear_fission: lazy(() => import('./NuclearFissionSim')),
  phys_nuclear_fission: lazy(() => import('./NuclearFissionSim')),
  fission_chain_reaction: lazy(() => import('./NuclearFissionSim')),
  chem_titration_volumetric_analysis: lazy(() => import('./TitrationSim')),
  titration_volumetric_analysis: lazy(() => import('./TitrationSim')),
  titration_lab: lazy(() => import('./TitrationSim')),
  titration: lazy(() => import('./TitrationSim')),
  chem_titration: lazy(() => import('./TitrationSim')),
  volumetric_analysis: lazy(() => import('./TitrationSim')),
  math_matrix_transformation: lazy(() => import('./MatrixTransformationSim')),
  matrix_transformation: lazy(() => import('./MatrixTransformationSim')),
  math_statistics_ogive_explorer: lazy(() => import('./OgiveExplorerSim')),
  ogive_explorer: lazy(() => import('./OgiveExplorerSim')),
  math_3d_geometry_explorer: lazy(() => import('./ThreeDGeometrySim')),
  three_d_geometry: lazy(() => import('./ThreeDGeometrySim')),
  math_trigonometry_wave_explorer: lazy(() => import('./TrigonometryWaveSim')),
  trigonometry_wave: lazy(() => import('./TrigonometryWaveSim')),
  math_earth_globe_explorer: lazy(() => import('./EarthGlobeSim')),
  earth_globe: lazy(() => import('./EarthGlobeSim')),
  math_linear_programming_explorer: lazy(() => import('./LinearProgrammingSim')),
  linear_programming: lazy(() => import('./LinearProgrammingSim')),
  math_loci_construction_explorer: lazy(() => import('./LociConstructionSim')),
  loci_construction: lazy(() => import('./LociConstructionSim')),
  math_differentiation_explorer: lazy(() => import('./DifferentiationSim')),
  differentiation: lazy(() => import('./DifferentiationSim')),
  math_integration_explorer: lazy(() => import('./IntegrationSim')),
  integration: lazy(() => import('./IntegrationSim')),
  math_area_approximation_explorer: lazy(() => import('./AreaApproximationSim')),
  area_approximation: lazy(() => import('./AreaApproximationSim')),
  transformer_mutual_induction: lazy(() => import('./TransformerSim')),
  phys_transformer_mutual_induction: lazy(() => import('./TransformerSim')),
  transformer_sim: lazy(() => import('./TransformerSim')),
  mutual_induction: lazy(() => import('./TransformerSim')),
  transformer: lazy(() => import('./TransformerSim')),
  step_up_step_down_transformer: lazy(() => import('./TransformerSim')),
  high_voltage_grid_transmission: lazy(() => import('./HighVoltageGridTransmissionSim')),
  phys_high_voltage_grid_transmission: lazy(() => import('./HighVoltageGridTransmissionSim')),
  grid_transmission_sandbox: lazy(() => import('./HighVoltageGridTransmissionSim')),
  grid_transmission: lazy(() => import('./HighVoltageGridTransmissionSim')),
  high_voltage_transmission: lazy(() => import('./HighVoltageGridTransmissionSim')),
  domestic_wiring_ring_main: lazy(() => import('./DomesticWiringRingMainSim')),
  phys_domestic_wiring_ring_main: lazy(() => import('./DomesticWiringRingMainSim')),
  domestic_wiring: lazy(() => import('./DomesticWiringRingMainSim')),
  ring_main: lazy(() => import('./DomesticWiringRingMainSim')),
  three_pin_plug: lazy(() => import('./DomesticWiringRingMainSim')),
  electrical_safety_fuses_earthing: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  phys_electrical_safety_fuses_earthing: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  fuses_earthing: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  electrical_safety: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  mains_safety: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  fuse_circuit_breaker_earthing: lazy(() => import('./ElectricalSafetyFusesEarthingSim')),
  energy_consumption_costing_meter: lazy(() => import('./EnergyConsumptionCostingSim')),
  phys_energy_consumption_costing_meter: lazy(() => import('./EnergyConsumptionCostingSim')),
  energy_metering: lazy(() => import('./EnergyConsumptionCostingSim')),
  utility_costing: lazy(() => import('./EnergyConsumptionCostingSim')),
  energy_consumption_costing: lazy(() => import('./EnergyConsumptionCostingSim')),
  // Topic 7: Cathode Rays & CRTs
  magnetic_deflection_cathode_rays: lazy(() => import('./MagneticDeflectionCathodeRaysSim')),
  phys_magnetic_deflection_cathode_rays: lazy(() => import('./MagneticDeflectionCathodeRaysSim')),
  magnetic_deflection: lazy(() => import('./MagneticDeflectionCathodeRaysSim')),
  maltese_cross: lazy(() => import('./MagneticDeflectionCathodeRaysSim')),
  paddle_wheel: lazy(() => import('./MagneticDeflectionCathodeRaysSim')),
  cro_waveform_diagnostics: lazy(() => import('./CROWaveformDiagnosticsSim')),
  phys_cro_waveform_diagnostics: lazy(() => import('./CROWaveformDiagnosticsSim')),
  cro_diagnostics: lazy(() => import('./CROWaveformDiagnosticsSim')),
  cro_waveform: lazy(() => import('./CROWaveformDiagnosticsSim')),
  oscilloscope: lazy(() => import('./CROWaveformDiagnosticsSim')),
  thomson_specific_charge_em: lazy(() => import('./ThomsonSpecificChargeSim')),
  phys_thomson_specific_charge_em: lazy(() => import('./ThomsonSpecificChargeSim')),
  thomson_specific_charge: lazy(() => import('./ThomsonSpecificChargeSim')),
  thomson_em_ratio: lazy(() => import('./ThomsonSpecificChargeSim')),
  velocity_selector: lazy(() => import('./ThomsonSpecificChargeSim')),
  // Topic 8: X-Rays
  xray_intensity_vs_hardness_control: lazy(() => import('./XRayIntensityHardnessSim')),
  phys_xray_intensity_vs_hardness_control: lazy(() => import('./XRayIntensityHardnessSim')),
  xray_intensity_hardness: lazy(() => import('./XRayIntensityHardnessSim')),
  xray_spectra_control: lazy(() => import('./XRayAtomicTransitionsSim')),
  xray_atomic_transitions: lazy(() => import('./XRayAtomicTransitionsSim')),
  phys_xray_atomic_transitions: lazy(() => import('./XRayAtomicTransitionsSim')),
  xray_characteristic_spectra: lazy(() => import('./XRayAtomicTransitionsSim')),
  xray_atomic_spectra: lazy(() => import('./XRayAtomicTransitionsSim')),
  xray_attenuation_radiography: lazy(() => import('./XRayRadiographySim')),
  phys_xray_attenuation_radiography: lazy(() => import('./XRayRadiographySim')),
  xray_radiography: lazy(() => import('./XRayRadiographySim')),
  radiographic_imaging: lazy(() => import('./XRayRadiographySim')),
  braggs_law_crystal_diffraction: lazy(() => import('./BraggsLawDiffractionSim')),
  phys_braggs_law_crystal_diffraction: lazy(() => import('./BraggsLawDiffractionSim')),
  braggs_law: lazy(() => import('./BraggsLawDiffractionSim')),
  xray_diffraction: lazy(() => import('./BraggsLawDiffractionSim')),
  // Topic 9: Photoelectric Effect
  stopping_potential_planck_graph: lazy(() => import('./StoppingPotentialPlanckSim')),
  phys_stopping_potential_planck_graph: lazy(() => import('./StoppingPotentialPlanckSim')),
  stopping_potential: lazy(() => import('./StoppingPotentialPlanckSim')),
  planck_constant_graph: lazy(() => import('./StoppingPotentialPlanckSim')),
  gold_leaf_electroscope_uv: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  phys_gold_leaf_electroscope_uv: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  gold_leaf_electroscope: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  hertz_hallwachs_experiment: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  zinc_plate_uv_experiment: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  photon_intensity_vs_current: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  phys_photon_intensity_vs_current: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  photon_intensity: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  photocurrent_vs_intensity: lazy(() => import('./GoldLeafElectroscopeUVExperimentSim')),
  photocell_circuit_applications: lazy(() => import('./PhotocellCircuitApplicationsSim')),
  phys_photocell_circuit_applications: lazy(() => import('./PhotocellCircuitApplicationsSim')),
  photocell_applications: lazy(() => import('./PhotocellCircuitApplicationsSim')),
  photocell_security_alarm: lazy(() => import('./PhotocellCircuitApplicationsSim')),
  // Topic 10: Radioactivity & Nuclear Physics
  radiation_deflection_shielding_alpha_beta_gamma: lazy(() => import('./RadiationDeflectionShieldingSim')),
  phys_radiation_deflection_shielding_alpha_beta_gamma: lazy(() => import('./RadiationDeflectionShieldingSim')),
  radiation_deflection_shielding: lazy(() => import('./RadiationDeflectionShieldingSim')),
  alpha_beta_gamma_deflection: lazy(() => import('./RadiationDeflectionShieldingSim')),
  binding_energy_per_nucleon_curve: lazy(() => import('./BindingEnergyPerNucleonSim')),
  phys_binding_energy_per_nucleon_curve: lazy(() => import('./BindingEnergyPerNucleonSim')),
  binding_energy_curve: lazy(() => import('./BindingEnergyPerNucleonSim')),
  mass_defect_curve: lazy(() => import('./BindingEnergyPerNucleonSim')),
  // Topic 11: Electronics & Logic Gates
  pn_junction_diode_rectification: lazy(() => import('./PNJunctionRectificationSim')),
  phys_pn_junction_diode_rectification: lazy(() => import('./PNJunctionRectificationSim')),
  diode_rectification: lazy(() => import('./PNJunctionRectificationSim')),
  bridge_rectifier: lazy(() => import('./PNJunctionRectificationSim')),
  digital_logic_gates_truth_tables: lazy(() => import('./DigitalLogicGatesSim')),
  phys_digital_logic_gates_truth_tables: lazy(() => import('./DigitalLogicGatesSim')),
  logic_gates: lazy(() => import('./DigitalLogicGatesSim')),
  truth_tables: lazy(() => import('./DigitalLogicGatesSim')),
  transistor_switch_sensor_circuit: lazy(() => import('./TransistorSwitchCircuitSim')),
  phys_transistor_switch_sensor_circuit: lazy(() => import('./TransistorSwitchCircuitSim')),
  transistor_switch: lazy(() => import('./TransistorSwitchCircuitSim')),
  transistor_sensor_circuit: lazy(() => import('./TransistorSwitchCircuitSim')),
  combinational_logic_half_adder: lazy(() => import('./CombinationalLogicAdderSim')),
  phys_combinational_logic_half_adder: lazy(() => import('./CombinationalLogicAdderSim')),
  half_adder: lazy(() => import('./CombinationalLogicAdderSim')),
  binary_adder: lazy(() => import('./CombinationalLogicAdderSim')),

  // ==========================================
  // BIOLOGY FORM 4 SIMULATIONS
  // ==========================================
  // Topic 1: Support and Movement in Plants and Animals
  mammalian_vertebrae_3d_explorer: lazy(() => import('./MammalianVertebrae3DSim')),
  bio_mammalian_vertebrae_3d_explorer: lazy(() => import('./MammalianVertebrae3DSim')),
  mammalian_vertebrae: lazy(() => import('./MammalianVertebrae3DSim')),
  vertebrae_3d: lazy(() => import('./MammalianVertebrae3DSim')),

  human_arm_antagonistic_muscles_3d: lazy(() => import('./AntagonisticMusclePairSim')),
  bio_human_arm_antagonistic_muscles_3d: lazy(() => import('./AntagonisticMusclePairSim')),
  antagonistic_muscle_pair: lazy(() => import('./AntagonisticMusclePairSim')),
  bio_antagonistic_muscle_pair: lazy(() => import('./AntagonisticMusclePairSim')),
  human_arm_muscles: lazy(() => import('./AntagonisticMusclePairSim')),
  antagonistic_muscles: lazy(() => import('./AntagonisticMusclePairSim')),

  synovial_joint_biomechanics_3d: lazy(() => import('./HumanJointMovementSim')),
  bio_synovial_joint_biomechanics_3d: lazy(() => import('./HumanJointMovementSim')),
  synovial_joint: lazy(() => import('./HumanJointMovementSim')),
  human_joint_movement: lazy(() => import('./HumanJointMovementSim')),
  bio_human_joint_movement: lazy(() => import('./HumanJointMovementSim')),

  plant_support_turgor_wilting_lab: lazy(() => import('./PlantSupportTurgorWiltingSim')),
  bio_plant_support_turgor_wilting_lab: lazy(() => import('./PlantSupportTurgorWiltingSim')),
  plant_turgor_wilting: lazy(() => import('./PlantSupportTurgorWiltingSim')),

  muscle_sliding_filament_mechanism: lazy(() => import('./SlidingFilamentMechanismSim')),
  sliding_filament_sim: lazy(() => import('./SlidingFilamentMechanismSim')),
  bio_sliding_filament_mechanism: lazy(() => import('./SlidingFilamentMechanismSim')),
  sliding_filament_mechanism: lazy(() => import('./SlidingFilamentMechanismSim')),
  muscle_contraction_sliding_filament: lazy(() => import('./SlidingFilamentMechanismSim')),
  sliding_filament: lazy(() => import('./SlidingFilamentMechanismSim')),
  bio_sliding_filament: lazy(() => import('./SlidingFilamentMechanismSim')),

  // Topic 2: Genetics
  meiosis_genetic_variation: lazy(() => import('./MeiosisGeneticVariationSim')),
  bio_meiosis_genetic_variation: lazy(() => import('./MeiosisGeneticVariationSim')),
  meiosis_genetic_variation_sim: lazy(() => import('./MeiosisGeneticVariationSim')),
  bio_meiosis_genetic_variation_sim: lazy(() => import('./MeiosisGeneticVariationSim')),
  meiosis_sim: lazy(() => import('./MeiosisGeneticVariationSim')),

  dna_replication_protein_synthesis_3d: lazy(() => import('./DNAReplicationProteinSynthesisSim')),
  bio_dna_replication_protein_synthesis_3d: lazy(() => import('./DNAReplicationProteinSynthesisSim')),
  dna_replication_3d: lazy(() => import('./DNAReplicationProteinSynthesisSim')),
  protein_synthesis_3d: lazy(() => import('./DNAReplicationProteinSynthesisSim')),

  monohybrid_dihybrid_punnett_genetics: lazy(() => import('./MendelianInheritanceLabSim')),
  bio_monohybrid_dihybrid_punnett_genetics: lazy(() => import('./MendelianInheritanceLabSim')),
  mendelian_inheritance_lab: lazy(() => import('./MendelianInheritanceLabSim')),
  bio_mendelian_inheritance_lab: lazy(() => import('./MendelianInheritanceLabSim')),
  punnett_genetics: lazy(() => import('./MendelianInheritanceLabSim')),
  mendelian_genetics_punnett: lazy(() => import('./MendelianGeneticsPunnettSim')),

  abo_blood_group_pedigree_genetics: lazy(() => import('./ABOBloodGroupPedigreeSim')),
  bio_abo_blood_group_pedigree_genetics: lazy(() => import('./ABOBloodGroupPedigreeSim')),
  abo_blood_groups: lazy(() => import('./ABOBloodGroupPedigreeSim')),

  chromosomal_mutations_karyotype_sim: lazy(() => import('./ChromosomalMutationsKaryotypeSim')),
  bio_chromosomal_mutations_karyotype_sim: lazy(() => import('./ChromosomalMutationsKaryotypeSim')),
  karyotype_mutations: lazy(() => import('./ChromosomalMutationsKaryotypeSim')),

  sex_linked_inheritance: lazy(() => import('./SexLinkedInheritanceSim')),
  bio_sex_linked_inheritance: lazy(() => import('./SexLinkedInheritanceSim')),
  sex_linked_inheritance_sim: lazy(() => import('./SexLinkedInheritanceSim')),
  sex_linkage: lazy(() => import('./SexLinkedInheritanceSim')),

  // Topic 3: Reception, Response and Coordination
  human_eye_accommodation_defects_3d: lazy(() => import('./HumanEyeAccommodationSim')),
  bio_human_eye_accommodation_defects_3d: lazy(() => import('./HumanEyeAccommodationSim')),
  human_eye_accommodation: lazy(() => import('./HumanEyeAccommodationSim')),
  bio_human_eye_accommodation: lazy(() => import('./HumanEyeAccommodationSim')),
  human_eye_accommodation_defects: lazy(() => import('./HumanEyeAccommodationSim')),
  human_eye_accommodation_defects_sim: lazy(() => import('./HumanEyeAccommodationSim')),
  bio_human_eye_accommodation_defects_sim: lazy(() => import('./HumanEyeAccommodationSim')),
  eye_accommodation_defects: lazy(() => import('./HumanEyeAccommodationSim')),
  human_eye_3d: lazy(() => import('./HumanEyeAccommodationSim')),
  human_eye: lazy(() => import('./HumanEyeAccommodationSim')),

  human_ear_hearing_balance_3d: lazy(() => import('./HumanEarHearingBalanceSim')),
  bio_human_ear_hearing_balance_3d: lazy(() => import('./HumanEarHearingBalanceSim')),
  human_ear_hearing_balance: lazy(() => import('./HumanEarHearingBalanceSim')),
  human_ear_hearing_balance_sim: lazy(() => import('./HumanEarHearingBalanceSim')),
  bio_human_ear_hearing_balance_sim: lazy(() => import('./HumanEarHearingBalanceSim')),
  ear_hearing_balance: lazy(() => import('./HumanEarHearingBalanceSim')),
  human_ear_3d: lazy(() => import('./HumanEarHearingBalanceSim')),
  human_ear: lazy(() => import('./HumanEarHearingBalanceSim')),

  reflex_arc_synaptic_transmission_sim: lazy(() => import('./HumanReflexArcSim')),
  human_reflex_arc: lazy(() => import('./HumanReflexArcSim')),
  bio_human_reflex_arc: lazy(() => import('./HumanReflexArcSim')),
  bio_reflex_arc_synaptic_transmission_sim: lazy(() => import('./HumanReflexArcSim')),
  reflex_arc_synapse: lazy(() => import('./HumanReflexArcSim')),
  human_reflex_arc_sim: lazy(() => import('./HumanReflexArcSim')),
  reflex_arc_sim: lazy(() => import('./HumanReflexArcSim')),
  reflex_arc: lazy(() => import('./HumanReflexArcSim')),

  plant_tropisms_auxin_distribution_sim: lazy(() => import('./PlantTropismsAuxinDistributionSim')),
  bio_plant_tropisms_auxin_distribution_sim: lazy(() => import('./PlantTropismsAuxinDistributionSim')),
  plant_tropisms_auxin: lazy(() => import('./PlantTropismsAuxinDistributionSim')),

  nerve_impulse_synaptic_transmission: lazy(() => import('./NerveImpulseSynapseSim')),
  bio_nerve_impulse_synaptic_transmission: lazy(() => import('./NerveImpulseSynapseSim')),
  synaptic_transmission_sim: lazy(() => import('./NerveImpulseSynapseSim')),
  nerve_impulse_synapse_sim: lazy(() => import('./NerveImpulseSynapseSim')),
  nerve_impulse_synapse: lazy(() => import('./NerveImpulseSynapseSim')),
  synaptic_transmission: lazy(() => import('./NerveImpulseSynapseSim')),
  nerve_impulse_sim: lazy(() => import('./NerveImpulseSynapseSim')),
  nerve_impulse: lazy(() => import('./NerveImpulseSynapseSim')),

  // Topic 4: Evolution
  homologous_pentadactyl_limb_evolution_3d: lazy(() => import('./HomologousLimbsEvolutionSim')),
  bio_homologous_pentadactyl_limb_evolution_3d: lazy(() => import('./HomologousLimbsEvolutionSim')),
  homologous_limbs_evolution_sim: lazy(() => import('./HomologousLimbsEvolutionSim')),
  homologous_limbs_sim: lazy(() => import('./HomologousLimbsEvolutionSim')),
  pentadactyl_limb_evolution: lazy(() => import('./HomologousLimbsEvolutionSim')),
  homologous_pentadactyl_limb_sim: lazy(() => import('./HomologousLimbsEvolutionSim')),

  natural_selection_peppered_moth_simulation: lazy(() => import('./NaturalSelectionEvolutionSim')),
  bio_natural_selection_peppered_moth_simulation: lazy(() => import('./NaturalSelectionEvolutionSim')),
  peppered_moth_natural_selection: lazy(() => import('./NaturalSelectionEvolutionSim')),
  natural_selection_evolution: lazy(() => import('./NaturalSelectionEvolutionSim')),
  natural_selection_evolution_sim: lazy(() => import('./NaturalSelectionEvolutionSim')),
  bio_natural_selection_evolution: lazy(() => import('./NaturalSelectionEvolutionSim')),
  bio_natural_selection_evolution_sim: lazy(() => import('./NaturalSelectionEvolutionSim')),
  natural_selection_sim: lazy(() => import('./NaturalSelectionEvolutionSim')),

  chemical_evolution_prebiotic_soup_sim: lazy(() => import('./ChemicalEvolutionPrebioticSoupSim')),
  bio_chemical_evolution_prebiotic_soup_sim: lazy(() => import('./ChemicalEvolutionPrebioticSoupSim')),
  miller_urey_chemical_evolution: lazy(() => import('./ChemicalEvolutionPrebioticSoupSim')),

  antibiotic_resistance_evolution_sim: lazy(() => import('./AntibioticResistanceEvolutionSim')),
  bio_antibiotic_resistance_evolution_sim: lazy(() => import('./AntibioticResistanceEvolutionSim')),
  antibiotic_resistance_evolution: lazy(() => import('./AntibioticResistanceEvolutionSim')),

  speciation_geographic_isolation: lazy(() => import('./SpeciationGeographicIsolationSim')),
  speciation_geographic_isolation_sim: lazy(() => import('./SpeciationGeographicIsolationSim')),
  bio_speciation_geographic_isolation: lazy(() => import('./SpeciationGeographicIsolationSim')),
  bio_speciation_geographic_isolation_sim: lazy(() => import('./SpeciationGeographicIsolationSim')),
  speciation_sim: lazy(() => import('./SpeciationGeographicIsolationSim')),
  allopatric_speciation_sim: lazy(() => import('./SpeciationGeographicIsolationSim')),
  allopatric_speciation: lazy(() => import('./SpeciationGeographicIsolationSim')),

  animal_vs_plant_cell: lazy(() => import('./AnimalVsPlantCellSim')),
  animal_vs_plant_cell_sim: lazy(() => import('./AnimalVsPlantCellSim')),
  bio_animal_vs_plant_cell: lazy(() => import('./AnimalVsPlantCellSim')),
  bio_animal_vs_plant_cell_sim: lazy(() => import('./AnimalVsPlantCellSim')),
  plant_cell_vs_animal_cell: lazy(() => import('./AnimalVsPlantCellSim')),
  plant_vs_animal_cell: lazy(() => import('./AnimalVsPlantCellSim')),

  cell_size_surface_area: lazy(() => import('./CellSizeSurfaceAreaSim')),
  cell_size_surface_area_sim: lazy(() => import('./CellSizeSurfaceAreaSim')),
  bio_cell_size_surface_area: lazy(() => import('./CellSizeSurfaceAreaSim')),
  bio_cell_size_surface_area_sim: lazy(() => import('./CellSizeSurfaceAreaSim')),
  cell_surface_area_to_volume: lazy(() => import('./CellSizeSurfaceAreaSim')),
  bio_cell_surface_area_to_volume: lazy(() => import('./CellSizeSurfaceAreaSim')),
  cell_size_sa_v_ratio: lazy(() => import('./CellSizeSurfaceAreaSim')),
  surface_area_to_volume_cell: lazy(() => import('./CellSizeSurfaceAreaSim')),
  cell_size_sim: lazy(() => import('./CellSizeSurfaceAreaSim')),
  bio_cell_size_sim: lazy(() => import('./CellSizeSurfaceAreaSim')),


  biological_organization_levels: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  biological_organization_levels_sim: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  bio_biological_organization_levels: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  bio_biological_organization_levels_sim: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  levels_of_biological_organization: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  bio_levels_of_biological_organization: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  levels_of_organization: lazy(() => import('./BiologicalOrganizationLevelsSim')),
  bio_levels_of_organization: lazy(() => import('./BiologicalOrganizationLevelsSim')),

  // Topic 2: Leaf Structure, Xylem Movement & Transpiration
  leaf_structure_cross_section: lazy(() => import('./LeafStructureCrossSectionSim')),
  leaf_structure: lazy(() => import('./LeafStructureCrossSectionSim')),
  bio_leaf_structure: lazy(() => import('./LeafStructureCrossSectionSim')),
  leaf_structure_cross_section_sim: lazy(() => import('./LeafStructureCrossSectionSim')),
  bio_leaf_structure_cross_section: lazy(() => import('./LeafStructureCrossSectionSim')),

  xylem_water_movement: lazy(() => import('./XylemWaterMovementSim')),
  xylem_water_movement_sim: lazy(() => import('./XylemWaterMovementSim')),
  bio_xylem_water_movement: lazy(() => import('./XylemWaterMovementSim')),
  bio_xylem_water_movement_sim: lazy(() => import('./XylemWaterMovementSim')),
  xylem_movement: lazy(() => import('./XylemWaterMovementSim')),
  bio_xylem_movement: lazy(() => import('./XylemWaterMovementSim')),

  plant_transpiration_rate: lazy(() => import('./PlantTranspirationRateSim')),
  plant_transpiration_rate_sim: lazy(() => import('./PlantTranspirationRateSim')),
  bio_plant_transpiration_rate: lazy(() => import('./PlantTranspirationRateSim')),
  bio_plant_transpiration_rate_sim: lazy(() => import('./PlantTranspirationRateSim')),
  transpiration_sim: lazy(() => import('./PlantTranspirationRateSim')),
  bio_transpiration_sim: lazy(() => import('./PlantTranspirationRateSim')),
  transpiration_rate: lazy(() => import('./PlantTranspirationRateSim')),

  // Topic 3: Cell Structure and Specialization
  microscope_magnification_explorer: lazy(() => import('./MicroscopeMagnificationSim')),
  microscope_magnification_sim: lazy(() => import('./MicroscopeMagnificationSim')),
  bio_microscope_magnification: lazy(() => import('./MicroscopeMagnificationSim')),
  microscope_explorer: lazy(() => import('./MicroscopeMagnificationSim')),
  bio_microscope_explorer: lazy(() => import('./MicroscopeMagnificationSim')),

  specialized_cells_adaptations: lazy(() => import('./SpecializedCellsAdaptationsSim')),
  specialized_cells_adaptations_sim: lazy(() => import('./SpecializedCellsAdaptationsSim')),
  bio_specialized_cells_adaptations: lazy(() => import('./SpecializedCellsAdaptationsSim')),
  specialized_cells: lazy(() => import('./SpecializedCellsAdaptationsSim')),
  bio_specialized_cells: lazy(() => import('./SpecializedCellsAdaptationsSim')),

  cell_organelles_function: lazy(() => import('./CellOrganellesFunctionSim')),
  cell_organelles_function_sim: lazy(() => import('./CellOrganellesFunctionSim')),
  bio_cell_organelles_function: lazy(() => import('./CellOrganellesFunctionSim')),
  organelle_function: lazy(() => import('./CellOrganellesFunctionSim')),
  bio_organelle_function: lazy(() => import('./CellOrganellesFunctionSim')),

  // Topic 4: Chemicals of Life
  food_tests_laboratory: lazy(() => import('./FoodTestsLaboratorySim')),
  food_tests_laboratory_sim: lazy(() => import('./FoodTestsLaboratorySim')),
  bio_food_tests_laboratory: lazy(() => import('./FoodTestsLaboratorySim')),
  food_tests: lazy(() => import('./FoodTestsLaboratorySim')),

  enzyme_lock_and_key: lazy(() => import('./EnzymeLockAndKeySim')),
  enzyme_lock_and_key_sim: lazy(() => import('./EnzymeLockAndKeySim')),
  bio_enzyme_lock_and_key: lazy(() => import('./EnzymeLockAndKeySim')),
  lock_and_key_sim: lazy(() => import('./EnzymeLockAndKeySim')),

  enzyme_temperature_activity: lazy(() => import('./EnzymeTemperatureActivitySim')),
  enzyme_temperature_activity_sim: lazy(() => import('./EnzymeTemperatureActivitySim')),
  bio_enzyme_temperature_activity: lazy(() => import('./EnzymeTemperatureActivitySim')),
  enzyme_temperature_sim: lazy(() => import('./EnzymeTemperatureActivitySim')),

  // Topic 5: Plant Nutrition and Photosynthesis
  photosynthesis_inputs_outputs: lazy(() => import('./PhotosynthesisInputsOutputsSim')),
  photosynthesis_inputs_outputs_sim: lazy(() => import('./PhotosynthesisInputsOutputsSim')),
  bio_photosynthesis_inputs_outputs: lazy(() => import('./PhotosynthesisInputsOutputsSim')),
  photosynthesis_inputs: lazy(() => import('./PhotosynthesisInputsOutputsSim')),

  leaf_starch_test_experiment: lazy(() => import('./LeafStarchTestExperimentSim')),
  leaf_starch_test_experiment_sim: lazy(() => import('./LeafStarchTestExperimentSim')),
  bio_leaf_starch_test_experiment: lazy(() => import('./LeafStarchTestExperimentSim')),
  leaf_starch_test: lazy(() => import('./LeafStarchTestExperimentSim')),

  light_intensity_photosynthesis: lazy(() => import('./LightIntensityPhotosynthesisSim')),
  light_intensity_photosynthesis_sim: lazy(() => import('./LightIntensityPhotosynthesisSim')),
  bio_light_intensity_photosynthesis: lazy(() => import('./LightIntensityPhotosynthesisSim')),
  light_intensity_sim: lazy(() => import('./LightIntensityPhotosynthesisSim')),

  // Topic 6: Plant Transport
  root_water_absorption_osmosis: lazy(() => import('./RootWaterAbsorptionOsmosisSim')),
  root_water_absorption_osmosis_sim: lazy(() => import('./RootWaterAbsorptionOsmosisSim')),
  bio_root_water_absorption_osmosis: lazy(() => import('./RootWaterAbsorptionOsmosisSim')),
  root_water_absorption: lazy(() => import('./RootWaterAbsorptionOsmosisSim')),

  xylem_phloem_transport: lazy(() => import('./XylemPhloemTransportSim')),
  xylem_phloem_transport_sim: lazy(() => import('./XylemPhloemTransportSim')),
  bio_xylem_phloem_transport: lazy(() => import('./XylemPhloemTransportSim')),
  xylem_vs_phloem: lazy(() => import('./XylemPhloemTransportSim')),

  transpiration_pull_cohesion: lazy(() => import('./TranspirationPullCohesionSim')),
  transpiration_pull_cohesion_sim: lazy(() => import('./TranspirationPullCohesionSim')),
  bio_transpiration_pull_cohesion: lazy(() => import('./TranspirationPullCohesionSim')),
  cohesion_tension_sim: lazy(() => import('./TranspirationPullCohesionSim')),

  // Topic 7: Plant Gaseous Exchange and Respiration
  stomatal_opening_mechanism: lazy(() => import('./StomatalOpeningMechanismSim')),
  stomatal_opening_mechanism_sim: lazy(() => import('./StomatalOpeningMechanismSim')),
  bio_stomatal_opening_mechanism: lazy(() => import('./StomatalOpeningMechanismSim')),
  stomatal_mechanism: lazy(() => import('./StomatalOpeningMechanismSim')),

  plant_respiration_pathways: lazy(() => import('./PlantRespirationPathwaysSim')),
  plant_respiration_pathways_sim: lazy(() => import('./PlantRespirationPathwaysSim')),
  bio_plant_respiration_pathways: lazy(() => import('./PlantRespirationPathwaysSim')),
  aerobic_vs_anaerobic_plants: lazy(() => import('./PlantRespirationPathwaysSim')),

  leaf_gas_exchange_day_night: lazy(() => import('./LeafGasExchangeDayNightSim')),
  leaf_gas_exchange_day_night_sim: lazy(() => import('./LeafGasExchangeDayNightSim')),
  bio_leaf_gas_exchange_day_night: lazy(() => import('./LeafGasExchangeDayNightSim')),
  compensation_point_sim: lazy(() => import('./LeafGasExchangeDayNightSim')),

  // Topic 8: Animal Nutrition and Feeding Adaptations
  insect_mouthparts_adaptations: lazy(() => import('./InsectMouthpartsAdaptationsSim')),
  insect_mouthparts_adaptations_sim: lazy(() => import('./InsectMouthpartsAdaptationsSim')),
  bio_insect_mouthparts_adaptations: lazy(() => import('./InsectMouthpartsAdaptationsSim')),
  insect_mouthparts: lazy(() => import('./InsectMouthpartsAdaptationsSim')),

  bird_beaks_feeding_adaptations: lazy(() => import('./BirdBeaksFeedingAdaptationsSim')),
  bird_beaks_feeding_adaptations_sim: lazy(() => import('./BirdBeaksFeedingAdaptationsSim')),
  bio_bird_beaks_feeding_adaptations: lazy(() => import('./BirdBeaksFeedingAdaptationsSim')),
  bird_beaks_sim: lazy(() => import('./BirdBeaksFeedingAdaptationsSim')),

  feeding_adaptations_ecology: lazy(() => import('./FeedingAdaptationsEcologySim')),
  feeding_adaptations_ecology_sim: lazy(() => import('./FeedingAdaptationsEcologySim')),
  bio_feeding_adaptations_ecology: lazy(() => import('./FeedingAdaptationsEcologySim')),
  herbivore_vs_carnivore_dentition: lazy(() => import('./FeedingAdaptationsEcologySim')),

  // Topic 9: Animal Transport
  double_circulation_pathways: lazy(() => import('./DoubleCirculationPathwaysSim')),
  double_circulation_pathways_sim: lazy(() => import('./DoubleCirculationPathwaysSim')),
  bio_double_circulation_pathways: lazy(() => import('./DoubleCirculationPathwaysSim')),
  double_circulation: lazy(() => import('./DoubleCirculationPathwaysSim')),

  mammalian_heart_structure: lazy(() => import('./MammalianHeartStructureSim')),
  mammalian_heart_structure_sim: lazy(() => import('./MammalianHeartStructureSim')),
  bio_mammalian_heart_structure: lazy(() => import('./MammalianHeartStructureSim')),
  heart_structure_sim: lazy(() => import('./MammalianHeartStructureSim')),

  blood_components_functions: lazy(() => import('./BloodComponentsFunctionsSim')),
  blood_components_functions_sim: lazy(() => import('./BloodComponentsFunctionsSim')),
  bio_blood_components_functions: lazy(() => import('./BloodComponentsFunctionsSim')),
  blood_components: lazy(() => import('./BloodComponentsFunctionsSim')),

  // Topic 10: Animal Gaseous Exchange and Respiration
  human_respiratory_system: lazy(() => import('./HumanRespiratorySystemSim')),
  human_respiratory_system_sim: lazy(() => import('./HumanRespiratorySystemSim')),
  bio_human_respiratory_system: lazy(() => import('./HumanRespiratorySystemSim')),
  breathing_mechanism_sim: lazy(() => import('./HumanRespiratorySystemSim')),

  alveolus_capillary_gas_exchange: lazy(() => import('./AlveolusCapillaryGasExchangeSim')),
  alveolus_capillary_gas_exchange_sim: lazy(() => import('./AlveolusCapillaryGasExchangeSim')),
  bio_alveolus_capillary_gas_exchange: lazy(() => import('./AlveolusCapillaryGasExchangeSim')),
  alveolar_gas_exchange: lazy(() => import('./AlveolusCapillaryGasExchangeSim')),

  breathing_vs_cellular_respiration: lazy(() => import('./BreathingVsRespirationComparisonSim')),
  breathing_vs_cellular_respiration_sim: lazy(() => import('./BreathingVsRespirationComparisonSim')),
  bio_breathing_vs_cellular_respiration: lazy(() => import('./BreathingVsRespirationComparisonSim')),
  breathing_vs_respiration: lazy(() => import('./BreathingVsRespirationComparisonSim')),
};

export default function SimulationWidgetFactory({ archetype, simulationKey, config = {}, title = '', onTelemetry }) {
  // Check if this simulation specifies an external PhET HTML5 URL
  const rawPhetUrl = config?.external_url || config?.url;
  const phetUrl = normalizePhetUrl(rawPhetUrl);

  if (phetUrl) {
    return (
      <PhetSimulationRunner
        url={phetUrl}
        title={title}
        config={config}
        onTelemetry={onTelemetry}
      />
    );
  }

  const norm = (str) => (str || '').trim().toLowerCase().replace(/-/g, '_');
  const aKey = norm(archetype);
  const sKey = norm(simulationKey);
  const targetKey = aKey || sKey;

  let SelectedWidget = simulationRegistry[targetKey] || simulationRegistry[aKey] || simulationRegistry[sKey];

  if (!SelectedWidget && targetKey) {
    const stripped = targetKey.replace(/^(phys_|chem_|math_)/, '');
    SelectedWidget =
      simulationRegistry[stripped] ||
      simulationRegistry[`phys_${stripped}`] ||
      simulationRegistry[`chem_${stripped}`] ||
      simulationRegistry[`math_${stripped}`];
  }

  // Fallback match by key containment
  if (!SelectedWidget && targetKey) {
    const matchedKey = Object.keys(simulationRegistry).find(
      (k) => k === targetKey || (targetKey.length > 5 && (targetKey.includes(k) || k.includes(targetKey)))
    );
    if (matchedKey) {
      SelectedWidget = simulationRegistry[matchedKey];
    }
  }

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
