import { expect } from 'chai';

describe('Simple Test', () => {
  it('should pass a basic test', () => {
    expect(true).to.be.true;
  });

  it('should do basic math', () => {
    expect(1 + 1).to.equal(2);
  });
}); 