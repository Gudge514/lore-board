<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  verb: { type: Object, required: true },
  slottedCards: { type: Array, default: () => [] }
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

// Verb colors
const verbColors = {
  study: 'border-blue-500/50 bg-blue-900/10 shadow-blue-900/50',
  work: 'border-emerald-500/50 bg-emerald-900/10 shadow-emerald-900/50',
  explore: 'border-indigo-500/50 bg-indigo-900/10 shadow-indigo-900/50',
  nemesis: 'border-rose-500/50 bg-rose-900/10 shadow-rose-900/50'
}

const colorClass = computed(() => verbColors[props.verb.type] || 'border-slate-500/50 bg-slate-900/50')
</script>

<template>
  <div 
    class="relative w-48 min-h-[160px] p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-start gap-4"
    :class="[
      colorClass, 
      isDragOver && !isRejected ? 'ring-4 ring-emerald-500/50 scale-[1.02] bg-slate-800' : 'ring-1 ring-slate-800',
      isRejected ? 'ring-4 ring-rose-500 border-rose-500 animate-[shake_0.5s_ease-in-out]' : ''
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Background Icon / Title -->
    <div class="text-center w-full border-b border-slate-700/50 pb-2 mb-2 pointer-events-none">
      <span class="text-3xl opacity-80">{{ verb.icon }}</span>
      <h3 class="font-bold text-slate-200 mt-1">{{ verb.label }}</h3>
      <p 
        class="text-[10px] mt-0.5 tracking-wider uppercase transition-colors"
        :class="verb.state === 'READY' ? 'text-emerald-400 font-bold' : 'text-slate-400'"
      >
        {{ verb.state || 'IDLE' }}
      </p>
    </div>

    <!-- The actual slot -->
    <div 
      class="w-full h-24 rounded-lg border-2 border-dashed bg-slate-950/30 flex items-center justify-center p-1 relative overflow-hidden transition-colors pointer-events-none"
      :class="[
        isDragOver && !isRejected ? 'border-emerald-400/50 bg-emerald-900/20' : 'border-slate-600/50',
        isRejected ? 'border-rose-500/80 bg-rose-900/30' : ''
      ]"
    >
      <template v-if="slottedCards.length === 0">
        <span class="text-slate-500 text-xs text-center px-2">Requires: <br/><span class="text-slate-400 font-bold">{{ verb.requiredAspects.join(', ') }}</span></span>
      </template>
      <template v-else>
        <!-- For MVP, we'll just show the first card inserted -->
        <slot name="slotted-card" :card="slottedCards[0]"></slot>
      </template>
    </div>

    <!-- Processing animation overlay (T-06 Absolute Lock) -->
    <div v-if="verb.state === 'IGNITED'" class="absolute inset-0 bg-slate-900/80 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm z-20 pointer-events-auto">
      <div class="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs text-rose-400 mt-4 tracking-widest uppercase font-bold animate-pulse">Processing</span>
    </div>

    <!-- Ignite Button (Appears when READY) -->
    <button 
      v-if="verb.state === 'READY'"
      @click="emit('ignite', verb.id)"
      class="absolute -bottom-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-emerald-900/50 transition-all hover:scale-105 active:scale-95 z-30 ring-2 ring-emerald-400/50"
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