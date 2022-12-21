import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import("@/views/Index.vue"),
        },
        {
            path: '/drawing',
            name: 'drawing',
            component: () => import("@/views/Drawing.vue"),
        },
        {
            path: '/observe',
            name: 'observe',
            component: () => import("@/views/Observe.vue"),
        },
    ]
});

export default router
