import { bundleDts } from '.';

describe('bundleDts()', () => {
  it('bundle .d.ts', async () => {
    expect(await bundleDts()).toBeUndefined();
  });
});
