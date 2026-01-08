<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import { Button } from '@/components/ui/button';

interface Props {
    title?: string;
}

withDefaults(defineProps<Props>(), {
    title: 'Welcome',
});
</script>

<template>
    <Head :title="title">
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>

    <div class="relative flex min-h-screen flex-col bg-background">
        <!-- Header -->
        <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div class="container flex h-14 items-center">
                <div class="mr-4 flex">
                    <Link href="/" class="mr-6 flex items-center space-x-2">
                        <AppLogoIcon class="h-6 w-6" />
                        <span class="hidden font-bold sm:inline-block">
                            Video Player PWA
                        </span>
                    </Link>
                </div>
                <div class="flex flex-1 items-center justify-end space-x-2">
                    <nav class="flex items-center gap-2">
                        <template v-if="$page.props.auth.user">
                            <Button variant="ghost" as-child>
                                <Link :href="dashboard()">
                                    Dashboard
                                </Link>
                            </Button>
                        </template>
                        <template v-else>
                            <Button variant="ghost" as-child>
                                <Link :href="login()">
                                    Log in
                                </Link>
                            </Button>
                            <Button as-child>
                                <Link :href="register()">
                                    Register
                                </Link>
                            </Button>
                        </template>
                    </nav>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="border-t py-6 md:py-0">
            <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <AppLogoIcon class="h-6 w-6" />
                    <p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with Laravel, Vue, and Inertia.js
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
import { dashboard, login, register } from '@/routes';
export default {
    methods: {
        dashboard,
        login,
        register,
    },
};
</script>
