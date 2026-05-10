// PM_front/src/api/index.js

import axios from 'axios';

// 환경 변수(VITE_API_URL)가 있으면 사용하고, 없으면 '/api' 사용
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    // vite.config.js 프록시 설정에 따라 '/api'를 기본 경로로 사용
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// (★추가★) API 요청 가로채기 (Request Interceptor)
apiClient.interceptors.request.use(
    (config) => {
        // 로그인 요청(/auth/login)이나 회원가입 요청(/auth/register)이 아닌 경우
        if (config.url !== '/auth/login' && config.url !== '/auth/register') {
            // localStorage에서 'user' 객체를 가져옴
            const userString = localStorage.getItem('user');

            if (userString) {
                const user = JSON.parse(userString);
                const token = user?.token;

                // 토큰이 있으면 Authorization 헤더에 추가
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// (기존) API 응답 가로채기 (Response Interceptor)
apiClient.interceptors.response.use(
    (response) => {
        // ⬇️ (수정) 백엔드의 apiResponse 형식을 존중 (PM_back-main - 복사본/src/utils/apiResponse.js)
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            // ⬇️ (수정) 'result' 대신 'data'를 반환
            return response.data.data;
        }

        // (수정) 백엔드가 { success: false }를 보낸 경우 (로그인 실패 등)
        if (response.data && response.data.success === false) {
            return Promise.reject(new Error(response.data.message || 'API Error'));
        }

        // (수정) 기존 프론트엔드용 응답 형식도 호환
        if (response.data && response.data.result !== undefined) {
            return response.data.result;
        }

        // 위 아무것도 해당 안 되면 그냥 데이터를 반환
        return response.data;
    },
    (error) => {
        // HTTP 상태 코드가 2xx가 아닌 경우 (401, 404, 500 등)

        // (★신규★) 401 (Unauthorized) 에러인 경우, 토큰이 만료되었거나 유효하지 않음
        if (error.response && error.response.status === 401) {
            alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
            localStorage.removeItem('user'); // 로컬 저장소의 사용자 정보 삭제
            window.location.href = '/login'; // 로그인 페이지로 강제 이동
        }

        return Promise.reject(error);
    },
);

export default apiClient;
