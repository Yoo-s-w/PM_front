import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // ★ 현재 작업 디렉토리(process.cwd())에서 .env 파일의 변수들을 로드합니다.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [vue(), vueDevTools()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },

        server: {
            proxy: {
                // '/api'로 시작하는 모든 요청을 백엔드(8080번 포트)로 전달
                '/api': {
                    // target: 'http://localhost:8080',
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
    };
});
