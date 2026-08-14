# Navigation loader hotfix

This branch isolates the global route-transition loading-state cleanup from the Hallmark homepage preview.

- Production `main` is untouched until explicit merge approval.
- The old root `src/app/loading.tsx` dashboard skeleton (Session / Drivers / Timing / Control / Loading Table) is replaced by a minimal LAPMETRY transition state.
- Homepage layout and circuit rendering are intentionally not changed in this branch.
