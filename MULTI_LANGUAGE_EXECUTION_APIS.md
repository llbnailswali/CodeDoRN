# Multi-language code execution APIs — reference for future languages

CodeDo's Kotlin curriculum runs on a custom, hand-built in-browser
transpiler/simulator (`src/utils/kotlinRunner.ts`) because no good
real-Kotlin-in-browser option existed. `CODEDO_MASTER_PLAN.md`'s
"Language-Agnostic CodeDo Learning Framework" section describes adding
further languages later (Python, Java, JavaScript/TypeScript, C, C++, C#,
Go, Rust, ...), each getting its own "Code Execution" module beside the
shared Learning Engine. Building a from-scratch simulator per language the
way `kotlinRunner.ts` was built for Kotlin (see `PITFALLS.md`'s long history
of simulator-vs-real-language bugs) is not the only option -- a real,
sandboxed code-execution API can serve as that language's execution module
directly, with no simulator-divergence bug class at all.

This file records the options investigated so far, for whenever a second
language is actually scoped. **Nothing below is wired into the app yet.**
Kotlin is unaffected either way -- it stays on `kotlinRunner.ts`.

## Security note -- read before wiring any of these in

Any API key used here must NOT be embedded directly in client-side code
(`src/**`) -- this app ships as a Capacitor Android APK, and anything in the
JS bundle is extractable by decompiling the app. A leaked key on a
metered/quota'd API could be exhausted or abused by anyone who pulls it out
of an APK. Put the real key in a proxy layer instead (a small server-side
endpoint, similar in spirit to `piston-kotlin/server.js`'s role for the
existing "Verify with Real Kotlin" dev feature -- see
`src/utils/realKotlinApi.ts`), never in `src/utils/*Api.ts` directly.

Real key values belong in a git-ignored `.env` file (see `.env.example` for
the placeholder pattern this repo already uses), never committed as plain
text in a tracked file.

## Option 1 (recommended): onlinecompiler.io

- **Does NOT support Kotlin** -- confirmed live against its own
  `GET https://api.onlinecompiler.io/api/compilers/` (no auth required).
  Irrelevant to the existing Kotlin curriculum; only relevant to a *future*
  second language.
- **12 supported languages**, 8 of which are exactly what
  `CODEDO_MASTER_PLAN.md` lists as future languages: Python
  (`python-3.14`), Java (`openjdk-25`), TypeScript (`typescript-deno`), C
  (`gcc-15`), C++ (`g++-15`), C# (`dotnet-csharp-9`), Go (`go-1.26`), Rust
  (`rust-1.93`). Plus F# (`dotnet-fsharp-9`), PHP (`php-8.5`), Ruby
  (`ruby-4.0`), Haskell (`haskell-9.12`) as a bonus.
- **Endpoints:**
  - `POST https://api.onlinecompiler.io/api/run-code-sync/` -- blocks up to
    30s, returns the result directly in one request. Best fit for a
    Write & Run/Debug grading call.
  - `POST https://api.onlinecompiler.io/api/run-code/` -- async, returns
    `202` + a queue id, posts the result to a `callback` URL.
  - `GET https://api.onlinecompiler.io/api/compilers/` -- no auth, lists
    supported compilers.
- **Auth:** `Authorization: YOUR_API_KEY` header (not `Bearer <key>` --
  just the raw key value).
- **Request body:**
  ```json
  {
    "compiler": "python-3.14",
    "code": "name = input()\nprint(f\"Hello, {name}!\")",
    "input": "World"
  }
  ```
  (`compiler` and `code` required; `code`/`input` max 100 KB each;
  `extra_params` optional, async only.)
- **Response body:**
  ```json
  {
    "output": "string (truncated at 999 chars)",
    "error": "string (truncated at 999 chars)",
    "status": "success or error",
    "exit_code": 0,
    "signal": null,
    "time": 0.01,
    "total": 0.2,
    "memory": 1234
  }
  ```
- **Pricing (verified against the live, server-rendered pricing page, not
  just a summary):**
  | Plan | Price | Requests/month | Memory | Timeout |
  | --- | --- | --- | --- | --- |
  | Free | $0 | 1,000,000 | 512 MB | 30s |
  | Pro | $49/mo | 10,000,000 | 1 GB | 60s |
  | Enterprise | custom | unlimited | custom | custom |

  No credit card required for Free. Their own FAQ explicitly says commercial
  use is allowed on every plan, naming "coding education platforms" as an
  example use case. Sync concurrency is capped at 4 concurrent requests
  (429 past that) -- fine for low/moderate traffic, would need the async
  endpoint or a request queue at real scale.
- **API key on file:** provided by the user in chat on 2026-09-27; stored in
  this repo's git-ignored `.env` as `ONLINECOMPILER_API_KEY` (see
  `.env.example` for the placeholder). Not reproduced here since this file
  is tracked in git.

## Option 2: HackerEarth Code Evaluation API v4

- **Does support Kotlin** (`lang: "KOTLIN"`), unlike onlinecompiler.io --
  relevant if a *Kotlin-specific* real-compiler backend is ever wanted
  server-side (e.g. to replace/extend the current self-hosted
  `piston-kotlin/server.js` used by `runRealKotlin()`).
- **Endpoints:**
  - `POST https://api.hackerearth.com/v4/partner/code-evaluation/submissions/`
  - `GET https://api.hackerearth.com/v4/partner/code-evaluation/submissions/{id}/`
    (status/result polling)
- **Auth:** `client-secret` header, obtained by registering an application
  with HackerEarth (not a simple self-serve API key like onlinecompiler.io).
  **We do not have one yet.**
- **Shape:** async-first -- submit, then either poll the status endpoint or
  supply a `callback` URL. Request fields: `lang`, `source`, `input`,
  `memory_limit` (up to 262144 KB), `time_limit` (up to 5s), `callback`,
  `context`.
- **Pricing:** free tier exists but capped ("a cap on... number of free
  requests" per their own docs, exact number not published); paid/higher
  quota requires contacting their support. Not a simple self-serve paid
  tier like onlinecompiler.io's Pro plan.

## Option 3: RapidAPI "Code Compiler" (abdheshnayak)

- Found while chasing an ambiguous "CodeX API" mention -- likely what was
  meant, but unconfirmed.
- **Does support Kotlin** via `LanguageChoice: "43"` (a numeric
  language-id scheme, ~35 languages total).
- **Endpoint:** `POST https://code-compiler.p.rapidapi.com/v2`,
  form-encoded body (`LanguageChoice`, `Program`, `Input`).
- **Auth:** RapidAPI headers `x-rapidapi-host` and `x-rapidapi-key` (a
  RapidAPI account/subscription, not a direct key from the vendor).
- **Pricing:** unconfirmed -- RapidAPI's pricing page is JS-rendered and
  neither a direct fetch nor a web search could pull the actual Basic-plan
  quota numbers. Needs a logged-in RapidAPI account to check.

## Recommendation, when a second language actually gets scoped

Use **onlinecompiler.io** for any future non-Kotlin language whose
execution engine doesn't already have simulator-specific investment --
it's the only option here with a confirmed, generous, truly self-serve free
tier and a simple synchronous endpoint. Put it behind a small server-side
proxy (never call it directly from `src/**`), matching how
`piston-kotlin/server.js` already keeps a similar concern server-side.
