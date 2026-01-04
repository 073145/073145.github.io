<template>
    <section id="writing" class="articles-section">
        <div class="section-header">
            <h2 class="section-title">
                Artigos Recentes
                <a :href="substackUrl" 
                   target="_blank" 
                   class="substack-badge"
                   v-if="!loading && posts.length > 0">
                    Ver todos no Substack ↗
                </a>
            </h2>
            <p class="section-subtitle">Pensamentos sobre computação, filosofia da tecnologia e estética audiovisual</p>
        </div>

        <!-- Estados de carregamento/erro -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
        </div>
        
        <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button @click="loadPosts" class="retry-button">Tentar novamente</button>
        </div>

        <!-- Grid de artigos -->
        <div v-else class="articles-grid">
            <article v-for="post in posts" 
                     :key="post.id" 
                     class="article-card"
                     @click="openPost(post.link)">
                <div class="article-content">
                    <h3 class="article-title">{{ post.title }}</h3>
                    <p class="article-excerpt">{{ post.excerpt }}</p>
                    <div class="article-meta">
                        <span class="article-date">{{ post.date }}</span>
                        <span class="article-author">{{ post.author }}</span>
                    </div>
                </div>
                <div class="article-action">
                    <span class="read-more">Ler artigo →</span>
                </div>
            </article>
        </div>

        <!-- Botão de carregar mais -->
        <div v-if="canLoadMore && !loading" class="load-more-container">
            <button @click="loadMore" class="load-more-button">
                Carregar mais artigos (+3)
            </button>
        </div>
        
        <div v-else-if="posts.length > 0 && !canLoadMore" class="all-loaded">
            Todos os artigos carregados
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useSubstackFeed from '@/composables/useSubstackFeed';

// Configuração
const substackUrl = 'https://SEU_SUBSTACK.substack.com';
const { 
    posts, 
    loading, 
    error, 
    canLoadMore, 
    loadPosts, 
    loadMore 
} = useSubstackFeed();

function openPost(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

onMounted(() => {
    loadPosts();
});
</script>

<style scoped>
.articles-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
}

.section-header {
    margin-bottom: 3rem;
    text-align: center;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.substack-badge {
    font-size: 0.9rem;
    color: var(--emerald-500);
    text-decoration: none;
    margin-left: 1rem;
    border: 1px solid var(--emerald-500);
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    transition: all 0.3s ease;
}

.substack-badge:hover {
    background-color: var(--emerald-500);
    color: white;
}

.section-subtitle {
    color: var(--text-secondary);
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
}

/* Grid de artigos */
.articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.article-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 1rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

.article-card:hover {
    transform: translateY(-4px);
    border-color: var(--emerald-500);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.article-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.article-excerpt {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    flex-grow: 1;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
}

.article-action .read-more {
    color: var(--emerald-500);
    font-weight: 600;
    transition: color 0.3s ease;
}

.article-card:hover .read-more {
    color: var(--emerald-600);
}

/* Estados */
.loading-state {
    display: flex;
    justify-content: center;
    padding: 4rem;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--emerald-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-state {
    text-align: center;
    padding: 3rem;
    color: var(--error-color);
}

.retry-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--emerald-500);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.retry-button:hover {
    background-color: var(--emerald-600);
}

/* Botão carregar mais */
.load-more-container {
    text-align: center;
    margin-top: 2rem;
}

.load-more-button {
    padding: 1rem 2rem;
    background-color: transparent;
    color: var(--emerald-500);
    border: 2px solid var(--emerald-500);
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-more-button:hover {
    background-color: var(--emerald-500);
    color: white;
}

.all-loaded {
    text-align: center;
    color: var(--text-tertiary);
    padding: 2rem;
    font-style: italic;
}

/* Responsividade */
@media (max-width: 768px) {
    .articles-section {
        padding: 2rem 1rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .articles-grid {
        grid-template-columns: 1fr;
    }
}
</style>