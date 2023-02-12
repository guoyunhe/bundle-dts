import { bundleDts } from '.';

describe('bundleDts()', () => {
  it('bundle .d.ts', async () => {
    expect(await bundleDts({ entry: 'index', include: 'example/**/*.{ts,tsx}' })).toBeUndefined();
  });
});
