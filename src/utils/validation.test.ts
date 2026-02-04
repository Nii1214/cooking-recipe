import { describe, it, expect } from 'vitest';
import { isPasswordNotEmpty, isValidEmail, isValidPasswordLength } from './validation';
//npm run test -- src/utils/validation.test.ts
describe('isValidEmail',() => {
    it('有効なメールアドレスならtrue',() => {
        expect(isValidEmail('user@email.com')).toBe(true);
        expect(isValidEmail('test+tag@domain.co.jp')).toBe(true);
    });
    it('無効な形式ならfalse', ()=> {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@example')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });
});

describe('isPassowordNotEmpty',() => {
    it('一文字以上ならtrue',() => {
        expect(isPasswordNotEmpty('a')).toBe(true);
        expect(isPasswordNotEmpty('password')).toBe(true);
    });
    it('空文字ならfalse', ()=> {
        expect(isPasswordNotEmpty('')).toBe(false);
    });
});

describe('isValidPasswordLength', () => {
    it('minLength以上ならtrue',() => {
        expect(isValidPasswordLength('12345678',8)).toBe(true);
        expect(isValidPasswordLength('123456789',8)).toBe(true);
        expect(isValidPasswordLength('12345',5)).toBe(true);
    });
    it('minLength 未満なら false', () => {
        expect(isValidPasswordLength('1234567', 8)).toBe(false);
        expect(isValidPasswordLength('', 8)).toBe(false);
    });

    it('第2引数を省略すると 8 が使われる', () => {
        expect(isValidPasswordLength('12345678')).toBe(true);
        expect(isValidPasswordLength('1234567')).toBe(false);
    });
})
