# Divination Source Registry

This registry is the first product-owned knowledge contract for premium reports. It does not claim that the product can already perform expert Saju, astrology, or Tarot interpretation. It defines which observed sources can and cannot be used while later waves build claim-level corpora, rule maps, fixtures, and reviewer gates.

## Rule

A source can affect a paid report only when the product has all of these:

- a stable `sourceId`
- a role that separates calculation, doctrine, discovery, visual asset, safety, and product-synthesis use
- rights/runtime-use states for prompt grounding, customer prose, paid-PDF text, paid-PDF visuals, fixtures, and server runtime
- allowed and forbidden claim families
- required caveats
- known-bad fixture IDs proving misuse is rejected

Finding a source on the web is not enough. Calendar APIs, search portals, catalog hits, public-domain candidates, and Commons categories stay out of report authority until their role, rights, capture, and review status are explicit.

## Seed Families

- KASI calendar/API/almanac records: calculation and fixture validation only. They must never support Ten Gods, yongsin, gyeokguk, career, relationship, personality, or other doctrine claims.
- JPL Horizons records: ephemeris validation only. They must never support astrology meaning, personality, relationship, career, or counseling claims.
- Swiss Ephemeris: blocked from server runtime and product output until license evidence is reviewed.
- Korean discovery portals such as RISS, KCI, National Library, and OAK: internal discovery only. Search/catalog presence does not prove doctrine quality, rights, or paid-report authority.
- Classical Myeongli candidates: internal/citation context only until edition, collation, commentary lineage, Korean terminology, rights, and domain review pass.
- Ptolemy/Tetrabiblos candidate: classical astrology context only; it cannot justify modern outer planets or modern psychological astrology.
- Waite `Pictorial Key`: Tarot text candidate only; it never grants image rights.
- First rights-safe corpus slice: exact locators are stored for the verified public-text candidates, while Sacred Texts remains index-only and separate from Waite text authority and all image-rights questions.
- Commons RWS image candidates: image discovery only until exact file-level license and derivative review pass.
- Product safety policy and report grounding contract: product constraints only. They can restrict or structure claims, but cannot prove Saju, astrology, or Tarot doctrine.

## Runtime Boundaries

Prompt grounding, customer report text, paid-PDF text, paid-PDF visuals, and server runtime each need explicit allowed surfaces. No runtime-use state implies another. `fixture_only` cannot become customer prose. `citation_only` cannot become doctrine. `internal_research_only` cannot become prompt grounding. `customer_prose_allowed` does not clear paid-PDF visuals.

Raw copyrighted source text must not enter prompt grounding unless a future rights record explicitly allows that exact use. The safe payload is source IDs, claim IDs, rule IDs, caveats, confidence, and product-authored summaries.

## Verification

The acceptance command is:

```bash
npm run test:domain-source-registry -- --scenario all
```

The verifier must prove happy-path registry shape, KASI-as-doctrine rejection, license/runtime rejection, Tarot text/image separation, Commons paid-PDF rejection, and product safety/synthesis-as-doctrine rejection.
