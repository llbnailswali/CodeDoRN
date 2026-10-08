import { makeKotlinExampleRunnable } from '../src/utils/kotlinExample';

describe('makeKotlinExampleRunnable', () => {
  it('leaves an existing main entry point unchanged', () => {
    const lines = ['fun main() {', '  println("Hi")', '}'];
    expect(makeKotlinExampleRunnable(lines)).toBe(lines.join('\n'));
  });

  it('wraps a snippet without main', () => {
    expect(makeKotlinExampleRunnable(['val answer = 42', 'println(answer)'])).toBe(
      ['fun main() {', '  val answer = 42', '  println(answer)', '}'].join('\n'),
    );
  });

  it('keeps package and import directives outside main', () => {
    expect(makeKotlinExampleRunnable(['package demo', 'import kotlin.math.abs', '', 'println(abs(-2))'])).toBe(
      ['package demo', 'import kotlin.math.abs', '', 'fun main() {', '  println(abs(-2))', '}'].join('\n'),
    );
  });
});
