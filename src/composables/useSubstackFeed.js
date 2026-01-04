import { ref, computed } from 'vue';
import { fetchSubstackPosts } from '@/services/substackFeed';

export default function useSubstackFeed() {
    const posts = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const displayedCount = ref(3);
    const allPostsLoaded = ref(false);

    const displayedPosts = computed(() => 
        posts.value.slice(0, displayedCount.value)
    );

    const canLoadMore = computed(() => 
        !allPostsLoaded.value && displayedCount.value < posts.value.length
    );

    async function loadPosts() {
        loading.value = true;
        error.value = null;
        
        const result = await fetchSubstackPosts(50); // Busca mais para paginação
        
        if (result.success) {
            posts.value = result.posts;
            allPostsLoaded.value = result.posts.length <= displayedCount.value;
        } else {
            error.value = result.error;
        }
        
        loading.value = false;
    }

    function loadMore() {
        if (canLoadMore.value) {
            displayedCount.value += 3;
            // Verifica se carregou tudo
            if (displayedCount.value >= posts.value.length) {
                allPostsLoaded.value = true;
            }
        }
    }

    return {
        posts: displayedPosts,
        loading,
        error,
        canLoadMore,
        loadPosts,
        loadMore
    };
}