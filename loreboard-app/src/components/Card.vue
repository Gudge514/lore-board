<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  isSlot: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false }
})

// Removed HTML5 drag events - using custom mouse drag in App.vue

// Color mapping based on card type - Black & Orange theme
const typeColors = {
  dynamic: 'border-orange-400/50 bg-orange-900/15 shadow-orange-900/40',
  static: 'border-zinc-600/50 bg-zinc-800 shadow-zinc-900/50',
  secret: 'border-amber-500/50 bg-amber-900/15 shadow-amber-900/40',
  nemesis: 'border-red-500/50 bg-red-900/15 shadow-red-900/40'
}

const colorClass = computed(() => typeColors[props.card.type] || typeColors.static)
</script>

<template>
  <div 
    :class="[
      'relative flex flex-col justify-between p-3 rounded-lg border transition-all duration-200 group',
      isSlot ? 'w-full h-full' : 'w-full min-h-[100px]',
      isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing hover:shadow-lg',
      colorClass
    ]"
  >
    <!-- Background pattern/noise -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>

    <div class="flex items-start justify-between z-10">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-widest text-zinc-400">
          {{ card.type }}
        </span>
      </div>
      
      <!-- Ephemeral Timer (if duration exists) -->
      <div v-if="card.duration" class="flex items-center gap-1 text-xs text-orange-400/80 animate-pulse">
        ⏳ {{ card.duration }}s
      </div>
    </div>

    <div class="mt-4 z-10">
      <h3 class="font-medium text-zinc-100 text-sm break-words leading-tight">{{ card.label }}</h3>
    </div>

    <!-- Aspect tags -->
    <div class="mt-3 flex flex-wrap gap-1 z-10">
      <span 
        v-for="aspect in card.aspects" 
        :key="aspect"
        class="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-950/50 border border-zinc-700/50 text-zinc-400"
      >
        {{ aspect }}
      </span>
    </div>

    <!-- Lock overlay if processing -->
    <div v-if="isLocked" class="absolute inset-0 bg-zinc-950/50 flex items-center justify-center rounded-lg z-20 backdrop-blur-[1px]">
      <span class="text-xs font-bold uppercase tracking-widest text-orange-400">LOCKED</span>
    </div>
  </div>
</template>