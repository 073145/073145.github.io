// Substitua SEU_SUBSTACK pelo seu domínio
const SUBSTACK_FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fshiftrealitydesigner.substack.com%2Ffeed';
const CACHE_KEY = 'substack_feed_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export async function fetchSubstackPosts(limit = 3) {
    // 1. VERIFICAR CACHE
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Verificar se o cache ainda é válido
        if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('📦 Retornando dados do cache local');
            // Aplicar o limite aos posts em cache
            return {
                ...data,
                posts: data.posts.slice(0, limit)
            };
        } else {
            console.log('⏰ Cache expirado, buscando dados novos');
        }
    }
    
    // 2. BUSCAR DADOS DA API (se cache expirado ou não existir)
    try {
        const response = await fetch(SUBSTACK_FEED_URL);
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Processar e formatar os posts
            const allPosts = data.items.map(post => ({
                id: post.guid,
                title: post.title,
                excerpt: post.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                link: post.link,
                date: new Date(post.pubDate).toLocaleDateString('pt-BR'),
                author: post.author,
                thumbnail: post.thumbnail || null
            }));
            
            // Criar o objeto de resultado com TODOS os posts
            const result = {
                success: true,
                posts: allPosts, // Aqui armazenamos TODOS os posts
                total: allPosts.length
            };
            
            // 3. SALVAR NO CACHE (com timestamp)
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: result,
                timestamp: Date.now()
            }));
            
            console.log('✅ Dados buscados da API e salvos em cache');
            
            // Retornar apenas os posts limitados
            return {
                ...result,
                posts: allPosts.slice(0, limit)
            };
        }
        throw new Error('Feed inválido');
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        
        // 4. FALLBACK: Se houver erro na API, tentar usar cache (mesmo expirado)
        if (cached) {
            console.log('⚠️ Usando cache expirado como fallback');
            const { data } = JSON.parse(cached);
            return {
                ...data,
                posts: data.posts.slice(0, limit)
            };
        }
        
        return {
            success: false,
            posts: [],
            error: 'Não foi possível carregar os artigos'
        };
    }
}