<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  isSlot: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isSelected: { type: Boolean, default: false },
  compact: { type: Boolean, default: false } // Compact mode for drawer
})

const emit = defineEmits(['click', 'select'])

const handleClick = (e) => {
  e.stopPropagation()
  emit('select', { cardId: props.card.id })
  emit('click', e)
}

// Removed HTML5 drag events - using custom mouse drag in App.vue

// Color mapping based on card type - Black & Orange theme with 80% opacity backgrounds
const typeColors = {
  dynamic: 'border-orange-400/50 bg-orange-50/80 shadow-orange-900/20',
  static: 'border-zinc-500/50 bg-zinc-100/80 shadow-zinc-900/20',
  secret: 'border-amber-500/50 bg-amber-50/80 shadow-amber-900/20',
  nemesis: 'border-red-500/50 bg-red-50/80 shadow-red-900/20'
}

const colorClass = computed(() => typeColors[props.card.type] || typeColors.static)
</script>

<template>
  <div 
    :class="[
      'relative flex flex-col rounded-lg border transition-all duration-200 group',
      'bg-opacity-80 backdrop-blur-sm',
      'shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40',
      compact ? 'h-36 p-2' : 'min-h-[100px] p-3',
      isSlot ? 'w-full h-full' : 'w-full',
      isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing hover:-translate-y-1',
      isSelected ? 'outline outline-2 outline-orange-400/50 outline-offset-2' : '',
      colorClass
    ]"
    @click.stop="handleClick"
  >
    <!-- Card Header: Type + Duration -->
    <div class="flex items-start justify-between z-10 mb-2">
      <span class="text-[10px] font-bold uppercase tracking-widest truncate" :class="compact ? 'text-zinc-500' : 'text-zinc-400'">
        {{ card.type }}
      </span>
      
      <!-- Ephemeral Timer -->
      <div v-if="card.duration && !compact" class="flex items-center gap-1 text-xs text-orange-400/80 animate-pulse">
        ⏳ {{ card.duration }}s
      </div>
    </div>

    <!-- Card Label -->
    <div class="z-10 mb-2 flex-1 min-h-0">
      <h3 
        class="font-medium break-words leading-tight"
        :class="compact ? 'text-xs text-zinc-300 line-clamp-2' : 'text-sm text-zinc-100 line-clamp-3'"
      >
        {{ card.label }}
      </h3>
    </div>

    <!-- Aspect tags -->
    <div class="flex flex-wrap gap-1 z-10" :class="compact ? 'mt-auto' : 'mt-3'">
      <span 
        v-for="aspect in card.aspects.slice(0, compact ? 3 : undefined)" 
        :key="aspect"
        class="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-950/50 border border-zinc-700/50 text-zinc-400 truncate max-w-full"
      >
        {{ aspect }}
      </span>
      <span v-if="compact && card.aspects.length > 3" class="text-[10px] text-zinc-500">
        +{{ card.aspects.length - 3 }}
      </span>
    </div>

    <!-- Lock overlay if processing -->
    <div v-if="isLocked" class="absolute inset-0 bg-zinc-950/50 flex items-center justify-center rounded-lg z-20 backdrop-blur-[1px]">
      <span class="text-xs font-bold uppercase tracking-widest text-orange-400">LOCKED</span>
    </div>
  </div>
</template>