# @guoyunhe/bundle-dts

## Install

```bash
npm i @guoyunhe/bundle-dts
```

## Usage

```ts
import { bundleDts } from '@guoyunhe/bundle-dts';

bundleDts();
```

By default, it scans `src` and bundles `src/index.ts` into `dist/index.d.ts`.

## Options

### entry: string

Default: `src/index.ts`.

The entry point TypeScript file.

```ts
bundleDts({ entry: 'src/main.ts' });
```

### outFile: string

Default: `dist/index.d.ts`

The path of output declaration file.

```ts
bundleDts({ outFile: 'out/main.d.ts' });
```
