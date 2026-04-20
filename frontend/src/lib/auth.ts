const TOKEN_KEY = 'medtag_token';

// Helper đơn giản để quản lý Cookie
const Cookie = {
    set(name: string, value: string, days?: number) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    },
    get(name: string) {
        if (typeof document === 'undefined') return null;
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    remove(name: string) {
        document.cookie = name + '=; Max-Age=-99999999; path=/';
    }
};

export function getToken(): string | null {
    return Cookie.get(TOKEN_KEY);
}

export function setToken(token: string): void {
    // Lưu cookie trong 7 ngày
    Cookie.set(TOKEN_KEY, token, 7);
}

export function removeToken(): void {
    Cookie.remove(TOKEN_KEY);
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, { ...options, headers });
}
