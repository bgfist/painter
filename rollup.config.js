import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const extensions = [".js", ".ts"];

export default {
    input: 'src/Canvas.ts',
    output: {
        file: 'dist/painter.js',
        format: 'umd',
        name: "Painter",
        sourcemap: true
    },
    plugins: [
        resolve({
            extensions
        }),
        commonjs(),
        babel({
            exclude: /node_modules/,
            extensions
        }),
        terser()
    ],
};