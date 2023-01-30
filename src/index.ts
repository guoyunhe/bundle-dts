import {
  Extractor,
  ExtractorConfig,
  IExtractorConfigPrepareOptions,
} from '@microsoft/api-extractor';
import glob from 'fast-glob';
import { readFile, rm } from 'fs/promises';
import { join } from 'path';
import { replaceTscAliasPaths } from 'tsc-alias';
import { CompilerOptions, convertCompilerOptionsFromJson, createProgram } from 'typescript';

export interface BundleDtsOptions {
  /**
   * Path to tsconfig.json
   *
   * @default 'tsconfig.json'
   */
  tsconfigJsonPath?: string;
  /**
   * Entry file to bundle (no extension)
   *
   * @default 'index'
   */
  entry?: string;
  /**
   * Glob patterns for files to compile
   *
   * @default 'src/**\/*.{ts,tsx}'
   */
  include?: string | string[];
  /**
   * Glob patterns for files to ignore
   *
   * @default 'src/**\/*.{ts,tsx}'
   */
  exclude?: string[];
  /**
   * File path of final *.d.ts output
   *
   * @default `${dist}/index.d.ts`
   */
  outFile?: string;
}

/**
 * Build TypeScript declaration files and bundle them into one
 * @see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
 * @see https://api-extractor.com/pages/setup/configure_rollup/
 */
export async function bundleDts({
  tsconfigJsonPath = join(process.cwd(), 'tsconfig.json'),
  entry = 'index',
  include = 'src/**/*.{ts,tsx}',
  exclude = ['*.test.ts', '*.spec.ts', '*.test.tsx', '*.spec.tsx'],
  outFile = join(process.cwd(), 'dist', 'index.d.ts'),
}: BundleDtsOptions) {
  // Temp directory for un-bundled .d.ts files
  const rawDir = join(process.cwd(), 'node_modules', '.cache', 'bundle-dts', 'raw');
  const rawEntry = join(rawDir, entry + '.d.ts');

  // Read tsconfig.json
  let tsconfig = {};
  try {
    tsconfig = await readFile(tsconfigJsonPath, 'utf-8');
  } catch (e) {
    //
  }

  // Convert
  const compilerOptionsResult = convertCompilerOptionsFromJson(tsconfig, process.cwd());
  const compilerOptions: CompilerOptions = {
    ...compilerOptionsResult.options,
    declaration: true,
    emitDeclarationOnly: true,
    outDir: rawDir,
  };

  const fileNames = await glob(include, {
    ignore: exclude,
  });

  // Prepare and emit the d.ts files
  const program = createProgram(fileNames, compilerOptions);
  program.emit();

  // Convert tsconfig.json paths (alias) to relative (real) path
  await replaceTscAliasPaths({
    configFile: tsconfigJsonPath,
    declarationDir: rawDir,
    outDir: rawDir,
  });

  // Bundle d.ts files
  const extractorOptions: IExtractorConfigPrepareOptions = {
    configObjectFullPath: join(process.cwd(), 'api-extractor.json'),
    packageJsonFullPath: join(process.cwd(), 'package.json'),
    configObject: {
      mainEntryPointFilePath: rawEntry,
      projectFolder: process.cwd(),
      compiler: {
        tsconfigFilePath: tsconfigJsonPath,
      },
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: outFile,
      },
    },
  };
  const extractorConfig = ExtractorConfig.prepare(extractorOptions);
  const extractorResult = Extractor.invoke(extractorConfig);
  if (extractorResult.succeeded) {
    await rm(rawDir, { recursive: true, force: true });
  } else {
    throw new Error('Bundling TypeScript declarations (*.d.ts) failed');
  }
}
