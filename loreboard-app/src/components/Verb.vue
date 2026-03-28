<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  verb: { type: Object, required: true },
  slottedCards: { type: Array, default: () => [] },
  isHighlighted: { type: Boolean, default: false }
})

const emit = defineEmits(['drop', 'dragover', 'dragleave'])

const isDragOver = ref(false)
const isRejected = ref(false)

const handleDragOver = (e) => {
  e.preventDefault()
  
  // Basic pre-validation on drag over
  const draggedData = e.dataTransfer.getData('application/json')
  // We can't always read dataTransfer in dragover in all browsers, 
  // but we can try or we just wait for drop.
  isDragOver.value = true
  isRejected.value = false
  emit('dragover', e)
}

const handleDragLeave = (e) => {
  isDragOver.value = false
  isRejected.value = false
  emit('dragleave', e)
}

const handleDrop = (e) => {
  isDragOver.value = false
  
  const rawData = e.dataTransfer.getData('application/json')
  if (!rawData) {
    rejectDrop()
    return
  }

  const cardData = JSON.parse(rawData)
  
  // --- Slot Validation Logic (Interaction Boundaries T-04) ---
  const hasAspect = cardData.aspects.some(a => props.verb.requiredAspects.includes(a))
  
  if (!hasAspect) {
    rejectDrop()
    return
  }

  // --- Success (T-05) ---
  isRejected.value = false
  emit('drop', { card: cardData, verbId: props.verb.id })
}

const rejectDrop = () => {
  isRejected.value = true
  setTimeout(() => {
    isRejected.value = false
  }, 500) // Duration of the shake animation
}

// Verb colors - Black & Orange theme with 80% opacity backgrounds
const verbColors = {
  study: 'border-orange-500/50 bg-orange-900/10 shadow-orange-900/30',
  work: 'border-orange-400/50 bg-orange-900/5 shadow-orange-900/20',
  explore: 'border-amber-500/50 bg-amber-900/10 shadow-amber-900/30',
  nemesis: 'border-red-500/50 bg-red-900/10 shadow-red-900/30'
}

const colorClass = computed(() => verbColors[props.verb.type] || 'border-zinc-600/50 bg-zinc-900/10')
</script>

<template>
  <div 
    class="relative w-48 min-h-[160px] p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-start gap-4 cursor-pointer"
    :class="[
      colorClass, 
      'bg-opacity-80 backdrop-blur-sm',
      'shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40',
      isDragOver && !isRejected ? 'border-orange-400 scale-[1.02]' : '',
      isRejected ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : '',
      verb.state === 'READY' ? 'border-orange-400' : ''
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Background Icon / Title -->
    <div class="text-center w-full border-b border-zinc-700/50 pb-2 mb-2 pointer-events-none">
      <span class="text-3xl opacity-80">{{ verb.icon }}</span>
      <h3 class="font-bold text-zinc-100 mt-1">{{ verb.label }}</h3>
      <p 
        class="text-[10px] mt-0.5 tracking-wider uppercase transition-colors"
        :class="verb.state === 'READY' ? 'text-orange-400 font-bold' : 'text-zinc-500'"
      >
        {{ verb.state || 'IDLE' }}
      </p>
    </div>

    <!-- The actual slot - highlighted when valid card is dragged -->
    <div 
      class="w-full h-24 rounded-lg border-2 border-dashed bg-zinc-950/30 flex items-center justify-center p-1 relative overflow-hidden transition-all duration-200 pointer-events-none"
      :class="[
        isHighlighted ? 'border-orange-400 bg-orange-900/20 shadow-[0_0_15px_3px_rgba(251,146,60,0.3)]' : 'border-zinc-600/50',
        isDragOver && !isRejected ? 'border-orange-400/50 bg-orange-900/10' : '',
        isRejected ? 'border-red-500/80 bg-red-900/20' : ''
      ]"
    >
      <template v-if="slottedCards.length === 0">
        <span class="text-zinc-500 text-xs text-center px-2">Requires: <br/><span class="text-zinc-400 font-bold">{{ verb.requiredAspects.join(', ') }}</span></span>
      </template>
      <template v-else>
        <!-- For MVP, we'll just show the first card inserted -->
        <slot name="slotted-card" :card="slottedCards[0]"></slot>
      </template>
    </div>

    <!-- Processing animation overlay (T-06 Absolute Lock) -->
    <div v-if="verb.state === 'IGNITED'" class="absolute inset-0 bg-zinc-950/80 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm z-20 pointer-events-auto">
      <div class="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs text-orange-400 mt-4 tracking-widest uppercase font-bold animate-pulse">Processing</span>
    </div>

    <!-- Ignite Button (Appears when READY) -->
    <button 
      v-if="verb.state === 'READY'"
      @click="emit('ignite', verb.id)"
      class="absolute -bottom-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-orange-900/50 transition-all hover:scale-105 active:scale-95 z-30 ring-2 ring-orange-400/50"
    >
      Ignite
    </button>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}
</style>