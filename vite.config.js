import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/Cun_Kitty/",
    server: {
        allowedHosts: true,
        proxy: {
            '/fis0': {
                target: 'https://ddc.fis.vn',
                changeOrigin: true,
                secure: false
            },
            '/apietms': {
                target: 'https://ddc.fis.vn',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
