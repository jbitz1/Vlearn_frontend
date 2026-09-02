/**
 * Curriculum topics and grade-level segregation definitions for VLearn Simulations.
 * Strictly maps topics according to KCSE Secondary Curriculum (Form 1 - Form 4) and CBC (Grade 10).
 */

export const GRADE_CONFIG = [
  { id: 'ALL', name: 'All Grades & Forms' },
  { id: 'FORM_4', name: 'Form 4', badge: 'Form 4' },
  { id: 'FORM_3', name: 'Form 3', badge: 'Form 3' },
  { id: 'FORM_2', name: 'Form 2', badge: 'Form 2' },
  { id: 'FORM_1', name: 'Form 1', badge: 'Form 1' },
  { id: 'GRADE_10', name: 'Grade 10 (CBC)', badge: 'Grade 10' },
];

export const CURRICULUM_STRUCTURE = {
  CHEMISTRY: {
    FORM_3: [
      {
        id: 1,
        title: 'Gas Laws',
        form: 'Form 3',
        simKeys: [
          'charles_law',
          'boyles_law',
          'grahams_law',
          'chem_charles_law',
          'chem_charles_law_guided',
          'charles_law_guided',
          'chem_boyles_law',
          'chem_grahams_law',
          'chem_grahams_law_diffusion',
          'grahams_law_diffusion',
        ],
      },
      {
        id: 2,
        title: 'The Mole: Formulae and Chemical Equations',
        form: 'Form 3',
        simKeys: [
          'chem_titration_volumetric_analysis',
          'titration_volumetric_analysis',
          'titration_lab',
          'titration',
          'chem_titration',
          'volumetric_analysis',
        ],
      },
      {
        id: 3,
        title: 'Organic Chemistry I (Aliphatic Hydrocarbons)',
        form: 'Form 3',
        simKeys: [],
      },
      {
        id: 4,
        title: 'Nitrogen and its Compounds',
        form: 'Form 3',
        simKeys: [],
      },
      {
        id: 5,
        title: 'Sulphur and its Compounds',
        form: 'Form 3',
        simKeys: [],
      },
      {
        id: 6,
        title: 'Chlorine and its Compounds',
        form: 'Form 3',
        simKeys: [],
      },
    ],
    FORM_4: [
      {
        id: 1,
        title: 'Acids, Bases and Salts',
        form: 'Form 4',
        simKeys: [
          'chem_acid_base_dissociation',
          'acid_base_dissociation',
          'acid_base',
          'chem_salts_solubility_precipitation',
          'salt_solubility_precipitation',
        ],
      },
      {
        id: 2,
        title: 'Energy Changes in Chemical and Physical Processes',
        form: 'Form 4',
        simKeys: [
          'chem_hess_law_pathways',
          'hess_law_pathways',
          'chem_heat_of_solution_pack',
          'heat_of_solution_pack',
        ],
      },
      {
        id: 3,
        title: 'Reaction Rates and Reversible Reactions',
        form: 'Form 4',
        simKeys: [
          'chem_collision_theory_kinetics',
          'collision_theory_kinetics',
          'reaction_rate',
          'chem_haber_process_optimizer',
          'chemical_equilibrium',
          'chemical',
        ],
      },
      {
        id: 4,
        title: 'Electrochemistry',
        form: 'Form 4',
        simKeys: [
          'chem_electrode_potential_explorer',
          'electrode_potential_explorer',
          'chem_preferential_discharge',
          'preferential_discharge',
          'chem_electroplating',
          'electroplating',
          'chem_voltaic_cell_flow',
          'electrolysis',
        ],
      },
      {
        id: 5,
        title: 'Metals',
        form: 'Form 4',
        simKeys: [
          'chem_activity_series_displacement',
          'chem_metal_reactivity_series',
          'metal_reactivity_series',
        ],
      },
      {
        id: 6,
        title: 'Organic Chemistry II (Alkanols and Alkanoic Acids)',
        form: 'Form 4',
        simKeys: [
          'chem_soap_micelle_action',
          'soap_micelle_action',
          'chem_functional_group_tests',
          'functional_group_tests',
        ],
      },
      {
        id: 7,
        title: 'Radioactivity',
        form: 'Form 4',
        simKeys: [
          'chem_radioactive_decay_half_life',
          'radioactive_decay_half_life',
          'chem_nuclear_fission_chain_reaction',
          'nuclear_fission_chain_reaction',
        ],
      },
    ],
    FORM_2: [
      { id: 1, title: 'Structure of the Atom & Periodic Table', form: 'Form 2', simKeys: [] },
      { id: 2, title: 'Chemical Families: Patterns and Properties', form: 'Form 2', simKeys: [] },
      { id: 3, title: 'Structure and Bonding', form: 'Form 2', simKeys: [] },
      { id: 4, title: 'Salts (Introductory Preparation)', form: 'Form 2', simKeys: [] },
      { id: 5, title: 'Effect of an Electric Current on Substances', form: 'Form 2', simKeys: ['electrolysis'] },
      { id: 6, title: 'Carbon and its Compounds', form: 'Form 2', simKeys: [] },
    ],
    FORM_1: [
      { id: 1, title: 'Introduction to Chemistry', form: 'Form 1', simKeys: [] },
      { id: 2, title: 'Simple Classification of Substances', form: 'Form 1', simKeys: [] },
      { id: 3, title: 'Acids, Bases and Indicators', form: 'Form 1', simKeys: [] },
      { id: 4, title: 'Air and Combustion', form: 'Form 1', simKeys: [] },
      { id: 5, title: 'Water and Hydrogen', form: 'Form 1', simKeys: [] },
    ],
    GRADE_10: [
      { id: 1, title: 'Introduction to Chemistry', form: 'Grade 10', simKeys: [] },
      { id: 2, title: 'The Atom & Periodic Table', form: 'Grade 10', simKeys: [] },
      { id: 3, title: 'Chemical Bonding & Periodicity', form: 'Grade 10', simKeys: [] },
      { id: 4, title: 'Acids and Bases', form: 'Grade 10', simKeys: ['chem_acid_base_dissociation'] },
      { id: 5, title: 'Introduction to Salts', form: 'Grade 10', simKeys: ['chem_salts_solubility_precipitation'] },
      { id: 6, title: 'Introductory Organic Chemistry', form: 'Grade 10', simKeys: [] },
    ],
  },
  PHYSICS: {
    FORM_4: [
      { id: 1, title: 'Thin Lenses & Optical Instruments', form: 'Form 4', simKeys: ['optics', 'thin_lens', 'thin_lens_ray_tracing'] },
      { id: 2, title: 'Uniform Circular Motion', form: 'Form 4', simKeys: [] },
      { id: 3, title: 'Floating and Sinking', form: 'Form 4', simKeys: [] },
      { id: 4, title: 'Electromagnetic Spectrum', form: 'Form 4', simKeys: [] },
      { id: 5, title: 'Electromagnetic Induction', form: 'Form 4', simKeys: [] },
      { id: 6, title: 'Mains Electricity', form: 'Form 4', simKeys: [] },
      { id: 7, title: 'Cathode Rays & CRTs', form: 'Form 4', simKeys: ['crt', 'crt_electron', 'cathode_ray', 'cathode_ray_oscilloscope'] },
      { id: 8, title: 'X-Rays Production Mechanics', form: 'Form 4', simKeys: ['x_ray', 'xray', 'coolidge_xray'] },
      { id: 9, title: 'Photoelectric Effect', form: 'Form 4', simKeys: ['photoelectric', 'photoelectric_effect'] },
      { id: 10, title: 'Radioactivity & Nuclear Physics', form: 'Form 4', simKeys: ['radioactive_decay_half_life', 'chem_radioactive_decay_half_life'] },
      { id: 11, title: 'Electronics & Logic Gates', form: 'Form 4', simKeys: [] },
    ],
    FORM_3: [
      { id: 1, title: 'Linear Motion & Freefall', form: 'Form 3', simKeys: ['freefall'] },
      { id: 2, title: 'Refraction of Light', form: 'Form 3', simKeys: ['optics'] },
      { id: 3, title: 'Newton\'s Laws of Motion', form: 'Form 3', simKeys: [] },
      { id: 4, title: 'Work, Energy, Power & Machines', form: 'Form 3', simKeys: [] },
      { id: 5, title: 'Current Electricity & Circuit Builder', form: 'Form 3', simKeys: ['circuit'] },
      { id: 6, title: 'Waves II', form: 'Form 3', simKeys: [] },
      { id: 7, title: 'Electrostatics II', form: 'Form 3', simKeys: [] },
      { id: 8, title: 'Heating Effect of Electric Current', form: 'Form 3', simKeys: [] },
      { id: 9, title: 'Quantity of Heat', form: 'Form 3', simKeys: [] },
      { id: 10, title: 'Gas Laws (Thermal Expansion)', form: 'Form 3', simKeys: ['charles_law', 'boyles_law'] },
    ],
  },
  MATHEMATICS: {
    FORM_4: [
      { id: 1, title: 'Matrix and Transformations', form: 'Form 4', simKeys: ['math_matrix_transformation', 'matrix_transformation'] },
      { id: 2, title: 'Statistics II (Ogive Explorer)', form: 'Form 4', simKeys: ['math_statistics_ogive_explorer', 'ogive_explorer'] },
      { id: 3, title: 'Three Dimensional Geometry', form: 'Form 4', simKeys: ['math_3d_geometry_explorer', 'three_d_geometry'] },
      { id: 4, title: 'Trigonometry III (Waves & Graphs)', form: 'Form 4', simKeys: ['math_trigonometry_wave_explorer', 'trigonometry_wave'] },
      { id: 5, title: 'Longitudes and Latitudes (Earth Globe)', form: 'Form 4', simKeys: ['math_earth_globe_explorer', 'earth_globe'] },
      { id: 6, title: 'Linear Programming', form: 'Form 4', simKeys: ['math_linear_programming_explorer', 'linear_programming'] },
      { id: 7, title: 'Loci and Geometric Construction', form: 'Form 4', simKeys: ['math_loci_construction_explorer', 'loci_construction'] },
      { id: 8, title: 'Calculus: Differentiation', form: 'Form 4', simKeys: ['math_differentiation_explorer', 'differentiation'] },
      { id: 9, title: 'Calculus: Integration', form: 'Form 4', simKeys: ['math_integration_explorer', 'integration'] },
      { id: 10, title: 'Area Approximations (Trapezoidal Rule)', form: 'Form 4', simKeys: ['math_area_approximation_explorer', 'area_approximation'] },
    ],
  },
};

/**
 * Filter and group simulations according to the selected subject and grade/form.
 */
export function getStructuredCurriculumGroups(simulations, selectedSubject, selectedGrade) {
  const subjects = selectedSubject === 'ALL'
    ? ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'MATHEMATICS']
    : [selectedSubject];

  const results = [];

  subjects.forEach((subKey) => {
    const subStructure = CURRICULUM_STRUCTURE[subKey];
    const subSimulations = simulations.filter((s) => s.subject === subKey);

    if (!subStructure) {
      if (subSimulations.length > 0) {
        results.push({
          subjectKey: subKey,
          isCustomCurriculum: false,
          items: subSimulations,
        });
      }
      return;
    }

    // Determine which forms to include
    const formsToInclude = selectedGrade === 'ALL'
      ? Object.keys(subStructure)
      : subStructure[selectedGrade]
      ? [selectedGrade]
      : [];

    const formGroups = [];

    formsToInclude.forEach((formKey) => {
      const topics = subStructure[formKey] || [];
      const formLabel = GRADE_CONFIG.find((g) => g.id === formKey)?.name || formKey;

      const populatedTopics = topics.map((topic) => {
        // Find matching simulations by key, archetype, or exact topic match
        const matchingSims = subSimulations.filter((sim) => {
          const simKey = (sim.key || '').toLowerCase();
          const simArchetype = (sim.archetype || '').toLowerCase();
          const simTopic = (sim.topic || '').toLowerCase();
          const topicTitle = topic.title.toLowerCase();

          // Check explicit key match
          if (topic.simKeys.some((k) => k.toLowerCase() === simKey || k.toLowerCase() === simArchetype)) {
            return true;
          }

          // Strict topic title match ONLY if no cross-grade ambiguity
          if (simTopic && (simTopic.includes(topicTitle) || topicTitle.includes(simTopic))) {
            return true;
          }

          return false;
        });

        // Deduplicate simulations
        const uniqueSims = [];
        const seen = new Set();
        matchingSims.forEach((item) => {
          const id = item.key || item.id;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueSims.push(item);
          }
        });

        return {
          ...topic,
          items: uniqueSims,
        };
      });

      const totalActive = populatedTopics.reduce((acc, t) => acc + t.items.length, 0);

      formGroups.push({
        formKey,
        formLabel,
        topics: populatedTopics,
        totalActive,
      });
    });

    if (formGroups.length > 0) {
      results.push({
        subjectKey: subKey,
        isCustomCurriculum: true,
        formGroups,
        totalItems: subSimulations.length,
      });
    }
  });

  return results;
}
