import { describe, it, expect } from 'vitest';
import { isEscapeForClose } from './useEscapeClose';

describe('isEscapeForClose', () => {
  it('returns true for plain Escape on a non-form element', () => {
    expect(isEscapeForClose({ key: 'Escape', target: { tagName: 'DIV' } as HTMLElement }))
      .toBe(true);
  });

  it('returns false for non-Escape keys', () => {
    expect(isEscapeForClose({ key: 'Enter', target: null })).toBe(false);
    expect(isEscapeForClose({ key: 'a', target: null })).toBe(false);
    expect(isEscapeForClose({ key: 'Tab', target: null })).toBe(false);
  });

  it('returns false when Escape fires inside an INPUT', () => {
    expect(
      isEscapeForClose({ key: 'Escape', target: { tagName: 'INPUT' } as HTMLElement }),
    ).toBe(false);
  });

  it('returns false when Escape fires inside a TEXTAREA', () => {
    expect(
      isEscapeForClose({ key: 'Escape', target: { tagName: 'TEXTAREA' } as HTMLElement }),
    ).toBe(false);
  });

  it('returns false when Escape fires inside a SELECT', () => {
    expect(
      isEscapeForClose({ key: 'Escape', target: { tagName: 'SELECT' } as HTMLElement }),
    ).toBe(false);
  });

  it('returns true for Escape when target is null (defensive)', () => {
    expect(isEscapeForClose({ key: 'Escape', target: null })).toBe(true);
  });
});
