<script setup>
import { ref } from 'vue'
import Card from './components/Card.vue'
import Verb from './components/Verb.vue'

// --- Data Models (MVP Fake State) ---

// 1. Hand (Drawer): What the Sensei starts with
const drawerCards = ref([
  { id: 'c1', type: 'dynamic', label: 'Google CSE API Key', aspects: ['key', 'tool'], duration: null },
  { id: 'c2', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120 },
  { id: 'c3', type: 'secret', label: 'Stripe Test Token', aspects: ['key', 'finance'], duration: null },
  { id: 'c4', type: 'nemesis', label: 'Rate Limit Blocked', aspects: ['error', 'blocker'], duration: null }
])

// 2. Tabletop (Canvas): Where things are moved/dropped
const tabletopCards = ref([
  { id: 't1', type: 'static', label: 'Initial Lore Fragment', aspects: ['knowledge'], duration: null, x: 100, y: 100 }
])

// 3. Verbs (Slots): The tasks
// States: IDLE -> READY -> IGNITED -> COMPLETE
const verbs = ref([
  {
    id: 'v1', type: 'study', icon: '🧠', label: 'Extract Lore', state: 'IDLE', requiredAspects: ['raw_data', 'text'], x: 50, y: 300
  },
  {
    id: 'v2', type: 'work', icon: '⚒️', label: 'Execute Task', state: 'IDLE', requiredAspects: ['tool'], x: 50, y: 450
  },
  {
    id: 'v3', type: 'explore', icon: '🕵️', label: 'Deep Search', state: 'IDLE', requiredAspects: ['key'], x: 50, y: 600
  }
])

// 4. State tracking for slots (Which cards are inside which verb)
const slottedCards = ref({
  v1: [], v2: [], v3: []
})

// 5. Global selection state - only one card can be selected at a time
const selectedCardId = ref(null)

const onCardSelect = ({ cardId }) => {
  // Toggle: if clicking already selected card, deselect it
  if (selectedCardId.value === cardId) {
    selectedCardId.value = null
  } else {
    selectedCardId.value = cardId
  }
  console.log('Card selected:', selectedCardId.value)
}

// --- Interaction Logic ---
const draggedItem = ref(null)

// Unified mouse move handler - uses offset to maintain grab position
const onMouseMove = (event) => {
  if (!draggedItem.value) return
  
  // Use the relative container as reference
  const canvas = document.querySelector('section')
  const container = canvas?.querySelector('.relative.w-full.h-full')
  if (!canvas || !container) return
  
  const containerRect = container.getBoundingClientRect()
  
  // Convert screen coordinates to canvas coordinates
  // containerRect already includes panOffset and zoom from CSS transform
  const mouseX = (event.clientX - containerRect.left) / zoomLevel.value
  const mouseY = (event.clientY - containerRect.top) / zoomLevel.value
  
  // Update position based on drag type
  if (draggedItem.value.type === 'card') {
    const newX = mouseX - draggedItem.value.offsetX
    const newY = mouseY - draggedItem.value.offsetY
    
    if (draggedItem.value.fromDrawer) {
      // Drawer drag: update temp dragCard
      draggedItem.value.dragCard.x = newX
      draggedItem.value.dragCard.y = newY
    } else {
      // Tabletop drag: find and update the card in tabletopCards array for reactivity
      const idx = tabletopCards.value.findIndex(c => c.id === draggedItem.value.originalCard.id)
      if (idx > -1) {
        tabletopCards.value[idx].x = newX
        tabletopCards.value[idx].y = newY
      }
    }
  } else if (draggedItem.value.type === 'verb') {
    // Verb: find and update the verb in verbs array for reactivity
    const idx = verbs.value.findIndex(v => v.id === draggedItem.value.item.id)
    if (idx > -1) {
      verbs.value[idx].x = mouseX - draggedItem.value.offsetX
      verbs.value[idx].y = mouseY - draggedItem.value.offsetY
    }
  }
}

// Unified mouse up handler - cleans up and handles drop logic
const onMouseUp = (event) => {
  if (!draggedItem.value) return
  
  const dragCard = draggedItem.value.dragCard
  const originalCard = draggedItem.value.originalCard
  const fromDrawer = draggedItem.value.fromDrawer
  
  // Check if dropped on a Verb (for card/verb combination)
  if (draggedItem.value.type === 'card') {
    const canvas = document.querySelector('section')
    const container = canvas?.querySelector('.relative.w-full.h-full')
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const mouseX = event.clientX - containerRect.left
      const mouseY = event.clientY - containerRect.top
      
      // Check collision with verbs on canvas
      for (const verb of verbs.value) {
        const verbEl = document.getElementById(`verb-${verb.id}`)
        if (verbEl) {
          const verbRect = verbEl.getBoundingClientRect()
          const verbX = verbRect.left - containerRect.left
          const verbY = verbRect.top - containerRect.top
          const verbW = verbRect.width
          const verbH = verbRect.height
          
          // Simple AABB collision detection
          if (mouseX >= verbX && mouseX <= verbX + verbW &&
              mouseY >= verbY && mouseY <= verbY + verbH) {
            // Dropped on verb!
            handleVerbDropFromMouse(originalCard, verb.id, fromDrawer)
            cleanupDrag()
            return
          }
        }
      }
      
      // Check if dropped back into drawer
      const drawer = document.querySelector('footer')
      if (drawer) {
        const drawerRect = drawer.getBoundingClientRect()
        if (event.clientX >= drawerRect.left && event.clientX <= drawerRect.right &&
            event.clientY >= drawerRect.top && event.clientY <= drawerRect.bottom) {
          // Dropped in drawer
          if (fromDrawer) {
            // From drawer: discard temp card, original stays in drawer
            cleanupDrag()
          } else {
            // From tabletop: remove from tabletop (card returns to drawer)
            const tableIdx = tabletopCards.value.findIndex(c => c.id === originalCard.id)
            if (tableIdx > -1) {
              tabletopCards.value.splice(tableIdx, 1)
            }
            cleanupDrag()
          }
          return
        }
      }
      
      // Dropped on canvas
      if (fromDrawer) {
        // From drawer: create new INSTANCES on tabletop (drawer keeps the template)
        // Generate a unique ID for this instance
        const instanceCard = {
          ...originalCard,
          id: `${originalCard.id}-inst-${Date.now()}`, // Unique instance ID
          x: dragCard.x,
          y: dragCard.y
        }
        tabletopCards.value.push(instanceCard)
        // Don't remove from drawer - it's a resource library!
      }
      // From tabletop: card is already on tabletop, position already updated by onMouseMove
    }
  } else if (draggedItem.value.type === 'verb') {
    // Verb drag - just cleanup (position already updated by onMouseMove)
    // No special drop logic needed for verbs (they don't go into slots)
  }
  
  cleanupDrag()
}

const cleanupDrag = () => {
  draggedItem.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const startDraggingCard = (card, event) => {
  // Prevent multiple drag handlers
  if (draggedItem.value) return
  
  const canvas = document.querySelector('section')
  const container = canvas?.querySelector('.relative.w-full.h-full')
  if (!canvas || !container) return
  
  const containerRect = container.getBoundingClientRect()
  
  // Calculate mouse position in canvas coordinates (accounting for pan and zoom)
  const mouseX = (event.clientX - containerRect.left - panOffset.value.x) / zoomLevel.value
  const mouseY = (event.clientY - containerRect.top - panOffset.value.y) / zoomLevel.value
  
  // Check if dragging from drawer or tabletop
  // IMPORTANT: Check tabletop FIRST - a card can be in both drawer (as source) and tabletop (as instance)
  const isFromTabletop = tabletopCards.value.some(c => c.id === card.id)
  const isFromDrawer = !isFromTabletop && drawerCards.value.some(c => c.id === card.id)
  
  // Get element position for offset calculation
  const el = event.currentTarget
  const elRect = el.getBoundingClientRect()
  
  // Calculate offset in canvas coordinates (accounting for zoom)
  const offsetX = (event.clientX - elRect.left) / zoomLevel.value
  const offsetY = (event.clientY - elRect.top) / zoomLevel.value
  
  if (isFromDrawer) {
    // Create a TEMPORARY independent copy for dragging
    // This copy has its own x/y, separate from the original
    const dragCard = {
      ...card,
      x: mouseX - offsetX,
      y: mouseY - offsetY
    }
    
    draggedItem.value = { 
      type: 'card', 
      originalCard: card,      // Reference to original (for verb drop)
      dragCard: dragCard,      // Independent temp copy (for visual drag)
      offsetX, 
      offsetY,
      fromDrawer: true,
      fromTabletop: false
    }
  } else {
    // Dragging from tabletop - use the actual card
    draggedItem.value = { 
      type: 'card', 
      originalCard: card,
      dragCard: card,
      offsetX, 
      offsetY,
      fromDrawer: false,
      fromTabletop: true
    }
  }
  
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseup', onMouseUp, { once: true })
}

const startDraggingVerb = (verb, event) => {
  // Prevent multiple drag handlers
  if (draggedItem.value) return
  
  const canvas = document.querySelector('section')
  const container = canvas?.querySelector('.relative.w-full.h-full')
  if (!canvas || !container) return
  
  const containerRect = container.getBoundingClientRect()
  
  // Calculate mouse position in canvas coordinates (accounting for pan and zoom)
  const mouseX = (event.clientX - containerRect.left - panOffset.value.x) / zoomLevel.value
  const mouseY = (event.clientY - containerRect.top - panOffset.value.y) / zoomLevel.value
  
  // Get the actual DOM element
  const el = event.currentTarget
  const elRect = el.getBoundingClientRect()
  
  // Calculate element position and offset in canvas coordinates (accounting for zoom)
  const elX = (elRect.left - containerRect.left - panOffset.value.x) / zoomLevel.value
  const elY = (elRect.top - containerRect.top - panOffset.value.y) / zoomLevel.value
  const offsetX = mouseX - elX
  const offsetY = mouseY - elY
  
  // Then check if from sidebar and initialize position
  const sidebar = document.querySelector('aside')
  const isInSidebar = sidebar && sidebar.contains(el)
  
  if (isInSidebar) {
    // Initialize position to current mouse - offset (so it stays under cursor)
    verb.x = mouseX - offsetX
    verb.y = mouseY - offsetY
  }
  // If from canvas, keep existing x/y
  
  draggedItem.value = { type: 'verb', item: verb, offsetX, offsetY }
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseup', onMouseUp, { once: true })
}


// --- Canvas Panning & Zoom ---
const panOffset = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const zoomLevel = ref(1)

const startPanning = (event) => {
  // Only pan on middle-click or ctrl+click
  if (event.button !== 1 && !event.ctrlKey) return
  
  isPanning.value = true
  panStart.value = {
    x: event.clientX - panOffset.value.x,
    y: event.clientY - panOffset.value.y
  }
  
  window.addEventListener('mousemove', onPanMove, { passive: true })
  window.addEventListener('mouseup', onPanEnd, { once: true })
}

const onPanMove = (event) => {
  if (!isPanning.value) return
  panOffset.value = {
    x: event.clientX - panStart.value.x,
    y: event.clientY - panStart.value.y
  }
}

const onPanEnd = () => {
  isPanning.value = false
  window.removeEventListener('mousemove', onPanMove)
}

const onZoom = (event) => {
  // Prevent page scroll
  event.preventDefault()
  
  const zoomSensitivity = 0.001
  const delta = -event.deltaY * zoomSensitivity
  const newZoom = Math.min(Math.max(0.5, zoomLevel.value + delta), 2)
  
  // Zoom towards mouse position
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // Calculate offset adjustment to zoom towards mouse
  const scaleChange = newZoom / zoomLevel.value
  panOffset.value = {
    x: mouseX - (mouseX - panOffset.value.x) * scaleChange,
    y: mouseY - (mouseY - panOffset.value.y) * scaleChange
  }
  
  zoomLevel.value = newZoom
}

// Drawer state for resize
const drawerHeight = ref(192)

const startResizingDrawer = (e) => {
  const startY = e.clientY
  const startH = drawerHeight.value
  
  const onMouseMove = (moveE) => {
    drawerHeight.value = Math.max(100, Math.min(500, startH - (moveE.clientY - startY)))
  }
  
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// Drag onto Tabletop Canvas
const handleCanvasDrop = (e) => {
  const data = e.dataTransfer.getData('application/json')
  if (!data) return
  const cardData = JSON.parse(data)
  
  // Remove from drawer
  const drawerIdx = drawerCards.value.findIndex(c => c.id === cardData.id)
  if (drawerIdx > -1) {
    drawerCards.value.splice(drawerIdx, 1)
  }

  // Remove from any slots
  for (const [verbId, slots] of Object.entries(slottedCards.value)) {
    const slotIdx = slots.findIndex(c => c.id === cardData.id)
    if (slotIdx > -1) {
      slots.splice(slotIdx, 1)
      const verb = verbs.value.find(v => v.id === verbId)
      if (slots.length === 0) verb.state = 'IDLE'
    }
  }
  
  // Add to tabletop if not already there
  const tableIdx = tabletopCards.value.findIndex(c => c.id === cardData.id)
  if (tableIdx === -1) {
    tabletopCards.value.push({ ...cardData, x: e.clientX - 200, y: e.clientY - 200 })
  }
}

// Drag into a Verb Slot (from HTML5 Drop)
const handleVerbDrop = ({ card, verbId }) => {
  const verb = verbs.value.find(v => v.id === verbId)
  
  if (verb.state === 'IGNITED') {
    console.warn('Verb is processing, cannot drop!')
    return
  }

  // Basic aspect validation
  const hasAspect = card.aspects.some(a => verb.requiredAspects.includes(a))
  if (!hasAspect) return // UI is handled by Verb component Reject Shake

  // Remove from source arrays
  const drawerIdx = drawerCards.value.findIndex(c => c.id === card.id)
  if (drawerIdx > -1) drawerCards.value.splice(drawerIdx, 1)
  
  const tableIdx = tabletopCards.value.findIndex(c => c.id === card.id)
  if (tableIdx > -1) tabletopCards.value.splice(tableIdx, 1)

  // Remove from other slots if it was moved from slot to slot
  for (const [otherVerbId, slots] of Object.entries(slottedCards.value)) {
    if (otherVerbId === verbId) continue
    const slotIdx = slots.findIndex(c => c.id === card.id)
    if (slotIdx > -1) {
      slots.splice(slotIdx, 1)
      const otherVerb = verbs.value.find(v => v.id === otherVerbId)
      if (slots.length === 0) otherVerb.state = 'IDLE'
    }
  }

  // If slot is full (MVP: max 1), bounce the old card to tabletop
  if (slottedCards.value[verbId].length > 0) {
    const bouncedCard = slottedCards.value[verbId].pop()
    tabletopCards.value.push(bouncedCard)
  }

  // Put in slot
  slottedCards.value[verbId].push(card)
  verb.state = 'READY'
  
  // Ensure only one Verb is READY at a time
  verbs.value.forEach(v => {
    if (v.id !== verbId && v.state === 'READY') {
      v.state = 'IDLE'
      // Clear the slot and return card to tabletop
      const clearedCard = slottedCards.value[v.id].pop()
      if (clearedCard) {
        tabletopCards.value.push(clearedCard)
      }
    }
  })
}

// Drag into a Verb Slot (from Mouse Drag - collision detection)
const handleVerbDropFromMouse = (card, verbId, fromDrawer = false) => {
  const verb = verbs.value.find(v => v.id === verbId)
  
  if (verb.state === 'IGNITED') {
    console.warn('Verb is processing, cannot drop!')
    return
  }

  // Basic aspect validation
  const hasAspect = card.aspects.some(a => verb.requiredAspects.includes(a))
  
  if (!hasAspect) {
    // Rejection feedback - could add visual shake here
    console.log('Rejected: Card aspects do not match verb requirements')
    return
  }

  // Remove from source arrays
  // If from drawer, DON'T remove - drawer is a resource library!
  if (!fromDrawer) {
    const tableIdx = tabletopCards.value.findIndex(c => c.id === card.id)
    if (tableIdx > -1) tabletopCards.value.splice(tableIdx, 1)
  }

  // Remove from other slots if it was moved from slot to slot
  for (const [otherVerbId, slots] of Object.entries(slottedCards.value)) {
    if (otherVerbId === verbId) continue
    const slotIdx = slots.findIndex(c => c.id === card.id)
    if (slotIdx > -1) {
      slots.splice(slotIdx, 1)
      const otherVerb = verbs.value.find(v => v.id === otherVerbId)
      if (slots.length === 0) otherVerb.state = 'IDLE'
    }
  }

  // If slot is full (MVP: max 1), bounce the old card to tabletop
  if (slottedCards.value[verbId].length > 0) {
    const bouncedCard = slottedCards.value[verbId].pop()
    tabletopCards.value.push(bouncedCard)
  }

  // Put in slot - create a new instance with unique ID
  const slotCard = fromDrawer 
    ? { ...card, id: `${card.id}-slot-${Date.now()}` } // New instance from drawer
    : { ...card } // Copy from tabletop
  
  slottedCards.value[verbId].push(slotCard)
  verb.state = 'READY'
  
  // Ensure only one Verb is READY at a time
  verbs.value.forEach(v => {
    if (v.id !== verbId && v.state === 'READY') {
      v.state = 'IDLE'
      // Clear the slot and return card to tabletop
      const clearedCard = slottedCards.value[v.id].pop()
      if (clearedCard) {
        tabletopCards.value.push(clearedCard)
      }
    }
  })
}

// Ignite Action
const igniteVerb = (verbId) => {
  const verb = verbs.value.find(v => v.id === verbId)
  if (verb.state !== 'READY') return

  verb.state = 'IGNITED'
  
  const consumedCard = slottedCards.value[verbId][0]

  // Simulate processing time
  setTimeout(() => {
    verb.state = 'IDLE'
    slottedCards.value[verbId] = [] // clear slot (destroy original card)
    
    // Spawn result card onto tabletop
    tabletopCards.value.push({
      id: `res-${Date.now()}`,
      type: 'static',
      label: `Result from: ${consumedCard.label}`,
      aspects: ['knowledge', 'refined'],
      duration: null
    })
  }, 3000)
}
</script>

<template>
  <div class="h-screen w-screen bg-zinc-950 text-zinc-300 font-mono overflow-hidden flex flex-col relative">
    
    <!-- Top Bar -->
    <header class="h-12 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur flex items-center px-4 justify-between z-50">
      <div class="flex items-center gap-2">
        <span class="text-orange-500 font-bold">LORE</span>
        <span class="text-zinc-500">BOARD v0.1</span>
      </div>
      <div class="flex items-center gap-4 text-xs text-zinc-500">
        <span>Tokens: 120k / 500k</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Daemon Active</span>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 flex overflow-hidden">
      
      <!-- Left Panel: Verb List -->
      <aside class="w-64 border-r border-zinc-800 bg-zinc-950/30 p-4 flex flex-col gap-6 overflow-y-auto z-10 overflow-x-visible">
        <h2 class="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Available Rituals</h2>
        
        <Verb 
          v-for="verb in verbs" 
          :key="verb.id" 
          :verb="verb" 
          :slottedCards="slottedCards[verb.id]"
          @drop="handleVerbDrop"
          @ignite="igniteVerb"
          class="shrink-0"
        >
          <!-- Using scoped slot to render the Card component inside the Verb -->
          <template #slotted-card="{ card }">
            <!-- T-06: Absolute Lock if ignited -->
            <Card :card="card" isSlot :isLocked="verb.state === 'IGNITED'" class="scale-90" />
          </template>
        </Verb>
      </aside>

      <!-- Center Panel: The Tabletop Canvas -->
      <section 
        class="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 p-6 overflow-hidden"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <!-- Dot grid pattern - denser and brighter -->
        <div class="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] pointer-events-none"></div>
        
        <h2 class="absolute top-4 left-6 text-xs uppercase tracking-widest text-zinc-600 font-bold">The Tabletop</h2>
        
        <!-- Zoom indicator -->
        <div class="absolute top-4 right-4 text-xs text-zinc-500 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-700/50 backdrop-blur-sm">
          {{ Math.round(zoomLevel * 100) }}%
        </div>

        <!-- Render dropped cards and verbs on tabletop with absolute positioning -->
        <div 
          class="relative w-full h-full origin-top-left"
          :style="{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }"
          @mousedown="startPanning"
          @wheel="onZoom"
        >
          <!-- Verbs as draggable elements on canvas -->
          <div 
            v-for="verb in verbs" 
            :key="verb.id" 
            :id="`verb-${verb.id}`"
            class="absolute cursor-move"
            :style="{ left: verb.x + 'px', top: verb.y + 'px' }"
            @mousedown.stop="startDraggingVerb(verb, $event)"
          >
            <Verb 
              :verb="verb" 
              :slottedCards="slottedCards[verb.id]"
              @drop="handleVerbDrop"
              @ignite="igniteVerb"
            >
              <template #slotted-card="{ card }">
                <Card :card="card" isSlot :isLocked="verb.state === 'IGNITED'" class="scale-90" />
              </template>
            </Verb>
          </div>

          <!-- Cards on tabletop -->
          <div 
            v-for="card in tabletopCards" 
            :key="card.id" 
            class="absolute w-48 cursor-move"
            :style="{ left: (card.x || 100) + 'px', top: (card.y || 100) + 'px' }"
            @mousedown.stop="startDraggingCard(card, $event)"
          >
            <Card :card="card" :is-selected="selectedCardId === card.id" @select="onCardSelect" />
          </div>
          
          <!-- Drag card (temporary visual for drawer drag) -->
          <div 
            v-if="draggedItem && draggedItem.fromDrawer" 
            class="absolute w-48 pointer-events-none opacity-70 z-50"
            :style="{ left: draggedItem.dragCard.x + 'px', top: draggedItem.dragCard.y + 'px' }"
          >
            <Card :card="draggedItem.dragCard" />
          </div>
        </div>
      </section>

    </main>

    <!-- Bottom Panel: The Drawer -->
    <footer class="h-48 border-t border-zinc-800 bg-zinc-950 p-4 z-20">
      <h2 class="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">Resource Drawer (Your Hand)</h2>
      <div class="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        <div 
          v-for="card in drawerCards" 
          :key="card.id" 
          class="w-48 shrink-0 transition-all hover:-translate-y-2 cursor-grab active:cursor-grabbing"
          :class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && draggedItem.originalCard.id === card.id }"
          @mousedown.stop="startDraggingCard(card, $event)"
        >
          <Card :card="card" :is-selected="selectedCardId === card.id" @select="onCardSelect" />
        </div>
        <div v-if="drawerCards.length === 0" class="h-full w-full flex items-center justify-center text-zinc-600 text-sm italic">
          Drawer is empty...
        </div>
      </div>
    </footer>
    
  </div>
</template>