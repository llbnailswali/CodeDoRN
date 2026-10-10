/// <reference types="vite/client" />
// The app: both WASM files are bundled by Vite and loaded from their asset URLs. Importing this module starts loading the parser.
import runtime from 'web-tree-sitter/tree-sitter.wasm?url';
import grammar from '../assets/tree-sitter/tree-sitter-kotlin.wasm?url';
import { ensureKotlinSyntax, setKotlinSyntaxAssets } from './kotlinSyntaxCheck';

setKotlinSyntaxAssets({ runtime, grammar });
void ensureKotlinSyntax();
