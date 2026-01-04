// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'src/',

  modules: [
    '@vueuse/motion/nuxt',
    '@nuxtjs/tailwindcss' // <--- A PEÇA QUE FALTAVA
  ],

  // O módulo já identifica o tailwind.css automaticamente, 
  // mas mantemos aqui para garantir
  css: ['~/styles/tailwind.css'],

  // Removemos o bloco 'postcss' manual porque o módulo já cuida disso
  
  experimental: {
    appManifest: false
  }
})