<template>
  <section class="hero-banner relative h-[600px] overflow-hidden bg-gradient-to-r from-primary/10 to-primary-dark/10">
    <div class="swiper-container h-full">
      <div class="swiper-wrapper">
        <div v-for="(slide, index) in slides" :key="index" class="swiper-slide relative">
          <img :src="slide.image" :alt="slide.title" class="h-full w-full object-cover" />
          <div class="absolute inset-0 flex items-center bg-black/20">
            <div class="container">
              <div class="max-w-2xl text-white animate-fade-in translate-y-0 opacity-100 transition-all duration-700">
                <h2 class="mb-4 text-6xl font-bold tracking-tight drop-shadow-xl">{{ slide.title }}</h2>
                <p class="mb-8 text-2xl font-light opacity-90 drop-shadow-lg">{{ slide.subtitle }}</p>
                <RouterLink v-if="slide.link" :to="slide.link" class="btn btn-primary btn-lg inline-block px-10 py-4 shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                  {{ slide.buttonText }}
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页器 -->
      <div class="swiper-pagination"></div>
      <!-- 导航按钮 -->
      <div class="swiper-button-prev !text-white/50 hover:!text-white transition-colors"></div>
      <div class="swiper-button-next !text-white/50 hover:!text-white transition-colors"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Slide {
  image: string
  title: string
  subtitle: string
  buttonText: string
  link?: string
}

const slides = ref<Slide[]>([
  {
    image: '/uploads/products/serum.png',
    title: '焕发肌肤光彩',
    subtitle: '专业护肤，由内而外的美丽蜕变',
    buttonText: '立即选购',
    link: '/products?category=1',
  },
  {
    image: '/uploads/products/lipstick.png',
    title: '奢华彩妆系列',
    subtitle: '精致妆容，展现独特魅力',
    buttonText: '探索更多',
    link: '/products?category=2',
  }
])

const swiperInstance = ref<any>(null)

onMounted(() => {
  swiperInstance.value = new Swiper('.swiper-container', {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    speed: 1000,
  })
})
</script>

<style scoped>
.hero-banner :deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
  width: 12px;
  height: 12px;
}

.hero-banner :deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #e6c9b8;
  width: 30px;
  border-radius: 6px;
  transition: all 0.3s;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>
