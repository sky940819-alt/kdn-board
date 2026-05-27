import { useState } from 'react'
import type { ReactElement } from 'react'

/* ───────── 프론트엔드 트렌드 데이터 ───────── */
const FE_TRENDS = [
  {
    id: 'fe-1',
    tag: 'AI & DX',
    icon: '🤖',
    title: 'AI 주도 개발 (AI-Driven Development)',
    summary: 'Cursor, GitHub Copilot, Claude Code 등 AI 코드 어시스턴트가 개발 전 사이클에 통합',
    points: [
      '자동 컴포넌트 생성·리팩터링·테스트 코드 작성',
      'Prompt-first 개발 방식: 자연어로 요구사항 명세 → 코드 생성',
      'AI 리뷰어가 보안·성능 취약점 실시간 탐지',
      '디자인 시스템 토큰을 AI가 직접 소비해 UI 생성',
    ],
    terms: [
      { word: 'Vibe Coding', def: '자연어 프롬프트로 코드를 생성·수정하는 개발 스타일. 구현 세부보다 의도(intent)를 서술하는 것이 핵심.' },
      { word: 'AI Pair Programming', def: 'LLM이 개발자 옆에서 실시간으로 코드 제안·설명·리뷰를 수행하는 협업 방식.' },
      { word: 'Context Window', def: 'AI 모델이 한 번에 처리할 수 있는 토큰(단어) 수. 클수록 더 넓은 코드베이스를 이해.' },
      { word: 'MCP (Model Context Protocol)', def: 'Anthropic이 제안한 AI-도구 통합 표준. AI 모델이 파일시스템·API·DB 등 외부 도구에 접근하는 방식을 표준화.' },
    ],
  },
  {
    id: 'fe-2',
    tag: 'React Ecosystem',
    icon: '⚛️',
    title: 'React 19 & Server Components',
    summary: '서버·클라이언트 경계 재정의, Streaming SSR, Actions API로 풀스택 React 패러다임 전환',
    points: [
      'React Server Components(RSC): 서버에서만 렌더링, 클라이언트 JS 번들 제로',
      'Server Actions: 서버 함수를 클라이언트에서 직접 호출 (form action 포함)',
      'Partial Prerendering(PPR): 정적 쉘 + 스트리밍 동적 콘텐츠 혼합',
      'use() 훅: Promise·Context를 일급 객체로 렌더 트리 안에서 unwrap',
      'Next.js 15 — App Router 안정화, Turbopack 기본 번들러',
    ],
    terms: [
      { word: 'RSC (React Server Components)', def: '서버에서 실행되는 React 컴포넌트. useState/useEffect 사용 불가. 데이터 직접 조회 가능, 번들 크기 0.' },
      { word: 'Streaming SSR', def: 'HTML을 한 번에 보내지 않고 준비된 부분부터 점진적으로 클라이언트에 스트림하는 방식. TTFB 단축.' },
      { word: 'Hydration', def: '서버에서 만들어진 정적 HTML에 클라이언트 JS 이벤트를 연결하는 과정. Selective/Progressive Hydration이 최신 트렌드.' },
      { word: 'PPR (Partial Prerendering)', def: '한 URL에서 정적(ISG) 쉘과 동적 스트리밍 영역을 섞어 제공. Vercel·Netlify Edge에서 실행.' },
    ],
  },
  {
    id: 'fe-3',
    tag: 'Reactivity',
    icon: '⚡',
    title: 'Signals & Fine-grained Reactivity',
    summary: 'Virtual DOM 없이 정확한 DOM 노드만 업데이트하는 Signals 모델이 프레임워크 주류로 진입',
    points: [
      'SolidJS 2.0, Qwik 2.0, Angular 17+ Signals, Svelte 5 Runes',
      'Signal은 읽기·쓰기 분리된 반응형 원자(Atom); 구독 기반 자동 추적',
      'Virtual DOM diffing 없이 O(1) 수준의 DOM 업데이트 가능',
      'Effect, Computed(Derived) Signal로 사이드이펙트·파생값 선언',
    ],
    terms: [
      { word: 'Signal', def: '현재 값을 저장하고, 값 변경 시 구독자에게 자동 알림을 보내는 반응형 원시 타입. getter/setter 형태.' },
      { word: 'Fine-grained Reactivity', def: '컴포넌트 전체가 아닌 변경된 DOM 노드만 정확히 업데이트하는 방식. 불필요한 리렌더 제거.' },
      { word: 'Computed / Derived Signal', def: '다른 Signal 값에서 자동으로 계산되는 파생 Signal. 메모이제이션 내장.' },
      { word: 'Resumability', def: 'Qwik의 핵심 개념. 서버 상태를 직렬화해 클라이언트에서 Hydration 없이 즉시 재개.' },
    ],
  },
  {
    id: 'fe-4',
    tag: 'CSS & UI',
    icon: '🎨',
    title: 'CSS 현대화 & View Transitions',
    summary: 'JavaScript 없이 CSS 만으로 복잡한 레이아웃·애니메이션·상태를 처리하는 기능들이 브라우저 기본 탑재',
    points: [
      'CSS Anchor Positioning: 팝오버/툴팁 위치를 JS 없이 앵커 요소 기준으로 지정',
      'Container Queries (@container): 부모 크기 기반 반응형 (viewport 기반 탈피)',
      'CSS Nesting: SCSS 없이 네이티브 중첩 선택자 지원',
      'View Transitions API: 페이지/컴포넌트 전환 애니메이션 네이티브 지원',
      '@layer (Cascade Layers): 스타일 우선순위 계층 명시적 선언',
      ':has() 선택자: 부모를 자식 상태로 선택하는 역방향 CSS',
    ],
    terms: [
      { word: 'Container Queries', def: '요소 자신의 컨테이너 크기를 기준으로 스타일을 변경하는 CSS 기능. viewport 대신 구성요소 단위 반응형 설계.' },
      { word: 'View Transitions API', def: '동일 페이지 또는 다중 페이지 전환 시 두 상태 사이를 부드럽게 애니메이션하는 브라우저 네이티브 API.' },
      { word: 'CSS Anchor Positioning', def: '특정 요소(앵커)를 기준으로 절대 위치 요소를 배치하는 CSS 속성. JavaScript Popper.js 대체.' },
      { word: 'Cascade Layers (@layer)', def: 'CSS 우선순위 충돌을 명시적 레이어로 해결. 라이브러리 스타일 격리에 활용.' },
    ],
  },
  {
    id: 'fe-5',
    tag: 'Architecture',
    icon: '🏗️',
    title: 'Micro-Frontend & Module Federation',
    summary: '독립적으로 배포 가능한 프론트엔드 조각들을 런타임에 조합하는 아키텍처',
    points: [
      'Module Federation (Webpack 5 / Vite Plugin Federation): 빌드 결과물 런타임 공유',
      '팀별 독립 배포 사이클; 기술 스택 이기종 혼용 가능',
      'Shell App(Host) + Remote App(Micro-FE) 구조',
      '공유 의존성(React, ReactDOM) 단일 로딩으로 중복 방지',
      'Single-SPA, Nx Monorepo와 함께 엔터프라이즈 확장',
    ],
    terms: [
      { word: 'Module Federation', def: 'Webpack 5 기능. 여러 빌드에서 코드를 런타임에 동적으로 공유·소비. 별도 NPM 패키지 없이 원격 모듈 로드.' },
      { word: 'Shell Application', def: 'Micro-FE 아키텍처의 진입점. 라우팅, 공통 레이아웃, 인증 등 공유 기능 담당. Host라고도 함.' },
      { word: 'Remote Entry', def: 'Micro-FE 앱이 외부에 노출하는 진입점 파일(remoteEntry.js). 어떤 모듈을 공유할지 선언.' },
      { word: 'Nx Monorepo', def: '여러 앱·라이브러리를 단일 저장소에서 관리하는 도구. 의존 그래프 분석·캐싱·영향 범위 빌드 지원.' },
    ],
  },
  {
    id: 'fe-6',
    tag: 'Performance',
    icon: '🚀',
    title: 'Core Web Vitals & Edge Rendering',
    summary: 'Google 검색 순위 반영 성능 지표(CWV) 최적화와 CDN 엣지에서의 렌더링이 프로덕션 필수 요소로 정착',
    points: [
      'INP(Interaction to Next Paint) — 2024년 FID 대체, 모든 상호작용 응답성 측정',
      'LCP(Largest Contentful Paint) 최적화: fetchpriority="high", preload',
      'Cloudflare Workers / Vercel Edge Functions — 사용자 네트워크 경계에서 코드 실행',
      'ISR(Incremental Static Regeneration) + On-demand Revalidation',
      'Image 최적화: AVIF, WebP, next/image, Cloudinary',
    ],
    terms: [
      { word: 'Core Web Vitals (CWV)', def: 'Google이 정의한 핵심 사용자 경험 지표. LCP(로딩), INP(상호작용), CLS(레이아웃 안정성) 세 가지.' },
      { word: 'INP (Interaction to Next Paint)', def: '페이지 내 모든 클릭·키 입력·탭의 응답 시간 중 최대치. 200ms 이하가 Good.' },
      { word: 'Edge Runtime', def: '서버 대신 CDN PoP(접속점)에서 코드 실행. 지연 최소화. Node.js API 일부 제한(파일시스템 등).' },
      { word: 'ISR (Incremental Static Regeneration)', def: '정적 페이지를 배포 없이 주기적·요청 기반으로 재생성하는 Next.js 기능.' },
    ],
  },
  {
    id: 'fe-7',
    tag: 'TypeScript',
    icon: '🔷',
    title: 'TypeScript 5.x & 타입 안전성 강화',
    summary: 'TypeScript가 구문 표준화·성능 향상·DX 개선 방향으로 지속 진화',
    points: [
      'TC39 Decorators 표준화 (@decorator 문법 안정화)',
      'const Type Parameters: 제네릭 리터럴 타입 보존',
      'Variadic Tuple Types: 가변 길이 튜플 고급 타입',
      'satisfies 연산자: 타입 검사 + 타입 추론 동시',
      'Go 기반 TypeScript 컴파일러(tsc) 재작성 — 10× 성능 향상(2026 RC)',
    ],
    terms: [
      { word: 'Decorators (TC39)', def: '클래스·메서드·속성에 메타데이터/동작을 선언적으로 추가하는 문법. Angular·NestJS의 핵심. 2023년 Stage 3 확정.' },
      { word: 'satisfies 연산자', def: '값이 타입을 만족하는지 검사하면서도 더 좁은 타입 추론을 유지. as 캐스팅의 안전한 대안.' },
      { word: 'Template Literal Types', def: '문자열 리터럴을 조합해 타입을 만드는 TypeScript 기능. API 경로·이벤트명 등 정확한 타입 생성에 활용.' },
      { word: 'Type Narrowing', def: '조건문·타입 가드로 유니온 타입의 범위를 좁혀 안전하게 속성에 접근하는 패턴.' },
    ],
  },
  {
    id: 'fe-8',
    tag: 'WebAssembly',
    icon: '⚙️',
    title: 'WebAssembly (WASM) & 고성능 프론트엔드',
    summary: 'Rust·C++로 작성된 코드를 브라우저에서 네이티브에 가까운 성능으로 실행',
    points: [
      'Rust → wasm-pack → npm 패키지로 배포',
      'ffmpeg.wasm: 브라우저에서 동영상 인코딩/디코딩',
      'OpenCV.js, TensorFlow.js WASM 백엔드',
      'WASM Threads + SharedArrayBuffer: 멀티스레드 병렬 처리',
      'WASI (WebAssembly System Interface): 서버·CLI에서도 WASM 실행',
    ],
    terms: [
      { word: 'WebAssembly (WASM)', def: '브라우저가 실행하는 저수준 이진 포맷. C/C++/Rust 등을 컴파일해 JavaScript 대비 고성능 연산 구현.' },
      { word: 'wasm-bindgen', def: 'Rust 함수와 JavaScript 사이의 FFI(외부 함수 인터페이스) 바인딩을 자동 생성하는 도구.' },
      { word: 'WASI', def: 'WebAssembly System Interface. WASM 모듈이 파일·네트워크 등 시스템 자원에 접근하기 위한 표준 인터페이스.' },
      { word: 'SharedArrayBuffer', def: 'JavaScript 스레드 간 메모리를 공유하는 타입 배열. WASM 멀티스레딩의 기반. COOP/COEP 헤더 필요.' },
    ],
  },
]

/* ───────── 백엔드 트렌드 데이터 ───────── */
const BE_TRENDS = [
  {
    id: 'be-1',
    tag: 'AI Infrastructure',
    icon: '🧠',
    title: 'LLM 통합 & RAG 아키텍처',
    summary: '언어 모델을 서비스 핵심 기능으로 통합하는 패턴과 실시간 지식 검색 증강이 표준화',
    points: [
      'RAG(Retrieval-Augmented Generation): 문서 청킹 → Embedding → Vector DB → LLM',
      'LangChain, LlamaIndex, Haystack 등 오케스트레이션 프레임워크',
      'Vector DB: pgvector, Pinecone, Weaviate, Milvus, Chroma',
      '멀티모달 모델(텍스트+이미지+오디오) 통합 API',
      'LLM 평가(Evals): RAGAS, LangSmith로 RAG 파이프라인 품질 측정',
    ],
    terms: [
      { word: 'RAG (Retrieval-Augmented Generation)', def: 'LLM이 학습 데이터 외 최신·도메인 지식을 실시간 검색해 답변하는 패턴. 환각(Hallucination) 감소 효과.' },
      { word: 'Embedding', def: '텍스트·이미지를 의미를 보존하는 고차원 실수 벡터로 변환. 코사인 유사도로 의미적 유사 문서 검색.' },
      { word: 'Vector Database', def: '벡터(Embedding) 저장·ANN(근사 최근접) 검색에 최적화된 DB. HNSW·IVF 인덱스 사용.' },
      { word: 'Chunking', def: '긴 문서를 LLM Context Window에 맞게 분할하는 전처리 과정. 고정 크기·재귀·시맨틱 청킹 전략 존재.' },
      { word: 'Hallucination', def: 'LLM이 사실과 다른 내용을 자신감 있게 생성하는 현상. RAG·그라운딩으로 완화.' },
    ],
  },
  {
    id: 'be-2',
    tag: 'AI Protocol',
    icon: '🔗',
    title: 'MCP (Model Context Protocol)',
    summary: 'Anthropic이 2024년 발표한 AI-도구 통합 표준 프로토콜. 2026년 주요 IDE·SaaS 플랫폼 채택 확산',
    points: [
      'AI 모델(Client)이 외부 도구·데이터(Server)에 접근하는 방식 표준화',
      'Resources, Tools, Prompts 세 가지 프리미티브로 구성',
      'stdio/SSE/HTTP 세 가지 전송 레이어 지원',
      'VS Code, JetBrains, Cursor, Claude Desktop, Windsurf 공식 지원',
      '오픈소스 MCP 서버 레지스트리 생태계 급성장',
    ],
    terms: [
      { word: 'MCP (Model Context Protocol)', def: 'AI 모델이 외부 도구·파일·API·DB 등과 상호작용하는 방식을 정의한 개방형 표준 프로토콜.' },
      { word: 'MCP Server', def: 'Resources·Tools·Prompts를 외부에 노출하는 경량 서버. 로컬 프로세스 또는 원격 HTTP 서버.' },
      { word: 'MCP Client', def: 'MCP Server에 연결해 도구를 호출하는 AI 호스트(IDE, 채팅 앱 등).' },
      { word: 'Tool Use (Function Calling)', def: 'LLM이 텍스트 생성 중 외부 함수 실행을 요청하고 결과를 다시 컨텍스트에 포함하는 패턴.' },
      { word: 'Sampling', def: 'MCP에서 서버가 역으로 클라이언트(LLM)에게 추론 요청을 보내는 프리미티브. 에이전틱 루프 구현에 활용.' },
    ],
  },
  {
    id: 'be-3',
    tag: 'Runtime',
    icon: '⚡',
    title: 'Bun & Deno 2 — 차세대 JS 런타임',
    summary: 'Node.js 대비 수 배 빠른 성능과 개선된 DX를 제공하는 차세대 서버사이드 JavaScript 런타임',
    points: [
      'Bun 1.x: Zig 언어로 작성, JSC 엔진, Node.js 98% 호환, 번들러·테스트러너 내장',
      'Deno 2.0: Node/npm 완전 호환, TypeScript 네이티브, 기본 Secure Sandbox',
      'Bun HTTP 서버: Node.js 대비 ~3× 처리량, ~50% 메모리 절감',
      'Deno Deploy: 엣지 전역 배포 플랫폼 (Fresh 프레임워크)',
      '두 런타임 모두 WinterCG 표준(Fetch, Request, Response) 준수',
    ],
    terms: [
      { word: 'JavaScriptCore (JSC)', def: 'Apple WebKit의 JS 엔진. Bun이 채택. V8 대비 시작 시간 빠름. Safari/React Native에서도 사용.' },
      { word: 'WinterCG', def: 'Web-interoperable Runtimes Community Group. 서버 JS 런타임 간 Web API 호환성 표준화 단체.' },
      { word: 'Deno Permissions', def: 'Deno의 기본 보안 모델. 파일·네트워크·환경변수 접근을 명시적 플래그로 허용. 최소 권한 원칙.' },
      { word: 'Bun Bundler', def: 'Bun 내장 번들러. esbuild 호환 API, Tree Shaking, Code Splitting, TypeScript/JSX 변환 포함.' },
    ],
  },
  {
    id: 'be-4',
    tag: 'Systems',
    icon: '🦀',
    title: 'Rust 백엔드 & 시스템 프로그래밍',
    summary: '메모리 안전성과 제로 코스트 추상화로 C/C++ 수준 성능과 높은 안전성을 동시에 달성',
    points: [
      'Axum, Actix-web: async/await 기반 고성능 웹 프레임워크',
      'Tokio: Rust 표준 비동기 런타임 (Green Thread 방식)',
      'sqlx, SeaORM: 컴파일 타임 SQL 쿼리 검증',
      'WASM 컴파일 타겟: 서버·브라우저·엣지 멀티 배포',
      '주요 기업 도입: Linux Kernel, Android, Windows 커널 일부 Rust 재작성',
    ],
    terms: [
      { word: 'Ownership', def: "Rust의 핵심 메모리 관리 모델. 각 값은 하나의 소유자만 가지며, 소유자 범위 종료 시 자동 해제. GC·수동 free 불필요." },
      { word: 'Borrowing', def: '소유권 이전 없이 값의 참조(&)를 빌려주는 Rust 개념. 불변 참조는 다수 허용, 가변 참조는 하나만.' },
      { word: 'Lifetimes', def: '참조가 유효한 범위를 컴파일러에 알려주는 Rust 어노테이션. Dangling pointer를 컴파일 타임에 방지.' },
      { word: 'Zero-Cost Abstraction', def: '고수준 추상화(Iterator, async/await 등)가 런타임 오버헤드 없이 저수준 코드와 동일한 성능을 내는 Rust 원칙.' },
    ],
  },
  {
    id: 'be-5',
    tag: 'Observability',
    icon: '🔭',
    title: 'OpenTelemetry & eBPF 관찰가능성',
    summary: '분산 시스템의 내부 상태를 Trace·Metric·Log 세 기둥으로 표준화하고, eBPF로 무코드 계측 실현',
    points: [
      'OpenTelemetry(OTel): CNCF 표준. 언어 무관 Tracing·Metrics·Logs 수집 API',
      'OTLP(OpenTelemetry Protocol): gRPC/HTTP 기반 텔레메트리 전송 표준',
      'eBPF: Linux 커널 내 프로그램 실행. 코드 변경 없이 네트워크·성능 계측',
      'Grafana LGTM Stack (Loki·Grafana·Tempo·Mimir) 오픈소스 관찰가능성 표준화',
      'Continuous Profiling: Parca, Pyroscope로 프로덕션 CPU/메모리 상시 프로파일링',
    ],
    terms: [
      { word: 'OpenTelemetry (OTel)', def: 'Trace·Metric·Log 수집을 위한 벤더 중립 오픈소스 표준. 구글·Microsoft·Splunk 등이 공동 개발.' },
      { word: 'Distributed Tracing', def: '마이크로서비스 간 요청 흐름을 Trace ID로 연결해 전체 경로를 시각화하는 기법.' },
      { word: 'Span', def: '분산 추적의 단위 작업. 시작/종료 시간, 태그, 이벤트 포함. 여러 Span이 모여 Trace 구성.' },
      { word: 'eBPF (Extended Berkeley Packet Filter)', def: 'Linux 커널에서 샌드박스 프로그램을 안전하게 실행하는 기술. 네트워크 모니터링·보안·성능 계측에 활용.' },
      { word: 'Cardinality', def: '메트릭 레이블 조합의 고유 값 수. 고카디널리티(user_id 등)는 시계열 DB에 큰 부하. 설계 시 주요 고려사항.' },
    ],
  },
  {
    id: 'be-6',
    tag: 'API Design',
    icon: '🔌',
    title: 'gRPC, GraphQL & API 게이트웨이',
    summary: '서비스 간 통신 효율화를 위한 타입 안전 프로토콜과 API 접근 계층 패턴',
    points: [
      'gRPC + Protobuf: 이진 직렬화, HTTP/2 멀티플렉싱, 4가지 스트리밍 모드',
      'gRPC-Web, Connect: 브라우저에서 gRPC 직접 호출',
      'GraphQL Federation (Apollo, StepZen): 마이크로서비스 스키마 통합',
      'tRPC: TypeScript 풀스택 타입 안전 RPC (Next.js 통합)',
      'API Gateway Pattern: Kong, AWS API GW, Gravitee — 인증·레이트리밋·변환 중앙화',
    ],
    terms: [
      { word: 'gRPC', def: '구글이 개발한 고성능 RPC 프레임워크. Protocol Buffers + HTTP/2 기반. 마이크로서비스 내부 통신 표준.' },
      { word: 'Protocol Buffers (Protobuf)', def: '언어 중립적 이진 직렬화 포맷. IDL(인터페이스 정의 언어)로 스키마 정의 후 다국어 코드 생성.' },
      { word: 'tRPC', def: 'TypeScript 타입을 서버·클라이언트 간 공유해 API 스키마 없이 엔드투엔드 타입 안전성을 제공하는 RPC 라이브러리.' },
      { word: 'Service Mesh', def: '마이크로서비스 간 네트워크 통신을 관리하는 인프라 레이어. Istio, Linkerd. 트래픽 제어·mTLS·관찰가능성.' },
    ],
  },
  {
    id: 'be-7',
    tag: 'Data',
    icon: '🗄️',
    title: '데이터베이스 현대화 & 벡터 DB',
    summary: 'HTAP, 벡터 인덱스, 분산 SQL 등 데이터베이스 패러다임의 다변화',
    points: [
      'pgvector: PostgreSQL 벡터 인덱스 확장 (HNSW, IVF Flat)',
      'TiDB/CockroachDB: 분산 SQL, 수평 확장, HTAP 지원',
      'DuckDB: 임베디드 OLAP DB, Parquet/Arrow 네이티브 처리',
      'ClickHouse: 컬럼형 OLAP, 초당 수십억 행 쿼리',
      'Supabase: PostgreSQL + Auth + Storage + Edge Functions 통합 BaaS',
      'Turso (libSQL): SQLite 엣지 분산 배포',
    ],
    terms: [
      { word: 'HTAP (Hybrid Transactional/Analytical Processing)', def: 'OLTP(트랜잭션)와 OLAP(분석) 워크로드를 단일 DB에서 처리. 실시간 분석 가능.' },
      { word: 'HNSW (Hierarchical Navigable Small World)', def: '벡터 유사도 검색을 위한 그래프 기반 ANN 인덱스. pgvector, Weaviate 채택. 속도-정확도 균형 우수.' },
      { word: 'Columnar Storage', def: '데이터를 행 대신 열 단위로 저장. 집계 쿼리 시 불필요한 컬럼 스킵 가능. OLAP 성능 극대화.' },
      { word: 'CDC (Change Data Capture)', def: 'DB의 변경 이벤트(INSERT/UPDATE/DELETE)를 실시간 스트림으로 캡처. Debezium, Postgres WAL 활용.' },
    ],
  },
  {
    id: 'be-8',
    tag: 'Cloud Native',
    icon: '☁️',
    title: 'Cloud Native & Serverless 진화',
    summary: '컨테이너 오케스트레이션을 넘어 서버리스·엣지·WebAssembly 기반 차세대 클라우드 실행 모델',
    points: [
      'Kubernetes 성숙: Operator 패턴, Crossplane으로 인프라-as-코드',
      'KEDA (Kubernetes Event-Driven Autoscaling): 이벤트 기반 파드 자동 스케일',
      'Serverless 2.0: AWS Lambda SnapStart, 콜드 스타트 < 10ms',
      'WASM on Server: Fermyon Spin, wasmCloud — 컨테이너보다 작고 빠른 격리 단위',
      'Platform Engineering: Backstage 기반 개발자 포털 내재화',
    ],
    terms: [
      { word: 'Kubernetes Operator', def: '커스텀 리소스(CRD)와 컨트롤러로 DB·미들웨어 등의 운영 지식을 코드화한 자동화 패턴.' },
      { word: 'KEDA', def: 'Kubernetes Event-Driven Autoscaling. 메시지 큐 길이·Prometheus 메트릭 등 외부 이벤트에 따라 파드 수 조절.' },
      { word: 'FinOps', def: 'Cloud 비용 최적화 문화·프랙티스. Right-sizing, Reserved Instance, Spot 활용, 비용 가시성 확보.' },
      { word: 'Platform Engineering', def: '개발팀이 인프라를 셀프서비스로 프로비저닝·운영할 수 있도록 내부 플랫폼(IDP)을 구축하는 엔지니어링 discipline.' },
    ],
  },
  {
    id: 'be-9',
    tag: 'AI Agent',
    icon: '🤖',
    title: 'AI 에이전트 인프라 & 오케스트레이션',
    summary: '자율적으로 목표를 수행하는 AI 에이전트 시스템을 위한 백엔드 설계 패턴',
    points: [
      '에이전트 루프: LLM → Tool Call → Observation → Next Step 반복',
      'LangGraph, CrewAI, AutoGen: 다중 에이전트 오케스트레이션 프레임워크',
      '장기 메모리: 에피소드·시맨틱·절차적 메모리 분리 설계',
      '내구성 실행(Durable Execution): Temporal, Inngest — 에이전트 상태 영속화',
      'Human-in-the-Loop: 에이전트 체크포인트에서 인간 승인 게이트',
    ],
    terms: [
      { word: 'Agentic AI', def: '목표 달성을 위해 자율적으로 계획·도구 사용·피드백 반영 루프를 실행하는 AI 시스템.' },
      { word: 'ReAct (Reason + Act)', def: 'LLM이 추론(Thought)과 행동(Action)을 번갈아 수행하며 태스크를 해결하는 프롬프팅 패턴.' },
      { word: 'Durable Execution', def: '긴 실행 시간의 비즈니스 로직을 장애·재시작 후에도 정확히 이어서 실행하는 워크플로우 엔진 패턴. Temporal 대표적.' },
      { word: 'Human-in-the-Loop (HITL)', def: '자동화 파이프라인 중간에 인간 검토·승인을 삽입하는 패턴. 고위험 에이전트 작업의 안전 장치.' },
    ],
  },
]

type Tab = 'fe' | 'be'

const TrendCard = ({ trend }: { trend: typeof FE_TRENDS[0] }): ReactElement => {
  const [open, setOpen] = useState(false)

  return (
    <div className={`trend-card${open ? ' trend-card--open' : ''}`}>
      <button className="trend-card-header" onClick={() => setOpen(o => !o)}>
        <span className="trend-card-icon">{trend.icon}</span>
        <div className="trend-card-header-text">
          <span className="trend-tag">{trend.tag}</span>
          <h3 className="trend-title">{trend.title}</h3>
          <p className="trend-summary">{trend.summary}</p>
        </div>
        <span className="trend-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="trend-body">
          {/* 핵심 내용 */}
          <div className="trend-section">
            <div className="trend-section-label">🔑 핵심 포인트</div>
            <ul className="trend-points">
              {trend.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {/* 용어 정의 */}
          <div className="trend-section">
            <div className="trend-section-label">📖 용어 정의</div>
            <div className="term-grid">
              {trend.terms.map((t, i) => (
                <div className="term-card" key={i}>
                  <div className="term-word">{t.word}</div>
                  <div className="term-def">{t.def}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CurriculumDay25 = (): ReactElement => {
  const [tab, setTab] = useState<Tab>('fe')

  const trends = tab === 'fe' ? FE_TRENDS : BE_TRENDS

  return (
    <>
      {/* 페이지 헤더 */}
      <section className="page-header-ed">
        <div className="container">
          <div className="eyebrow">Curriculum · Day 2.5</div>
          <h1>2026 개발 트렌드</h1>
          <p>
            현재 시점(2026) 프론트엔드·백엔드 개발 생태계의 핵심 기술 트렌드,
            특이점, 지식 및 주요 용어를 체계적으로 정리합니다.
          </p>
        </div>
      </section>

      {/* 탭 스위처 */}
      <section className="curriculum-tab-bar">
        <div className="container">
          <div className="tab-switcher">
            <button
              className={`tab-btn${tab === 'fe' ? ' tab-btn--active' : ''}`}
              onClick={() => setTab('fe')}
            >
              <span className="tab-icon">🖥️</span>
              프론트엔드 트렌드
              <span className="tab-count">{FE_TRENDS.length}</span>
            </button>
            <button
              className={`tab-btn${tab === 'be' ? ' tab-btn--active' : ''}`}
              onClick={() => setTab('be')}
            >
              <span className="tab-icon">⚙️</span>
              백엔드 트렌드
              <span className="tab-count">{BE_TRENDS.length}</span>
            </button>
          </div>

          <div className="tab-intro">
            {tab === 'fe' ? (
              <>
                <strong>프론트엔드(Frontend)</strong>는 사용자 브라우저에서 직접 실행되는 클라이언트 계층입니다.
                2026년 주요 변화는 <em>AI 통합 개발 방식</em>, <em>서버·클라이언트 경계 재정의(RSC)</em>,
                <em>Signals 기반 반응성</em>, <em>CSS 네이티브 기능 확장</em>으로 요약됩니다.
              </>
            ) : (
              <>
                <strong>백엔드(Backend)</strong>는 서버·데이터베이스·인프라를 담당하는 서비스 계층입니다.
                2026년 주요 변화는 <em>LLM 통합 & RAG</em>, <em>MCP 표준화</em>,
                <em>차세대 런타임(Bun/Deno)</em>, <em>AI 에이전트 인프라</em>로 요약됩니다.
              </>
            )}
          </div>
        </div>
      </section>

      {/* 트렌드 목록 */}
      <section className="section-ed">
        <div className="container">
          <div className="trend-list">
            {trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        </div>
      </section>

      {/* 요약 인포그래픽 */}
      <section className="section-ed" style={{ background: 'var(--bg-light-gray)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="section-num">&mdash; 2026 Key Insights</div>
          <h2 className="section-title-ed" style={{ marginBottom: '40px' }}>
            핵심 <span className="accent">인사이트</span> 요약
          </h2>

          <div className="insight-grid">
            {[
              {
                icon: '🤖',
                title: 'AI-First 개발',
                desc: 'AI가 코드 생성·리뷰·배포까지 개발 전 사이클에 통합. "AI를 쓸 줄 아는 개발자"가 아닌 "AI와 협업하는 개발 문화"로 전환.',
              },
              {
                icon: '🔗',
                title: '프로토콜 표준화',
                desc: 'MCP, OTel, WinterCG 등 업계 표준 프로토콜 중심으로 생태계 통합. 벤더 종속 탈피와 이식성 향상.',
              },
              {
                icon: '⚡',
                title: '성능 최우선',
                desc: 'Rust, Bun, WASM, eBPF 등 저수준 성능 최적화 기술이 애플리케이션 레이어까지 보급. Core Web Vitals가 비즈니스 KPI.',
              },
              {
                icon: '🔒',
                title: '보안 내재화',
                desc: 'Rust 메모리 안전성, Deno 퍼미션 모델, Supply Chain 공격 대응(SBOM)이 개발 초기부터 내재화 필수.',
              },
              {
                icon: '🌐',
                title: '엣지 컴퓨팅',
                desc: '클라우드 중앙 서버 → 사용자 네트워크 경계(Edge)로 연산 이동. 지연 시간 < 50ms 목표.',
              },
              {
                icon: '📐',
                title: '타입 안전성',
                desc: 'TypeScript, Rust, GraphQL, Protobuf 등 컴파일 타임 타입 검증이 프론트·백엔드·API 전 계층으로 확산.',
              },
            ].map((item, i) => (
              <div className="insight-card" key={i}>
                <div className="insight-icon">{item.icon}</div>
                <div className="insight-title">{item.title}</div>
                <p className="insight-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default CurriculumDay25
