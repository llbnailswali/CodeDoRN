/**
 * Per-card overrides for the Explore "Try it" button (Android RN Explore stage), and for the Learn stage's example (card id `learn`).
 *
 * By default a card runs its own `code`, wrapped in `fun main() { ... }` (src/utils/kotlinExample.ts in the app root). That is enough for
 * most cards. A card that cannot run that way needs one entry here, keyed `<lesson id>/<card id>`:
 *   - `setup`:    lines placed BEFORE the card's code (imports, helper declarations, stand-ins for values the snippet assumes).
 *   - `code`:     a complete replacement program (use when the snippet is only a fragment of a bigger program).
 *   - `expectError`: the program is meant to crash (the lesson teaches that); the button stays and shows the error.
 *   - `disabled`: why "Try it" is hidden for this card (the simulator cannot run it correctly). The button is not shown.
 *
 * `npm run audit:explore-tryit` runs every card exactly as the app would and fails if one neither runs nor appears here, so a broken
 * "Try it" can never ship. `npm run generate:native-data` copies the overrides into the app's lessonData.ts.
 */
export interface ExploreTryItOverride {
  setup?: string[];
  code?: string[];
  disabled?: string;
  /** The example is meant to end with an uncaught error (as it does in real Kotlin): the audit then requires that it fails. */
  expectError?: true;
}

export const EXPLORE_TRY_IT: Record<string, ExploreTryItOverride> = {
  'world-8-boss/learn': { disabled: 'The in-app editor cannot run this yet (smart cast of a nullable property).' },
  'world-12-star-projections/learn': { disabled: 'The in-app editor cannot run this yet (star projection `List<*>`).' },
  'world-12-type-aliases/learn': { disabled: 'The in-app editor cannot run this yet (typealias with generics).' },
  'world-15-throw/learn': { disabled: 'The in-app editor cannot run this yet (`else throw` on the next line).' },
  'world-15-checked-vs-unchecked-exception-model/learn': { expectError: true },
  'world-16-exception-handling-in-coroutines/learn': { expectError: true },
  'world-17-flow-fundamentals-cold-flow/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/learn': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-11-inheritance-abstract-classes/world-11-inheritance-abstract-classes-explore-7': { disabled: 'The in-app editor cannot run this yet (Unexpected token \'function\').' },
  'world-11-interfaces-multiple-interface-implementation/world-11-interfaces-multiple-interface-implementation-explore-2': { disabled: 'The in-app editor cannot run this yet (Invalid or unexpected token).' },
  'world-11-data-classes-in-domain-modeling-enum-classes/world-11-data-classes-in-domain-modeling-enum-classes-explore-2': { disabled: 'The in-app editor cannot run this yet (a.hashCode is not a function).' },
  'world-11-inner-classes/world-11-inner-classes-explore-5': { disabled: 'The in-app editor cannot run this yet (Unexpected token \'class\').' },
  'world-11-object-declarations/world-11-object-declarations-explore-5': { disabled: 'The in-app editor cannot run this yet (Unexpected token \':\').' },
  'world-11-delegated-properties/world-11-delegated-properties-explore-4': { disabled: 'The in-app editor cannot run this yet (Unexpected identifier \'by\').' },
  'world-11-visibility-and-api-design/world-11-visibility-and-api-design-explore-6': { disabled: 'The in-app editor cannot reproduce this compile error, so Try it would wrongly succeed.' },
  'world-11-boss/world-11-boss-explore-3': { disabled: 'The in-app editor cannot run this yet (cents is not defined).' },
  'world-12-generic-classes/generic-classes-explore-1': { disabled: 'The in-app editor cannot run this yet (Type mismatch: expected Box<Int>, got Boolean).' },
  'world-12-generic-functions/generic-functions-explore-2': { disabled: 'The in-app editor cannot run this yet (Int is not defined).' },
  'world-12-generic-functions/world-12-generic-functions-explore-6': { disabled: 'The in-app editor cannot run this yet (Unexpected identifier \'pair\').' },
  'world-12-in-variance/in-variance-explore-3': { disabled: 'The in-app editor cannot reproduce this compile error, so Try it would wrongly succeed.' },
  'world-12-out-variance/out-variance-explore-3': { disabled: 'The in-app editor cannot reproduce this compile error, so Try it would wrongly succeed.' },
  'world-12-use-site-variance/world-12-use-site-variance-explore-5': { disabled: 'The in-app editor cannot run this yet (Type mismatch: expected MutableList, got Int).' },
  'world-12-star-projections/world-12-star-projections-explore-5': { disabled: 'The in-app editor cannot run this yet (Unexpected identifier \'unknown\').' },
  'world-12-star-projections/world-12-star-projections-explore-6': { disabled: 'The in-app editor cannot run this yet (Unexpected identifier \'xs\').' },
  'world-12-reified-type-parameters/reified-type-parameters-explore-1': { disabled: 'The in-app editor cannot reproduce this compile error, so Try it would wrongly succeed.' },
  'world-12-type-safe-generic-apis/world-12-type-safe-generic-apis-explore-5': { disabled: 'The in-app editor cannot run this yet (Wrong argument count for firstOrNull: expected 1).' },
  'world-12-generic-data-toolkit-boss/world-12-generic-data-toolkit-boss-explore-8': { disabled: 'The in-app editor cannot run this yet (filterIsInstance supports String, Boolean, Number and declared classes; primitive numeric ).' },
  'world-15-boss/world-15-boss-explore-5': { setup: ['val qty = 1'] },
  'world-16-dispatchers-jobs/world-16-dispatchers-jobs-explore-5': { disabled: 'The in-app editor cannot run this yet (Suspend function \'label\' can be called only from a coroutine or another suspend function).' },
  'world-17-flow-fundamentals-cold-flow/flow-fundamentals-cold-flow-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-fundamentals-cold-flow/flow-fundamentals-cold-flow-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-fundamentals-cold-flow/flow-fundamentals-cold-flow-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-fundamentals-cold-flow/flow-fundamentals-cold-flow-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-fundamentals-cold-flow/flow-fundamentals-cold-flow-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-hot-streams-flow/hot-streams-flow-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/collect-intermediate-flow-operators-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/collect-intermediate-flow-operators-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/collect-intermediate-flow-operators-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/collect-intermediate-flow-operators-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-collect-intermediate-flow-operators/collect-intermediate-flow-operators-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/map-filter-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/map-filter-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/map-filter-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/map-filter-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-map-filter/map-filter-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-transform-catch/transform-catch-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-oneach-stateflow/oneach-stateflow-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-sharedflow-state-vs-events/sharedflow-state-vs-events-explore-7': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-7': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-cancellation-combining-flows/flow-cancellation-combining-flows-explore-8': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-7': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-flow-lifecycle-backpressure-conflation-c/flow-lifecycle-backpressure-conflation-c-explore-8': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-1': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-2': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-3': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-4': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-5': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-6': { disabled: 'Flow is not supported by the in-app editor yet.' },
  'world-17-boss/boss-explore-7': { disabled: 'Flow is not supported by the in-app editor yet.' },
};

/** The lines "Try it" should wrap and run for a card, or null when the button is disabled. */
export const tryItLines = (lessonId: string, cardId: string, cardCode: string[]): string[] | null => {
  const o = EXPLORE_TRY_IT[`${lessonId}/${cardId}`];
  if (!o) return cardCode;
  if (o.disabled) return null;
  if (o.code) return o.code;
  return [...(o.setup ?? []), ...cardCode];
};
