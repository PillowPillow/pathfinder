<!--
Sync Impact Report
==================
Version Change: Initial → 1.0.0
Type: MAJOR (Initial ratification)

Modified Principles:
- PRINCIPLE_1: Test-First Development (TDD MANDATORY)
- PRINCIPLE_2: SOLID Principles (NON-NEGOTIABLE)
- PRINCIPLE_3: DRY & Code Reuse
- PRINCIPLE_4: Domain-Driven Design (DDD)
- PRINCIPLE_5: Code Quality Gates
- PRINCIPLE_6: User Experience Consistency
- PRINCIPLE_7: Performance Requirements

Added Sections:
- Testing Standards (comprehensive test strategy)
- Development Workflow (gates and process)
- Governance (amendment and compliance)

Removed Sections: N/A (initial creation)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section verified compatible
✅ spec-template.md - User stories and acceptance scenarios align
✅ tasks-template.md - Test-first task ordering verified

Follow-up TODOs:
- Establish baseline performance metrics for production deployment
- Define specific accessibility standards (WCAG level) if web-based
-->

# Pathfinder Constitution

## Core Principles

### I. Test-First Development (TDD MANDATORY)

**Tests MUST be written before implementation code.**

- All features begin with failing tests (Red-Green-Refactor cycle)
- Contract tests MUST be written for all public APIs and module boundaries
- Integration tests MUST be written for critical user journeys
- Unit tests MUST cover business logic and domain models
- Tests are not optional; they are part of the definition of "done"
- Implementation without tests is considered incomplete

**Rationale**: Test-first ensures clear requirements, prevents regression, enables
confident refactoring, and serves as executable documentation. This is the
foundation of quality software and is non-negotiable.

### II. SOLID Principles (NON-NEGOTIABLE)

**All code MUST adhere to SOLID design principles.**

- **Single Responsibility**: Each class/module has exactly one reason to change
- **Open/Closed**: Open for extension, closed for modification (use composition,
  strategy pattern, dependency injection)
- **Liskov Substitution**: Derived types must be substitutable for base types
  without breaking functionality
- **Interface Segregation**: Many specific interfaces are better than one
  general-purpose interface
- **Dependency Inversion**: Depend on abstractions (interfaces), not concrete
  implementations

**Rationale**: SOLID principles create maintainable, testable, and scalable code.
They reduce coupling, increase cohesion, and enable parallel development. Code
reviews MUST verify SOLID compliance.

### III. DRY & Code Reuse

**Don't Repeat Yourself - Duplication is a defect.**

- Abstract common functionality into reusable components
- Duplicate code blocks (>3 lines repeated >2 times) MUST be refactored
- Use inheritance, composition, or utility functions to eliminate duplication
- Configuration and constants MUST be centralized (no magic numbers/strings)
- Shared logic MUST live in domain services or utility modules

**Rationale**: Duplication multiplies bugs, maintenance burden, and
inconsistency. DRY reduces cognitive load and ensures single source of truth.

### IV. Domain-Driven Design (DDD)

**Business logic MUST be organized around domain concepts.**

- **Domain Layer**: Core business entities (Character, Ability, Skill, etc.)
  with no infrastructure dependencies
- **Application Layer**: Use cases and orchestration (character creation flow,
  leveling up, combat resolution)
- **Infrastructure Layer**: Persistence, external APIs, frameworks
- **Ubiquitous Language**: Code MUST use Pathfinder terminology (Ability Score,
  Modifier, Saving Throw, etc.)
- **Bounded Contexts**: Clear separation between distinct domains (character
  management, combat, spell management)
- **Aggregate Roots**: Enforce invariants within domain aggregates (e.g.,
  Character is the root for ability scores, skills, feats)

**Rationale**: DDD aligns code with business domain, making it intuitive for
domain experts and maintainable by developers. Clear boundaries reduce
complexity and enable modular evolution.

### V. Code Quality Gates

**Code MUST pass automated quality checks before merge.**

- **Linting**: No linter errors or warnings (zero-tolerance policy)
- **Formatting**: Consistent code formatting enforced by tooling (Prettier,
  Black, rustfmt, etc.)
- **Type Safety**: Strict type checking enabled (TypeScript strict mode, mypy
  strict, etc.)
- **Complexity**: Cyclomatic complexity ≤10 per function/method
- **Coverage**: Test coverage ≥80% for domain logic, ≥60% overall
- **Documentation**: Public APIs MUST have clear docstrings/comments

**Rationale**: Automated quality gates catch issues early, enforce consistency,
and reduce code review burden. Quality is not subjective; it's measured.

### VI. User Experience Consistency

**UI and interactions MUST be predictable and consistent.**

- **Design System**: Use consistent colors, typography, spacing, and components
- **Accessibility**: Keyboard navigation, screen reader support, ARIA labels
  where applicable
- **Error Handling**: Clear, actionable error messages (never expose technical
  details to users)
- **Feedback**: Loading states, success/error notifications, progress indicators
- **Responsive Design**: Adapt to different screen sizes gracefully
- **Pathfinder Terminology**: Use official game terms consistently (no made-up
  abbreviations)

**Rationale**: Consistency reduces cognitive load, builds user trust, and makes
the application accessible to all users. UX is not cosmetic; it's functional.

### VII. Performance Requirements

**Application MUST meet defined performance standards.**

- **Response Time**: UI interactions respond within 100ms (perceived instant)
- **Data Operations**: Character load/save operations complete within 500ms
- **Calculations**: Ability modifier, skill checks, combat calculations complete
  within 50ms
- **Startup Time**: Application ready within 2 seconds
- **Memory**: Stay within reasonable bounds (no memory leaks, efficient data
  structures)
- **Optimization**: Measure before optimizing (no premature optimization)

**Rationale**: Poor performance degrades UX and limits scalability. Performance
is a feature, not an afterthought. Measure, set targets, and validate.

## Testing Standards

### Test Pyramid Structure

**Maintain appropriate balance across test types.**

- **Unit Tests (70%)**: Fast, isolated tests of business logic and domain models
- **Integration Tests (20%)**: Test interactions between components and modules
- **Contract Tests (10%)**: Verify API boundaries and module interfaces

### Test Requirements by Layer

**Domain Layer**:
- MUST have 90%+ unit test coverage
- Test all business rules, calculations, and invariants
- Example: Ability score modifier calculations, saving throw bonuses

**Application Layer**:
- MUST have integration tests for all use cases
- Test orchestration and workflow logic
- Example: Character creation flow, level-up process

**Infrastructure Layer**:
- MUST have contract tests for external boundaries
- Mock external dependencies in integration tests
- Example: Persistence layer, API endpoints (if applicable)

### Test Quality Standards

- Tests MUST be deterministic (no flaky tests)
- Tests MUST run in isolation (no shared state)
- Tests MUST have clear arrange-act-assert structure
- Tests MUST use descriptive names explaining what/why
- Tests MUST fail with clear, actionable error messages

## Development Workflow

### Feature Development Process

1. **Requirements**: Clear acceptance criteria in spec.md
2. **Design**: Domain model and architecture in plan.md
3. **Test First**: Write failing tests (contract → integration → unit)
4. **Implement**: Write minimal code to pass tests
5. **Refactor**: Apply DRY and SOLID while keeping tests green
6. **Review**: Verify constitution compliance before merge

### Quality Gates (Blocking)

**No code may be merged until these gates pass:**

- ✅ All tests pass (100% pass rate)
- ✅ Test coverage meets thresholds (80% domain, 60% overall)
- ✅ Linter passes with zero errors/warnings
- ✅ Type checker passes (strict mode)
- ✅ Code review approved by at least one other developer
- ✅ No SOLID or DRY violations identified

### Complexity Management

**Complexity MUST be justified and documented.**

If any of these thresholds are exceeded, document justification in plan.md:

- More than 3 layers of abstraction
- Cyclomatic complexity >10
- Function/method >50 lines
- Class >300 lines
- File >500 lines

## Governance

### Amendment Procedure

**This constitution may be amended through the following process:**

1. Proposed amendment documented with rationale
2. Impact analysis across all templates and documentation
3. Approval required (team consensus or project owner)
4. Update constitution version (semantic versioning)
5. Propagate changes to dependent templates and documentation
6. Update `LAST_AMENDED_DATE` and increment `CONSTITUTION_VERSION`

### Versioning Policy

**Version format**: MAJOR.MINOR.PATCH

- **MAJOR**: Backward-incompatible changes (remove/redefine principles)
- **MINOR**: New principle added or material guidance expansion
- **PATCH**: Clarifications, wording improvements, non-semantic fixes

### Compliance and Review

- Constitution compliance MUST be verified during code review
- Violations MUST be documented and justified in complexity tracking table
- Quarterly constitution review to ensure relevance and effectiveness
- Team retrospectives SHOULD identify process improvements

### Enforcement

**This constitution supersedes all other practices and conventions.**

- PRs violating principles without justified complexity entry will be rejected
- Accumulated technical debt (deferred complexity) MUST be tracked and addressed
- Team members are expected to hold each other accountable to these standards

**Version**: 1.0.0 | **Ratified**: 2025-11-14 | **Last Amended**: 2025-11-14
