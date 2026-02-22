# EcoEquivalencias Data Roadmap (Scientific Hardening)

## Goal
Build a scientifically defensible dataset for resources and eco-equivalences with:
- explicit provenance for every factor
- reproducible formulas
- confidence scoring and notes
- periodic update workflow

## Current State (as of 2026-02-22)
- Data model supports versioning, sources, and many-to-many citations.
- Seed currently mixes robust and demo factors.
- Mobile fallback catalog was expanded, but not fully source-hardened yet.

## Primary Sources (priority order)
1. US EPA GHG Equivalencies Calculator (methods + factors)
2. US EPA WARM (material-specific waste/recycling factors)
3. UK DESNZ/DEFRA Conversion Factors (full + methodology)
4. IPCC 2006 Guidelines (default emission factor methodology)
5. Chile official electricity emission factor indicator (for regionalized electricity factors)

## Source Links
- EPA GHG Calculator:
  - https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
  - https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references
- EPA WARM:
  - https://www.epa.gov/waste-reduction-model/basic-information-about-waste-reduction-model
  - https://www.epa.gov/waste-reduction-model/documentation-chapters-greenhouse-gas-emission-energy-and-economic-factors
- UK Conversion Factors (2025):
  - https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025
- IPCC 2006 Guidelines (Volume 2, combustion):
  - https://www.ipcc-nggip.iges.or.jp/public/2006gl//pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf
- Chile electricity factor:
  - https://www.energia.gob.cl/indicadores-ambientales-factor-de-emisiones-gei-del-sistema-electrico-nacional

## Target Dataset Expansion
- Resources:
  - from current demo set to >= 60 source-backed resources
  - include subtypes/material grades and practical units (kg, item, liter/container, etc.)
- Equivalences:
  - from current 30 to >= 120 source-backed equivalences
  - grouped by transport, energy, waste, household, water, food, and nature

## Data Quality Rules
1. Every resource and equivalence must have >= 1 citation in `sources`.
2. Every factor must include method note in `explanation`/`notes`.
3. Keep unit conversion explicit in `resource_units.to_base_factor`.
4. No silent hardcoded demo factors in published version.
5. Confidence must be one of: `high`, `medium`, `low` with rationale.

## Implementation Plan
### Phase 1: Methodology Lock
- Define standard method per category:
  - Waste/material factors from WARM
  - Electricity and transport from EPA/DEFRA
  - Region-specific electricity (Chile optional profile)
- Output: method matrix in docs + factor mapping table

### Phase 2: Source-Hardened Seed v2
- Build new seed (or migration + seed) with:
  - expanded `sources`
  - expanded `resources` + `resource_units`
  - expanded `equivalences` + `equivalence_sources`
- Output: SQL dataset importable in Supabase

### Phase 3: Validation + Consistency Checks
- Add SQL checks and test script:
  - rows without citation
  - duplicate slugs by version
  - invalid unit factors
  - suspicious numeric ranges
- Output: repeatable validation report

### Phase 4: Release Protocol
- Add update workflow:
  - yearly source refresh
  - diff report by factor changes
  - version publish checklist
- Output: operational process for long-term reliability

## Immediate Next Deliverable
Create `seed_v2.sql` with first robust increment:
- +25 resources
- +60 equivalences
- all with real citations and confidence notes
