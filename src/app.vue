<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { 
  Home, FolderOpen, Sparkles, PenTool, User, Mail, 
  Github, Linkedin, Youtube, Layout, ExternalLink, Download, 
  Code2, Award, GraduationCap, Briefcase, Zap, Terminal, MessageSquare,
  Database, BrainCircuit, Network, Cpu, Box
} from 'lucide-vue-next';

// --- CONFIGURAÇÕES & ESTADO ---
const activeSection = ref('home');
const scrollProgress = ref(0);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentLang = ref('pt');
const isTyping = ref(false);

// --- FEED RSS SUBSTACK ---
const substackFeed = ref<any>(null);
const loadingSubstack = ref(true);
const substackError = ref(false);
const RSS_FEED_URL = "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fshiftrealitydesigner.substack.com%2Ffeed";
const SUBSTACK_SITE_URL = "https://shiftrealitydesigner.substack.com/";

// Função para buscar o feed
const fetchSubstackFeed = async () => {
  loadingSubstack.value = true;
  substackError.value = false;
  
  // DADOS MANUAIS (Seu artigo garantido)
  const manualPosts = [
    { 
      title: 'Blogs x Jardins Digitais - Introdução', 
      link: 'https://shiftrealitydesigner.substack.com/p/jardim-digital-introducao', 
      pubDate: new Date().toISOString(), 
      description: 'Uma exploração sobre a construção de espaços digitais, curadoria de conhecimento e a filosofia por trás dos jardins digitais.' 
    }
  ];

  try {
    const response = await fetch(RSS_FEED_URL);
    const data = await response.json();
    
    // Se a API funcionar mas não tiver itens (feed novo ou privado), usa o manual
    if (data.status === 'ok' && (!data.items || data.items.length === 0)) {
       console.warn("Feed vazio. Usando fallback manual.");
       substackFeed.value = { items: manualPosts };
       return;
    }

    // Se a API trouxer itens, usa eles
    if (data.status === 'ok' && data.items.length > 0) {
      substackFeed.value = {
        ...data,
        items: data.items.slice(0, 3)
      };
    } else {
      throw new Error('Status da API inválido');
    }
  } catch (error) {
    console.error('Erro ao buscar feed (ativando fallback):', error);
    // Se der erro de rede (CORS/Offline), usa o manual
    substackFeed.value = { items: manualPosts };
  } finally {
    loadingSubstack.value = false;
  }
};;

// Função para formatar datas
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '.');
  } catch {
    return dateString;
  }
};

// Função para remover tags HTML
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
};

// CORREÇÃO: Adicionado evento de clique no documento para fechar seletor de idioma
const langMenuOpen = ref(false);
const toggleLangMenu = () => {
  langMenuOpen.value = !langMenuOpen.value;
};

const setLang = (lang: string) => {
  currentLang.value = lang;
  langMenuOpen.value = false;
};

// --- IMAGENS DOS PROJETOS (CENTRALIZADAS) ---
const projectImages: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1080&auto=format&fit=crop',
  2: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1080&auto=format&fit=crop',
  3: 'https://images.unsplash.com/photo-1558137623-ce933996c730?q=80&w=2006&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  4: 'https://images.unsplash.com/photo-1727328982998-b3ec4ed239cc?q=80&w=1080&auto=format&fit=crop',
  5: 'https://images.unsplash.com/photo-1599658880436-c61792e70672?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  6: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1080&auto=format&fit=crop'
};

// --- TRADUÇÕES ---
const t = {
  en: {
    nav: { home: 'Home', projects: 'Projects', playground: 'Labs', writing: 'Writing', about: 'About me', contact: 'Contact' },
    hero: {
      badge: 'STATUS: ONLINE // AVAILABLE FOR CONTRACTS',
      role: 'Design Engineer | Creative Technologist | Computational Physicist',
      btn_explore: 'View Projects', btn_cv: 'Resume', btn_contact: 'Get in touch', main_title: 'WESLLEY SOARES'
    },
    stats: { projects: 'Tech Projects', exp: 'Years Tech Exp.', cert: 'Certifications', progress: 'Degree Progress' },
    titles: { 
      selected_works: 'Featured Projects', playground: 'Creative Lab (R&D)', 
      thoughts: 'Digital Garden & Essays', about: 'About me', contact: "Let's Work Together." 
    },
    subtitles: { 
      works: 'Selected projects in transdisciplinary education, robotics, and data architecture.',
      playground: 'Experimental research and hardware-software integration tests.',
      writing: 'Essays on the intersection of computing, philosophy of technology, and audiovisual aesthetics.',
      contact: 'Based in São José dos Campos, available for remote or in-person projects.',
      footer: 'WESLLEY SOARES', footer_desc: 'Built with Vue 3, Tailwind CSS & Motion', btn_email: 'Send Email',
      substack_latest: "Latest essays and long-form thoughts.",
      view_all_posts: "VIEW ALL POSTS",
      read_article: "Read article",
      loading_posts: "Loading latest posts...",
      error_loading: "Unable to load posts at this time."
    },
    about: { academic: 'Academic', professional: 'Professional', tech: 'Core Expertise' },
    projects_list: [
      { id: 1, title: 'Learning How to Learn', desc: 'Repository for transdisciplinary education based on cognitive sciences and heuristics.', tags: ['Pedagogy', 'Learning'], icon: GraduationCap, link: 'https://github.com/073145/learning-how_to_learn' },
      { id: 2, title: 'CompuThink', desc: 'Fundamentals of computational thinking, algorithms, and hardware/software abstractions.', tags: ['Logic', 'CS Basics'], icon: Code2, link: 'https://github.com/073145/computhink-101' },
      { id: 3, title: 'MECHA-BLOCKS', desc: 'Modular Robotics Framework focused on physics of actuation, torque, and simulation-first engineering.', tags: ['Robotics', 'Physics', 'C++'], icon: Box, link: 'https://github.com/073145/mecha-blocks' },
      { id: 4, title: 'FRWK-MOBILE', desc: 'Exploring the frontier of mobile interactivity: Creative tech (synths), XR (AR/VR), and physical computing.', tags: ['Mobile', 'Creative Tech', 'XR'], icon: Network, link: 'https://github.com/073145/frwk-mobile' },
      { id: 5, title: 'DataSci-WebDev', desc: 'Connecting Data Science with Web Dev through ML pipelines and interactive visualizations.', tags: ['ML', 'Web', 'DataViz'], icon: Database, link: 'https://github.com/073145/data_sci-webdev' },
      { id: 6, title: 'CRUCIBLE-RL', desc: 'Reinforcement Learning testing ground for accelerated simulations before real deployment.', tags: ['AI', 'Simulation', 'RL'], icon: BrainCircuit, link: 'https://github.com/073145/CRUCIBLE-RL' }
    ],
    lab_list: [
      { title: 'Electronic Circuits', desc: 'Oscillators and active filters research for audio and signal processing.', icon: Cpu, link: 'https://github.com/073145/substrate-blueprints' },
      { title: 'Mathematical Viz', desc: 'Numerical modeling, linear algebra, and dynamic systems simulation.', icon: BrainCircuit, link: 'https://github.com/073145/gnu_octave-lib' },
      { title: 'Creative Coding Snippets', desc: 'Generative algorithms, shaders, and audiovisual processing modules for real-time performance.', icon: Zap, link: 'https://github.com/073145/code-aesthetics' },
      { title: 'Game Engine Core', desc: 'C++ prototypes: modeling, rendering, and rigid body physics.', icon: Terminal, link: 'https://github.com/073145/gamejam-collab' }
    ],
    acad_list: [
      { title: 'B.S. Computer Engineering', inst: 'Univesp • 2023 - 2028', desc: 'Computational physics and software engineering core.' },
      { title: 'Industrial Automation', inst: 'ETEC Ilza Irma • 2019 - 2021', desc: 'Focus on industrial instrumentation, process control, and PLC programming.' },
      { title: 'Electronics', inst: 'CEPHAS • 2018', desc: 'Training in analog/digital circuits and preventive hardware maintenance.' }
    ],
    prof_list: [
      { title: 'Engineering Intern', inst: 'Id-Subsea • 2023 - 2024', desc: 'Specialized support and maintenance for subsea control hardware.' },
      { title: 'Industrial Maintenance', inst: 'Rentelck • 2019', desc: 'Critical hardware diagnosis and repair, optimizing operational availability.' }
    ]
  },
  pt: {
    nav: { home: 'Início', projects: 'Projetos', playground: 'Labs', writing: 'Artigos', about: 'Sobre mim', contact: 'Contato' },
    hero: {
      badge: 'STATUS: ONLINE // DISPONÍVEL PARA PROJETOS',
      role: 'Design Engineer | Creative Technologist | Computational Physicist',
      btn_explore: 'Ver Projetos', btn_cv: 'Currículo', btn_contact: 'Entre em contato', main_title: 'WESLLEY SOARES'
    },
    stats: { projects: 'Projetos Tech', exp: 'Anos Exp. Técnica', cert: 'Certificações', progress: 'Progresso do Curso' },
    titles: { 
      selected_works: 'Projetos em Destaque', playground: 'Laboratório Criativo (P&D)', 
      thoughts: 'Jardim Digital & Ensaios', about: 'Sobre mim', contact: "Vamos Trabalhar Juntos." 
    },
    subtitles: { 
      works: 'Projetos selecionados em educação transdisciplinar, robótica e arquitetura de dados.',
      playground: 'Projetos experimentais e explorações criativas em C++, Python e Hardware.',
      writing: 'Ensaios sobre a interseção entre computação, filosofia da tecnologia e estética audiovisual.',
      contact: 'Baseado em São José dos Campos, disponível para atuação em projetos remotos ou presenciais.',
      footer: 'WESLLEY SOARES', footer_desc: 'Desenvolvido com Vue 3, Tailwind CSS & Motion', btn_email: 'Enviar Email',
      substack_latest: "Últimos ensaios e reflexões aprofundadas.",
      view_all_posts: "VER TODAS AS POSTAGENS",
      read_article: "Ler artigo",
      loading_posts: "Carregando últimas postagens...",
      error_loading: "Não foi possível carregar as postagens no momento."
    },
    about: { academic: 'Academico', professional: 'Profissional', tech: 'Expertise Técnica' },
    projects_list: [
      { id: 1, title: 'Learning How to Learn', desc: 'Repositório para educação transdisciplinar baseada em ciências cognitivas e heurísticas.', tags: ['Pedagogia', 'Cognição'], icon: GraduationCap, link: 'https://github.com/073145/learning-how_to_learn' },
      { id: 2, title: 'CompuThink', desc: 'Fundamentos do pensamento computacional, algoritmos e abstrações de hardware/software.', tags: ['Lógica', 'CS Basics'], icon: Code2, link: 'https://github.com/073145/computhink-101' },
      { id: 3, title: 'MECHA-BLOCKS', desc: 'Modular Robotics Framework focado na física de atuação, torque e engenharia simulation-first.', tags: ['Robótica', 'Física', 'C++'], icon: Box, link: 'https://github.com/073145/mecha-blocks' },
      { id: 4, title: 'FRWK-MOBILE', desc: 'Explorando a fronteira da interatividade mobile: Tech criativa (sintetizadores), realidade estendida (AR/VR) e computação física.', tags: ['Mobile', 'Tech Criativa', 'XR'], icon: Network, link: 'https://github.com/073145/frwk-mobile' },
      { id: 5, title: 'DataSci-WebDev', desc: 'Conectando Data Science com Web Dev através de Machine Learning e visualizações interativas.', tags: ['ML', 'Python', 'Web'], icon: Database, link: 'https://github.com/073145/data_sci-webdev' },
      { id: 6, title: 'CRUCIBLE-RL', desc: 'Plataforma de testes de aprendizado por reforço para simulações aceleradas antes da implementação real.', tags: ['AI', 'Simulação', 'RL'], icon: BrainCircuit, link: 'https://github.com/073145/CRUCIBLE-RL' }
    ],
    lab_list: [
      { title: 'Circuitos Eletrônicos', desc: 'Osciladores e filtros ativos para tratamento de sinais e áudio.', icon: Cpu, link: 'https://github.com/073145/substrate-blueprints' },
      { title: 'Visualização Matemática', desc: 'Modelagem numérica, álgebra linear e simulação de sistemas dinâmicos.', icon: BrainCircuit, link: 'https://github.com/073145/gnu_octave-lib' },
      { title: 'Creative Coding Snippets', desc: 'Algoritmos generativos, shaders e módulos de processamento audiovisual em tempo real.', icon: Zap, link: 'https://github.com/073145/code-aesthetics' },
      { title: 'Engine de Jogos (C++)', desc: 'Protótipos focados em modelagem, renderização e física de corpos rígidos.', icon: Terminal, link: 'https://github.com/073145/gamejam-collab' }
    ],
    acad_list: [
      { title: 'B.S. Eng. de Computação', inst: 'Univesp • 2023 - 2028', desc: 'Foco em física computacional e engenharia de software.' },
      { title: 'Automação Industrial', inst: 'ETEC Ilza Irma • 2019 - 2021', desc: 'Foco em instrumentação industrial, controle de processos e programação de CLPs.' },
      { title: 'Eletrônica', inst: 'CEPHAS • 2018', desc: 'Formação em circuitos analógicos/digitais e manutenção preventiva de hardware.' }
    ],
    prof_list: [
      { title: 'Estágio em Engenharia', inst: 'Id-Subsea • 2023 - 2024', desc: 'Suporte especializado e manutenção para hardware de controle subaquático.' },
      { title: 'Manutenção Industrial', inst: 'Rentelck • 2019', desc: 'Diagnóstico crítico e reparo de hardware, otimizando a disponibilidade operacional.' }
    ]
  },
  es: {
    nav: { home: 'Inicio', projects: 'Proyectos', playground: 'Labs', writing: 'Artículos', about: 'Sobre mí', contact: 'Contacto' },
    hero: {
      badge: 'ESTADO: ONLINE // DISPONIBLE PARA PROYECTOS',
      role: 'Design Engineer | Creative Technologist | Computational Physicist',
      btn_explore: 'Ver Proyectos', btn_cv: 'Currículum', btn_contact: 'Contactar', main_title: 'WESLLEY SOARES'
    },
    stats: { projects: 'Proyectos Tech', exp: 'Años Exp. Técnica', cert: 'Certificaciones', progress: 'Progreso del Curso' },
    titles: { 
      selected_works: 'Proyectos Destacados', playground: 'Laboratorio Creativo', 
      thoughts: 'Jardín Digital y Ensayos', about: 'Sobre mí', contact: "Vamos a trabajar juntos." 
    },
    subtitles: { 
      works: 'Proyectos sobre educación transdisciplinar, robótica y arquitectura de datos.',
      playground: 'Investigación experimental y pruebas de integración hardware-software.',
      writing: 'Ensayos sobre la intersección entre computación, filosofía y estética audiovisual.',
      contact: 'Con sede en São José dos Campos, disponible para trabajar en proyectos remotos o presenciales.',
      footer: 'WESLLEY SOARES', footer_desc: 'Desarrollado con Vue 3, Tailwind CSS & Motion', btn_email: 'Enviar Correo',
      substack_latest: "Últimos ensaios y reflexiones profundas.",
      view_all_posts: "VER TODAS LAS PUBLICACIONES",
      read_article: "Leer artículo",
      loading_posts: "Cargando últimas publicaciones...",
      error_loading: "No se pueden cargar las publicaciones en este momento."
    },
    about: { academic: 'Académico', professional: 'Profesional', tech: 'Stack Principal' },
    projects_list: [
      { id: 1, title: 'Learning How to Learn', desc: 'Repositorio de educación transdisciplinaria basado en las ciencias cognitivas y la heurística.', tags: ['Pedagogía', 'Cognición'], icon: GraduationCap, link: 'https://github.com/073145/learning-how_to_learn' },
      { id: 2, title: 'CompuThink', desc: 'Fundamentos del pensamiento computacional, algoritmos y abstracciones de hardware/software.', tags: ['Lógica', 'CS Basics'], icon: Code2, link: 'https://github.com/073145/computhink-101' },
      { id: 3, title: 'MECHA-BLOCKS', desc: 'El marco de robótica modular se centra en la física de actuación, el torque y la ingeniería de simulación primero.', tags: ['Robótica', 'Física', 'C++'], icon: Box, link: 'https://github.com/073145/mecha-blocks' },
      { id: 4, title: 'FRWK-MOBILE', desc: 'Explorando la frontera de la interactividad móvil: Tecnología creativa (sintetizadores), realidad extendida (XR) y computación física.', tags: ['Mobile', 'Tech Creativa', 'XR'], icon: Network, link: 'https://github.com/073145/frwk-mobile' },
      { id: 5, title: 'DataSci-WebDev', desc: 'Conectando Ciencia de Datos con Web Dev mediante ML y visualizaciones interactivas.', tags: ['ML', 'Web', 'DataViz'], icon: Database, link: 'https://github.com/073145/data_sci-webdev' },
      { id: 6, title: 'CRUCIBLE-RL', desc: 'El aprendizaje por refuerzo sirve como campo de pruebas para simulaciones aceleradas antes de la implementación real.', tags: ['AI', 'Simulación', 'RL'], icon: BrainCircuit, link: 'https://github.com/073145/CRUCIBLE-RL' }
    ],
    lab_list: [
      { title: 'Circuitos Electrónicos', desc: 'Investigación en osciladores y filtros activos para señales.', icon: Cpu, link: 'https://github.com/073145/substrate-blueprints' },
      { title: 'Visualización Matemática', desc: Modelado numérico, álgebra lineal y simulación de sistemas dinámicos.', icon: BrainCircuit, link: 'https://github.com/073145/gnu_octave-lib' },
      { title: 'Creative Coding Snippets', desc: 'Algoritmos generativos, shaders y módulos de procesamiento audiovisual en tiempo real.', icon: Zap, link: 'https://github.com/073145/code-aesthetics' },
      { title: 'Motor de Jogos (C++)', desc: 'Prototipos de modelado, renderizado y física de cuerpos rígidos.', icon: Terminal, link: 'https://github.com/073145/gamejam-collab' }
    ],
    acad_list: [
      { title: 'B.S. Ingeniería Informática', inst: 'Univesp • 2023 - 2028', desc: 'Enfoque en física computacional e ingeniería de software.' },
      { title: 'Automatización Industrial', inst: 'ETEC Ilza Irma • 2019 - 2021', desc: 'Formación en programación de PLC y control de procesos industriales.' },
      { title: 'Electrónica', inst: 'CEPHAS • 2018', desc: 'Circuitos analógicos/digitales y mantenimiento preventivo de hardware.' }
    ],
    prof_list: [
      { title: 'Pasantía en Ingeniería', inst: 'Id-Subsea • 2023 - 2024', desc: 'Soporte especializado y mantenimiento de hardware subacuático.' },
      { title: 'Mantenimiento Industrial', inst: 'Rentelck • 2019', desc: 'Diagnóstico crítico y reparación de hardware electrónico industrial.' }
    ]
  }
};

// Computed property que retorna as traduções do idioma atual
const txt = computed(() => t[currentLang.value] || t.pt);

// --- DADOS DINÂMICOS ---
const navItems = computed(() => [
  { id: 'home', icon: Home, label: txt.value.nav.home },
  { id: 'projects', icon: FolderOpen, label: txt.value.nav.projects },
  { id: 'playground', icon: Sparkles, label: txt.value.nav.playground },
  { id: 'writing', icon: PenTool, label: txt.value.nav.writing },
  { id: 'about', icon: User, label: txt.value.nav.about },
  { id: 'contact', icon: Mail, label: txt.value.nav.contact },
]);

const stats = computed(() => [
  { icon: Code2, value: '10+', label: txt.value.stats.projects },
  { icon: Award, value: '6+', label: txt.value.stats.exp },
  { icon: Zap, value: '5+', label: txt.value.stats.cert },
  { icon: GraduationCap, value: '40%', label: txt.value.stats.progress },
]);

const skills = [
  { name: 'C++ & Python', level: 'Intermediate', icon: Code2 },
  { name: 'Redes / Infra', level: 'Advanced', icon: Network },
  { name: 'Eletrônica Ind.', level: 'Specialist', icon: Cpu },
  { name: 'Automação (CLP)', level: 'Advanced', icon: Zap },
  { name: 'SQL / Database', level: 'Intermediate', icon: Database },
  { name: 'Hardware Maint.', level: 'Specialist', icon: Terminal },
];

// CORREÇÃO: Interface para elementos com propriedades customizadas
interface TypewriterElement extends HTMLElement {
  _typewriterTimer?: number;
  _typewriterObserver?: IntersectionObserver;
  _typewriterText?: string;
  _typewriterIndex?: number;
  _typewriterIsAnimating?: boolean;
}

// --- DIRETIVAS & CANVAS ---
const vTypewriter = {
  mounted: (el: TypewriterElement, binding: any) => {
    const text = binding.value;
    if (!text) return;
    
    el._typewriterText = text;
    el._typewriterIndex = 0;
    el._typewriterIsAnimating = false;
    
    // Configura o cursor
    el.classList.add('typing-cursor');
    
    const startTypewriter = () => {
      if (el._typewriterIsAnimating) return;
      
      el._typewriterIsAnimating = true;
      isTyping.value = true;
      el.textContent = '';
      el._typewriterIndex = 0;
      
      const type = () => {
        if (el._typewriterIndex! < el._typewriterText!.length) {
          el.textContent += el._typewriterText!.charAt(el._typewriterIndex!);
          el._typewriterIndex!++;
          el._typewriterTimer = setTimeout(type, 50);
        } else {
          el._typewriterIsAnimating = false;
          isTyping.value = false;
        }
      };
      
      type();
    };
    
    // Observador para iniciar quando elemento está visível
    el._typewriterObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !el._typewriterIsAnimating) {
        startTypewriter();
        el._typewriterObserver?.disconnect();
      }
    }, { threshold: 0.1 });
    
    el._typewriterObserver.observe(el);
  },
  
  updated: (el: TypewriterElement, binding: any) => {
    // CORREÇÃO: Só atualiza se o texto realmente mudou
    if (binding.value === binding.oldValue || binding.value === el._typewriterText) return;
    
    // Limpa timer atual
    if (el._typewriterTimer) {
      clearTimeout(el._typewriterTimer);
      el._typewriterTimer = undefined;
    }
    
    // Reseta estado
    el._typewriterText = binding.value;
    el._typewriterIndex = 0;
    el._typewriterIsAnimating = false;
    
    // Reinicia a animação imediatamente (sem esperar IntersectionObserver)
    // para mudanças de idioma
    const startTypewriter = () => {
      if (el._typewriterIsAnimating) return;
      
      el._typewriterIsAnimating = true;
      isTyping.value = true;
      el.textContent = '';
      el._typewriterIndex = 0;
      
      const type = () => {
        if (el._typewriterIndex! < el._typewriterText!.length) {
          el.textContent += el._typewriterText!.charAt(el._typewriterIndex!);
          el._typewriterIndex!++;
          el._typewriterTimer = setTimeout(type, 50);
        } else {
          el._typewriterIsAnimating = false;
          isTyping.value = false;
        }
      };
      
      type();
    };
    
    // Pequeno delay para garantir que o DOM foi atualizado
    setTimeout(startTypewriter, 10);
  },
  
  unmounted: (el: TypewriterElement) => {
    if (el._typewriterTimer) {
      clearTimeout(el._typewriterTimer);
    }
    if (el._typewriterObserver) {
      el._typewriterObserver.disconnect();
    }
  }
};

// Diretiva para animação de entrada ao scroll
const vIntersect = {
  mounted: (el: HTMLElement) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
  }
};

// Inicializa o efeito matrix no canvas
const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const columns = canvas.width / 14;
  const drops = Array(Math.floor(columns)).fill(1);
  
  const draw = () => {
    ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#10b981";
    ctx.font = "14px monospace";
    
    drops.forEach((y, i) => {
      if (Math.random() > 0.98) {
        ctx.fillText(Math.random() > 0.5 ? "0" : "1", i * 14, y * 14);
      }
      if (y * 14 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    });
  };
  
  setInterval(draw, 50);
};

// Função para scroll suave até seções
const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeSection.value = id;
  }
};

// CORREÇÃO: Watch para mudança de idioma que força atualização do typewriter
watch(currentLang, () => {
  // Força uma pequena pausa antes de atualizar elementos com typewriter
  setTimeout(() => {
    // Dispara um evento personalizado que os elementos com typewriter podem escutar
    window.dispatchEvent(new CustomEvent('language-changed'));
  }, 100);
});

onMounted(() => {
  initCanvas();
  fetchSubstackFeed(); // Busca o feed do Substack ao montar
  
  // CORREÇÃO: Adiciona event listener para fechar menu de idioma ao clicar fora
  const handleClickOutside = (event: MouseEvent) => {
    const langMenu = document.querySelector('.lang-menu-container');
    if (langMenu && !langMenu.contains(event.target as Node)) {
      langMenuOpen.value = false;
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  
  // Detecta seção ativa durante scroll
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.value = (winScroll / height) * 100;
    
    const sections = navItems.value.map(i => i.id);
    for (const s of sections) {
      const el = document.getElementById(s);
      if (el && window.scrollY >= (el.offsetTop - 150)) {
        activeSection.value = s;
      }
    }
  });
  
  // Remove event listener ao desmontar
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
    
    <!-- Efeito Matrix no background -->
    <canvas ref="canvasRef" class="fixed inset-0 pointer-events-none z-0 opacity-30"></canvas>
    <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>

    <!-- CORREÇÃO: Seletor de idioma com melhor controle de estado -->
    <div class="lang-menu-container fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] group flex flex-col-reverse items-center gap-3 outline-none" tabindex="0">
      <button @click="toggleLangMenu" class="w-12 h-12 bg-neutral-900 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 cursor-pointer hover:bg-neutral-800 hover:scale-110 hover:border-emerald-400 transition-all overflow-hidden relative active:scale-95 group-focus-within:ring-2 group-focus-within:ring-emerald-500/50">
        <img v-if="currentLang === 'en'" src="https://flagcdn.com/w80/us.png" class="w-full h-full object-cover" alt="English" />
        <img v-else-if="currentLang === 'pt'" src="https://flagcdn.com/w80/br.png" class="w-full h-full object-cover" alt="Português" />
        <img v-else-if="currentLang === 'es'" src="https://flagcdn.com/w80/es.png" class="w-full h-full object-cover" alt="Español" />
      </button>
      
      <!-- CORREÇÃO: Menu de idiomas controlado por v-show -->
      <div v-show="langMenuOpen" class="flex flex-col gap-3 pointer-events-auto transition-all duration-300 pb-4">
        <button @click="setLang('en')" class="w-10 h-10 rounded-full border-2 border-neutral-800 overflow-hidden hover:scale-110 hover:border-emerald-400 transition-all shadow-lg active:scale-95"><img src="https://flagcdn.com/w80/us.png" class="w-full h-full object-cover" alt="English"/></button>
        <button @click="setLang('pt')" class="w-10 h-10 rounded-full border-2 border-neutral-800 overflow-hidden hover:scale-110 hover:border-emerald-400 transition-all shadow-lg active:scale-95"><img src="https://flagcdn.com/w80/br.png" class="w-full h-full object-cover" alt="Português"/></button>
        <button @click="setLang('es')" class="w-10 h-10 rounded-full border-2 border-neutral-800 overflow-hidden hover:scale-110 hover:border-emerald-400 transition-all shadow-lg active:scale-95"><img src="https://flagcdn.com/w80/es.png" class="w-full h-full object-cover" alt="Español"/></button>
      </div>
    </div>

    <!-- Barra de progresso de scroll -->
    <div class="fixed top-0 left-0 h-1 z-[60] bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" :style="{ width: scrollProgress + '%' }"></div>

    <!-- Navegação principal -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-emerald-900/30 h-[60.8px] flex items-center px-10 justify-between">
      <div class="text-xl font-bold text-emerald-500 font-mono tracking-tighter cursor-pointer" @click="scrollTo('home')">0Z<span class="text-neutral-500">_ENG</span></div>
      <div class="hidden md:flex items-center gap-8">
        <button v-for="item in navItems" :key="item.id" @click="scrollTo(item.id)" 
          class="flex items-center gap-2 text-sm font-medium font-mono transition-all hover:text-white"
          :class="activeSection === item.id ? 'text-emerald-400 scale-105 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-neutral-400'">
          <component :is="item.icon" :size="16" /> {{ item.label }}
        </button>
      </div>
    </nav>

    <!-- Seção Hero -->
    <section id="home" class="min-h-screen flex flex-col justify-center relative pt-20 pb-16 overflow-hidden z-10 text-center space-y-5 px-4">
      <div class="w-24 h-24 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-[2px] shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-float">
        <div class="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center font-mono text-3xl text-emerald-500">0z</div>
      </div>
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-xs tracking-wider font-mono mx-auto backdrop-blur-md">
        <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>{{ txt.hero.badge }}
      </div>
      <h1 class="text-4xl sm:text-6xl font-bold tracking-tight px-2 leading-tight font-mono min-h-[1.2em] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        <!-- CORREÇÃO: Typewriter com controle de estado global -->
        <span class="bg-gradient-to-b from-white via-emerald-100 to-neutral-500 bg-clip-text text-transparent pb-1" v-typewriter="txt.hero.main_title"></span>
      </h1>
      <p class="text-base md:text-lg text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed px-4 scroll-trigger" v-intersect>{{ txt.hero.role }}</p>
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center pt-8 px-4 w-full max-w-4xl mx-auto scroll-trigger" v-intersect>
        <button @click="scrollTo('projects')" class="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-black rounded font-bold hover:bg-emerald-500 transition-all text-base font-mono shadow-lg shadow-emerald-500/20">{{ txt.hero.btn_explore }}</button>
        <a href="/resume.pdf" download class="w-full sm:w-auto px-8 py-3 border border-neutral-700 rounded font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all text-base flex items-center justify-center gap-2 font-mono"><Download :size="18" /> {{ txt.hero.btn_cv }}</a>
        <button @click="scrollTo('contact')" class="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold rounded hover:bg-neutral-200 transition-all text-base font-mono flex items-center justify-center gap-2 shadow-lg"><MessageSquare :size="18" /> {{ txt.hero.btn_contact }}</button>
      </div>
      <div class="container mx-auto px-4 mt-24 scroll-trigger" v-intersect>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="text-center py-3 transition-all hover:scale-105 group">
            <component :is="stat.icon" class="w-8 h-8 mb-3 mx-auto text-emerald-500 group-hover:text-emerald-300 transition-colors" />
            <div class="text-3xl font-bold text-white mb-1 tabular-nums">{{ stat.value }}</div>
            <div class="text-xs text-neutral-500 uppercase tracking-widest font-bold">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção Projetos -->
    <section id="projects" class="py-32 bg-neutral-950 relative z-10 border-t border-emerald-900/20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="flex flex-col items-center mb-16 gap-6 scroll-trigger" v-intersect>
          <div><h2 class="text-3xl md:text-5xl font-bold mb-4 font-mono"><span class="text-emerald-500 mr-2">></span><span v-typewriter="txt.titles.selected_works"></span></h2><p class="text-neutral-400 max-w-2xl mx-auto">{{ txt.subtitles.works }}</p></div>
          <a href="https://github.com/073145?tab=repositories" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-200 transition-all font-mono text-sm group uppercase tracking-widest">VIEW_ALL_REPOS <ExternalLink :size="14" class="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a v-for="p in txt.projects_list" :key="p.id" :href="p.link" target="_blank" rel="noopener noreferrer" class="group relative rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
            <!-- CORREÇÃO: Imagem obtida do objeto centralizado projectImages -->
            <div class="aspect-video overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700 shrink-0"><img :src="projectImages[p.id]" :alt="p.title" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" /></div>
            <div class="p-6 text-left flex flex-col flex-grow">
              <div class="flex justify-between items-start mb-4"><h3 class="text-xl font-bold font-mono text-white group-hover:text-emerald-400 transition-colors">{{ p.title }}</h3><component :is="p.icon" class="text-emerald-500/50" :size="20" /></div>
              <p class="text-sm text-neutral-400 leading-relaxed mb-6 flex-grow">{{ p.desc }}</p>
              <div class="flex flex-wrap gap-2 pt-4 border-t border-neutral-800/50"><span v-for="tag in p.tags" :key="tag" class="text-[10px] uppercase font-mono px-2 py-1 bg-emerald-950/30 text-emerald-400 rounded border border-emerald-900/30">{{ tag }}</span></div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Seção Labs/Playground -->
    <section id="playground" class="py-32 bg-neutral-900/20 border-t border-emerald-900/20 relative z-10 px-4">
      <div class="container mx-auto max-w-5xl text-center">
        <div class="mb-16 scroll-trigger" v-intersect>
          <h2 class="text-3xl md:text-5xl font-bold font-mono mb-4"><span class="text-emerald-500 mr-2">></span><span v-typewriter="txt.titles.playground"></span></h2>
          <p class="text-neutral-400 max-w-2xl mx-auto leading-relaxed">{{ txt.subtitles.playground }}</p>
        </div>
        <div class="grid md:grid-cols-2 gap-6 text-left">
          <a v-for="exp in txt.lab_list" :key="exp.title" :href="exp.link" target="_blank" rel="noopener noreferrer" class="p-6 bg-neutral-900/50 border border-neutral-800 rounded-3xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 shadow-lg">
            <div class="p-4 bg-emerald-950/30 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all shrink-0"><component :is="exp.icon" :size="28" /></div>
            <div><h3 class="text-lg font-bold mb-1 font-mono text-white group-hover:text-emerald-400 transition-colors">{{ exp.title }}</h3><p class="text-neutral-400 text-sm leading-relaxed">{{ exp.desc }}</p></div>
          </a>
        </div>
      </div>
    </section>

    <!-- Seção Artigos/Writing com feed dinâmico do Substack -->
    <section id="writing" class="py-32 border-t border-emerald-900/20 relative z-10 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="mb-12 text-center md:text-left scroll-trigger" v-intersect>
          <h2 class="text-3xl md:text-5xl font-bold mb-4 font-mono min-h-[1.5em] tracking-tight">
            <span class="text-emerald-500 mr-2">></span>
            <span v-typewriter="txt.titles.thoughts"></span>
          </h2>
          <p class="text-neutral-400 leading-relaxed">{{ txt.subtitles.writing }}</p>
          <p class="text-emerald-400/80 text-sm mt-2">{{ txt.subtitles.substack_latest }}</p>
        </div>
        
        <div v-if="loadingSubstack" class="space-y-4">
          <div v-for="n in 1" :key="n" class="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 animate-pulse">
            <div class="h-6 bg-neutral-800 rounded w-3/4 mb-4"></div>
            <div class="flex gap-4">
              <div class="h-4 bg-neutral-800 rounded w-24"></div>
              <div class="h-4 bg-neutral-800 rounded w-16"></div>
            </div>
          </div>
        </div>
        
        <div v-else-if="substackFeed" class="space-y-4">
          <a 
            v-for="post in substackFeed.items" 
            :key="post.guid || post.link"
            :href="post.link"
            target="_blank"
            rel="noopener noreferrer"
            class="block p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-emerald-500/30 transition-all group flex flex-col md:flex-row items-center justify-between gap-4 text-left scroll-trigger hover:bg-neutral-900" 
            v-intersect
          >
            <div class="w-full">
              <h3 class="text-xl font-bold font-mono text-neutral-200 group-hover:text-emerald-400 mb-2">
                {{ post.title }}
              </h3>
              <div class="flex gap-4 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                <span>DATE: {{ formatDate(post.pubDate) }}</span>
                <span class="text-emerald-600">// SUBSTACK</span>
              </div>
              <p class="text-neutral-400 text-sm mt-3 line-clamp-2" v-if="post.description">
                {{ stripHtmlTags(post.description) }}
              </p>
            </div>
            <ExternalLink :size="20" class="text-neutral-600 group-hover:text-emerald-400 hidden md:block transition-colors flex-shrink-0" />
          </a>
        </div>
        
        <div class="text-center mt-10 scroll-trigger" v-intersect>
          <a 
            :href="SUBSTACK_SITE_URL" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 px-8 py-4 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20 hover:border-emerald-400 transition-all rounded-full font-mono text-sm tracking-wider group"
          >
            {{ txt.subtitles.view_all_posts }}
            <ExternalLink :size="16" class="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>

    <!-- Seção Sobre -->
    <section id="about" class="py-32 bg-neutral-900/30 relative z-10 border-t border-emerald-900/20 px-6">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-4xl font-bold mb-16 text-center font-mono min-h-[1.5em] uppercase tracking-widest"><span class="text-emerald-500 mr-2">></span><span v-typewriter="txt.titles.about"></span></h2>
        <div class="grid md:grid-cols-2 gap-8 mb-16 scroll-trigger" v-intersect>
          <div class="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 group hover:border-emerald-500/20 transition-all">
            <div class="flex items-center gap-3 mb-6 text-emerald-400"><GraduationCap :size="28" /> <h3 class="text-2xl font-bold font-mono">{{ txt.about.academic }}</h3></div>
            <!-- CORREÇÃO: Usa txt.value diretamente para reatividade -->
            <div class="space-y-8 border-l-2 border-neutral-800 pl-8 text-left relative">
              <div v-for="item in txt.acad_list" :key="item.title" class="relative">
                <div class="absolute -left-[39px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <h4 class="text-white font-bold text-lg font-mono">{{ item.title }}</h4>
                <p class="text-neutral-400 text-sm mb-1">{{ item.inst }}</p>
                <p class="text-neutral-500 text-xs leading-relaxed">{{ item.desc }}</p>
              </div>
            </div>
          </div>
          <div class="p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 group hover:border-emerald-500/20 transition-all">
            <div class="flex items-center gap-3 mb-6 text-emerald-400"><Briefcase :size="28" /> <h3 class="text-2xl font-bold font-mono">{{ txt.about.professional }}</h3></div>
            <!-- CORREÇÃO: Usa txt.value diretamente para reatividade -->
            <div class="space-y-8 border-l-2 border-neutral-800 pl-8 text-left relative">
              <div v-for="item in txt.prof_list" :key="item.title" class="relative">
                <div class="absolute -left-[39px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <h4 class="text-white font-bold text-lg font-mono">{{ item.title }}</h4>
                <p class="text-neutral-400 text-sm mb-1">{{ item.inst }}</p>
                <p class="text-neutral-500 text-xs leading-relaxed">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-neutral-900/50 p-10 rounded-3xl border border-neutral-800 scroll-trigger" v-intersect>
          <h3 class="text-2xl font-bold mb-10 text-center font-mono text-white tracking-widest uppercase">{{ txt.about.tech }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="skill in skills" :key="skill.name" class="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center gap-5 group hover:border-emerald-500/40 transition-all duration-300">
              <div class="p-3 bg-emerald-950/30 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all"><component :is="skill.icon" :size="24" /></div>
              <div class="text-left"><div class="text-base font-bold text-white uppercase tracking-wider mb-1">{{ skill.name }}</div><div class="text-xs font-mono text-emerald-500/70">{{ skill.level }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção Contato -->
    <section id="contact" class="py-32 text-center relative overflow-hidden z-10 border-t border-emerald-900/20 px-4">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="container mx-auto relative z-10 scroll-trigger" v-intersect>
        <h2 class="text-4xl md:text-6xl font-bold mb-8 tracking-tight font-mono min-h-[1.2em]"><span v-typewriter="txt.titles.contact"></span></h2>
        <p class="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">{{ txt.subtitles.contact }}</p>
        <div class="flex justify-center gap-8 mb-12">
          <a href="https://linkedin.com/in/weslley-frondana" target="_blank" class="text-neutral-500 hover:text-emerald-400 transition-all hover:scale-125 transform"><Linkedin :size="32" /></a>
          <a href="https://github.com/073145" target="_blank" class="text-neutral-500 hover:text-emerald-400 transition-all hover:scale-125 transform"><Github :size="32" /></a>
          <a href="https://behance.net/weslleysfrondana" target="_blank" class="text-neutral-500 hover:text-emerald-400 transition-all hover:scale-125 transform"><Layout :size="32" /></a>
          <a href="https://youtube.com/@weslleyfrondana" target="_blank" class="text-neutral-500 hover:text-emerald-400 transition-all hover:scale-125 transform"><Youtube :size="32" /></a>
        </div>
        <a href="mailto:ws.frondana@gmail.com" class="inline-flex items-center gap-3 px-12 py-5 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"><Mail :size="20" /> {{ txt.subtitles.btn_email }}</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 border-t border-neutral-900 bg-neutral-950 relative z-10 px-10">
      <div class="container mx-auto text-left font-mono">
        <p class="text-xl font-bold text-white mb-2">WESLLEY SOARES © {{ new Date().getFullYear() }}</p>
        <p class="text-xs text-neutral-500 tracking-[0.2em] uppercase">{{ txt.subtitles.footer_desc }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.typing-cursor::after { content: '_'; color: #10b981; animation: blink 1s step-end infinite; font-size: 0.6em; vertical-align: baseline; }
@keyframes blink { 50% { opacity: 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.animate-float { animation: float 6s ease-in-out infinite; }
.scroll-trigger { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
.scroll-trigger.is-visible { opacity: 1; transform: translateY(0); }
</style>
