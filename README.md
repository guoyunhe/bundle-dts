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

Default: `index`

If your entry file is not `src/index.ts(x)` but `src/main.ts(x)`, you should set `entry` to `main`.

```ts
bundleDts({ entry: 'main' });
```
