# Graph Report - cami-engineering-challenge  (2026-11-07)

## Corpus Check
- Corpus is ~4,702 words - fits in a single context window. You may not need a graph.

## Summary
- 338 nodes · 448 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 90,768 input · 0 output

## Community Hubs (Navigation)
- API Requests Core
- API Dependencies
- Web Dependencies
- CI Workflow
- Project Docs & Architecture
- Docker Compose Services
- Root Workspace Config
- Web TS Config
- API TS Config
- Migrations & Seeding
- Web Pages & API Client
- Postgres DB Service
- Nest CLI Config
- API Build TSConfig
- Next Config

## God Nodes (most connected - your core abstractions)
1. `CustomerRequest` - 18 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 16 edges
4. `RequestNote` - 12 edges
5. `RequestsService` - 11 edges
6. `RequestsController` - 10 edges
7. `scripts` - 8 edges
8. `scripts` - 8 edges
9. `@nestjs/common` - 7 edges
10. `typeorm` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Task 4: Controller Structure (POST /requests/classify)` --references--> `apps/api (@cami/api, NestJS + TypeORM)`  [INFERRED]
  README.md → CLAUDE.md
- `Classification history scope section` --references--> `Task 5: Classification History (thin slice)`  [INFERRED]
  DECISIONS.md → README.md
- `Task 5: Classification History (thin slice)` --conceptually_related_to--> `Hand-written SQL Migrations (synchronize=false)`  [INFERRED]
  README.md → CLAUDE.md
- `Stretch 6: Persistence Boundary (repository/port seam)` --references--> `apps/api (@cami/api, NestJS + TypeORM)`  [INFERRED]
  README.md → CLAUDE.md
- `main()` --calls--> `createDataSource()`  [EXTRACTED]
  apps/api/src/run-migrations.ts → apps/api/src/data-source.ts

## Import Cycles
- 2-file cycle: `apps/api/src/requests/customer-request.entity.ts -> apps/api/src/requests/request-note.entity.ts -> apps/api/src/requests/customer-request.entity.ts`

## Hyperedges (group relationships)
- **Core challenge tasks (planted issues)** — readme_list_performance_task, readme_ui_freshness_task, readme_ci_task, readme_controller_structure_task, readme_classification_history_task [EXTRACTED 1.00]
- **Required submission artifacts checked by CI** — decisions_decisions_log, ai_usage_ai_usage_log, claude_ci_pipeline [EXTRACTED 1.00]
- **Adding a persisted entity (history slice) touches both configs + migration** — readme_classification_history_task, claude_dual_typeorm_config, claude_hand_written_migrations, claude_history_endpoint_stub [INFERRED 0.85]

## Communities (18 total, 4 thin omitted)

### Community 0 - "API Requests Core"
Cohesion: 0.07
Nodes (12): CustomerRequest, RequestStatus, ClassificationCategory, ClassificationResult, KeywordClassifier, RequestNote, RequestsController, RequestsModule (+4 more)

### Community 1 - "API Dependencies"
Cohesion: 0.06
Nodes (37): dependencies, @nestjs/common@^11.1.28, @nestjs/core@^11.1.28, @nestjs/platform-express@^11.2.8, @nestjs/typeorm@^11.0.3, pg@^8.22.0, reflect-metadata@^0.2.2, rxjs@^7.8.2 (+29 more)

### Community 2 - "Web Dependencies"
Cohesion: 0.07
Nodes (35): dependencies, next@^16.2.11, react@^19.2.8, react-dom@^19.2.8, @tanstack/react-query@^5.101.4, devDependencies, autoprefixer@^10.5.4, postcss@^8.5.22 (+27 more)

### Community 3 - "CI Workflow"
Cohesion: 0.07
Nodes (28): env, runs-on, services, steps, DATABASE_URL, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER (+20 more)

### Community 4 - "Project Docs & Architecture"
Cohesion: 0.10
Nodes (21): AI_USAGE.md (tools, corrections, rejections), Team AI workflow standards (optional stretch), apps/api (@cami/api, NestJS + TypeORM), CI Pipeline (npm ci, artifact checks, typecheck, test, migrate, build), GET /requests/history stub, KeywordClassifier, CLAUDE.md Project Guidance, QueryClient defaults (staleTime 10s, no refetch on focus) (+13 more)

### Community 5 - "Docker Compose Services"
Cohesion: 0.09
Nodes (22): build, depends_on, environment, ports, context, dockerfile, condition, db (+14 more)

### Community 6 - "Root Workspace Config"
Cohesion: 0.09
Nodes (21): engines, node, name, postcss, sharp, overrides, glob, next (+13 more)

### Community 7 - "Web TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "API TS Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+9 more)

### Community 9 - "Migrations & Seeding"
Cohesion: 0.19
Nodes (9): createDataSource(), InitialSchema1710000000000, main(), main(), MESSAGES, NOTE_BODIES, NoteRow, RequestRow (+1 more)

### Community 10 - "Web Pages & API Client"
Cohesion: 0.27
Nodes (11): HistoryPage(), HomePage(), STATUSES, classifyMessage(), CreatedRequest, createRequest(), fetchHistory(), fetchRequests() (+3 more)

### Community 11 - "Postgres DB Service"
Cohesion: 0.15
Nodes (13): environment, healthcheck, image, ports, volumes, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER (+5 more)

### Community 12 - "Nest CLI Config"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, tsConfigPath, $schema, sourceRoot

### Community 13 - "API Build TSConfig"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

## Knowledge Gaps
- **4 isolated node(s):** `./tsconfig.json`, `Task 1: List Performance (GET /requests N+1)`, `Task 2: UI Freshness (stale table after mutations)`, `CLAUDE.md Project Guidance`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 160 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomerRequest` connect `API Requests Core` to `Migrations & Seeding`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `./tsconfig.json`, `Task 1: List Performance (GET /requests N+1)`, `Task 2: UI Freshness (stale table after mutations)` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Requests Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06829573934837092 - nodes in this community are weakly interconnected._
- **Why does `typeorm` connect `Migrations & Seeding` to `API Requests Core`, `API Dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `API Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06039488966318235 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `API Requests Core` to `API Dependencies`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `Web Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07152496626180836 - nodes in this community are weakly interconnected._