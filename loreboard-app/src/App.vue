<script setup>
import { ref, computed } from 'vue'
import Card from './components/Card.vue'
import Verb from './components/Verb.vue'

// --- Unified Entity Model ---
  // Both Cards and Verbs are Resources: Cards = materials, Verbs = contracts
  
  // 1. Drawer: Resource Library (infinite templates)
  const drawerResources = ref([
    // Cards (raw materials)
    { id: 'card-c1', entityType: 'card', type: 'dynamic', label: 'Google CSE API Key', aspects: ['key', 'tool'], duration: null },
    { id: 'card-c2', entityType: 'card', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120 },
    { id: 'card-c3', entityType: 'card', type: 'secret', label: 'Stripe Test Token', aspects: ['key', 'finance'], duration: null },
    { id: 'card-c4', entityType: 'card', type: 'nemesis', label: 'Rate Limit Blocked', aspects: ['error', 'blocker'], duration: null },
    // Verbs (contracts)
    { id: 'verb-v1', entityType: 'verb', type: 'study', icon: '🧠', label: 'Extract Lore', requiredAspects: ['raw_data', 'text'] },
    { id: 'verb-v2', entityType: 'verb', type: 'work', icon: '⚒️', label: 'Execute Task', requiredAspects: ['tool'] },
    { id: 'verb-v3', entityType: 'verb', type: 'explore', icon: '🕵️', label: 'Deep Search', requiredAspects: ['key'] }
  ])
  
  // 2. Tabletop: Resource Instances
  const tabletopEntities = ref([
    { instanceId: 'inst-t1', definitionId: 'card-c2', entityType: 'card', type: 'static', label: 'Unprocessed HTML source', aspects: ['raw_data', 'text'], duration: 120, x: 100, y: 100 },
    { instanceId: 'inst-v1', definitionId: 'verb-v1', entityType: 'verb', type: 'study', icon: '🧠', label: 'Extract Lore', requiredAspects: ['raw_data', 'text'], state: 'IDLE', slottedCards: [], x: 100, y: 300 },
    { instanceId: 'inst-v2', definitionId: 'verb-v2', entityType: 'verb', type: 'work', icon: '⚒️', label: 'Execute Task', requiredAspects: ['tool'], state: 'IDLE', slottedCards: [], x: 100, y: 450 },
    { instanceId: 'inst-v3', definitionId: 'verb-v3', entityType: 'verb', type: 'explore', icon: '🕵️', label: 'Deep Search', requiredAspects: ['key'], state: 'IDLE', slottedCards: [], x: 100, y: 600 }
  ])
  
  // Helper: Get full entity
  const getFullEntity = (instance) => {
    const def = drawerResources.value.find(d => d.id === instance.definitionId)
    return { ...def, ...instance, id: instance.instanceId }
  }
  
  // Backward-compatible computed aliases
  const drawerCards = computed(() => drawerResources.value.filter(r => r.entityType === 'card'))
  const drawerVerbs = computed(() => drawerResources.value.filter(r => r.entityType === 'verb'))
  const tabletopCards = computed(() => tabletopEntities.value.filter(e => e.entityType === 'card'))
  const tabletopVerbs = computed(() => tabletopEntities.value.filter(e => e.entityType === 'verb'))

// 4. Running tasks (for left sidebar display)
const runningTasks = ref([])

// 5. Global selection state - only one card can be selected at a time
const selectedCardId = ref(null)
const selectedVerbId = ref(null)

// 6. Drag highlight state - highlight valid verb slots during drag
const highlightedVerbs = ref(new Set())

// 7. Drawer state - iOS style bottom sheet
const drawerOpenHeight = ref(380) // Open height in px (increased for search + tabs)
const drawerClosedHeight = ref(64) // Closed height (handle only)
const isDrawerOpen = ref(false)
const isDraggingDrawer = ref(false)
const drawerDragStart = ref({ y: 0, height: 0 })

// 8. Drawer search and filter
const drawerSearchQuery = ref('')
const drawerActiveTab = ref('all') // 'all', 'dynamic', 'static', 'secret', 'nemesis', 'verbs'

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

// Filter cards based on search and tab
const filteredDrawerCards = computed(() => {
  let cards = [...drawerCards.value]
  
  // Filter by type tab
  if (drawerActiveTab.value !== 'all' && drawerActiveTab.value !== 'verbs') {
    cards = cards.filter(c => c.type === drawerActiveTab.value)
  }
  
  // Filter by search query
  if (drawerSearchQuery.value.trim()) {
    const query = drawerSearchQuery.value.toLowerCase().trim()
    cards = cards.filter(c => 
      c.label.toLowerCase().includes(query) ||
      c.aspects.some(a => a.toLowerCase().includes(query))
    )
  }
  
  return cards
})

// Get card count by type (for tab badges, not affected by search)
const getCardCountByType = (type) => {
  if (type === 'all') return drawerCards.value.length
  if (type === 'verbs') return allVerbs.value.length
  return drawerCards.value.filter(c => c.type === type).length
}

// Get all verb definitions for drawer display (always returns all verbs, filtering done in template)
const allVerbs = computed(() => {
  let verbList = [...drawerVerbs.value]
  
  // Filter by search query (always apply search)
  if (drawerSearchQuery.value.trim()) {
    const query = drawerSearchQuery.value.toLowerCase().trim()
    verbList = verbList.filter(v => 
      v.label.toLowerCase().includes(query) ||
      v.requiredAspects.some(a => a.toLowerCase().includes(query))
    )
  }
  
  return verbList
})

// Get verbs for display based on active tab
const displayVerbs = computed(() => {
  if (drawerActiveTab.value === 'verbs' || drawerActiveTab.value === 'all') {
    return allVerbs.value
  }
  return []
})

const startDrawerDrag = (event) => {
  isDraggingDrawer.value = true
  drawerDragStart.value = {
    y: event.clientY || event.touches?.[0]?.clientY || 0,
    height: isDrawerOpen.value ? drawerOpenHeight.value : drawerClosedHeight.value
  }
  
  window.addEventListener('mousemove', onDrawerDrag, { passive: true })
  window.addEventListener('mouseup', onDrawerDragEnd, { once: true })
  window.addEventListener('touchmove', onDrawerDrag, { passive: true })
  window.addEventListener('touchend', onDrawerDragEnd, { once: true })
}

const onDrawerDrag = (event) => {
  if (!isDraggingDrawer.value) return
  
  const clientY = event.clientY || event.touches?.[0]?.clientY || 0
  const deltaY = drawerDragStart.value.y - clientY // Positive = dragging up
  
  let newHeight = drawerDragStart.value.height + deltaY
  newHeight = Math.max(drawerClosedHeight.value, Math.min(400, newHeight))
  
  // Determine if drawer should be open or closed based on height
  isDrawerOpen.value = newHeight > drawerClosedHeight.value + 20
  
  if (isDrawerOpen.value) {
    drawerOpenHeight.value = newHeight
  }
}

const onDrawerDragEnd = () => {
  isDraggingDrawer.value = false
  window.removeEventListener('mousemove', onDrawerDrag)
  window.removeEventListener('touchmove', onDrawerDrag)
}

const onCardSelect = ({ cardId }) => {
  // Deselect verb when selecting card
  selectedVerbId.value = null
  
  // Toggle: if clicking already selected card, deselect it
  if (selectedCardId.value === cardId) {
    selectedCardId.value = null
  } else {
    selectedCardId.value = cardId
  }
  console.log('Card selected:', selectedCardId.value)
}

const onVerbSelect = ({ verbId }) => {
  // Deselect card when selecting verb
  selectedCardId.value = null
  
  // Toggle: if clicking already selected verb, deselect it
  if (selectedVerbId.value === verbId) {
    selectedVerbId.value = null
  } else {
    selectedVerbId.value = verbId
  }
  console.log('Verb selected:', selectedVerbId.value)
}

// Check if card aspects match verb requirements
const canCardFitVerb = (card, verb) => {
  return card.aspects.some(a => verb.requiredAspects.includes(a))
}

// Delete selected card or verb with Delete/Backspace key
const handleKeyDown = (event) => {
  // Only handle Delete or Backspace
  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  
  // Don't delete if typing in input
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return
  
  // Delete selected card
  if (selectedCardId.value) {
    // Try to remove from tabletop
    const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === selectedCardId.value)
    if (tableIdx > -1) {
      tabletopEntities.value.splice(tableIdx, 1)
      selectedCardId.value = null
      console.log('Card deleted from tabletop')
      return
    }
    
    // Try to remove from drawer
    const drawerIdx = drawerCards.value.findIndex(c => c.id === selectedCardId.value)
    if (drawerIdx > -1) {
      drawerCards.value.splice(drawerIdx, 1)
      selectedCardId.value = null
      console.log('Card deleted from drawer')
      return
    }
    
    // Try to remove from verb slots (returns card to tabletop)
    for (const [verbId, slots] of Object.entries(slottedCards.value)) {
      const slotIdx = slots.findIndex(c => c.id === selectedCardId.value)
      if (slotIdx > -1) {
        const removedCard = slots.splice(slotIdx, 1)[0]
        // Return card to tabletop
        // TODO: Convert removedCard to entity format
        tabletopEntities.value.push(removedCard)
        // Set verb to IDLE if empty
        const verb = drawerVerbs.value.find(v => v.id === verbId)
        if (verb && slots.length === 0) {
          verb.state = 'IDLE'
        }
        selectedCardId.value = null
        console.log('Card removed from verb slot')
        return
      }
    }
  }
  
  // Delete selected verb (only if not in sidebar - i.e., has x/y coordinates)
  if (selectedVerbId.value) {
    const verbIdx = verbs.value.findIndex(v => v.id === selectedVerbId.value)
    if (verbIdx > -1) {
      const verb = verbs.value[verbIdx]
      // Only delete verbs that are on the tabletop (have x/y)
      if (verb.x !== undefined && verb.y !== undefined) {
        // Return any slotted card to tabletop
        const slotted = slottedCards.value[selectedVerbId.value]
        if (slotted && slotted.length > 0) {
          // TODO: Convert slotted cards to entity format
        tabletopEntities.value.push(...slotted)
          slottedCards.value[selectedVerbId.value] = []
        }
        // Remove verb
        tabletopEntities.value.splice(verbIdx, 1)
        selectedVerbId.value = null
        console.log('Verb deleted from tabletop')
        return
      } else {
        console.log('Cannot delete sidebar verb')
      }
    }
  }
}

// Setup global keyboard listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyDown)
}

// Cleanup on component unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('keydown', handleKeyDown)
  })
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
  
  // Update highlight during drag (for both drawer and tabletop drag)
  if (draggedItem.value.type === 'card') {
    updateVerbHighlights(draggedItem.value.originalCard)
  }
  
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
      const idx = tabletopEntities.value.findIndex(c => c.instanceId === draggedItem.value.originalCard.instanceId)
      if (idx > -1) {
        tabletopEntities.value[idx].x = newX
        tabletopEntities.value[idx].y = newY
      }
    }
  } else if (draggedItem.value.type === 'verb-instance') {
    // Dragging existing canvas instance: update position
    const instance = draggedItem.value.instance
    const idx = tabletopVerbs.value.findIndex(cv => cv.instanceId === instance.instanceId)
    if (idx > -1) {
      tabletopEntities.value[idx].x = mouseX - draggedItem.value.offsetX
      tabletopEntities.value[idx].y = mouseY - draggedItem.value.offsetY
    }
  } else if (draggedItem.value.type === 'verb-definition') {
    // Dragging from drawer: update temp drag instance position
    draggedItem.value.dragInstance.x = mouseX - draggedItem.value.offsetX
    draggedItem.value.dragInstance.y = mouseY - draggedItem.value.offsetY
  }
}

// Update verb highlights based on dragged card
const updateVerbHighlights = (card) => {
    const validVerbs = new Set()
    tabletopVerbs.value.forEach(cv => {
      if (cv.state !== 'IGNITED') {
        const verbDef = drawerVerbs.value.find(v => v.id === cv.definitionId)
        if (verbDef && canCardFitVerb(card, verbDef)) {
          validVerbs.add(cv.instanceId)
        }
      }
    })
    highlightedVerbs.value = validVerbs
  }

// Unified mouse up handler - cleans up and handles drop logic
const onMouseUp = (event) => {
  if (!draggedItem.value) return
  
  const dragCard = draggedItem.value.dragCard
  const originalCard = draggedItem.value.originalCard
  const fromDrawer = draggedItem.value.fromDrawer
  
  // Handle Verb drag
  if (draggedItem.value.type === 'verb-definition' || draggedItem.value.type === 'verb-instance') {
    const drawer = document.querySelector('footer')
    if (drawer) {
      const drawerRect = drawer.getBoundingClientRect()
      if (event.clientX >= drawerRect.left && event.clientX <= drawerRect.right &&
          event.clientY >= drawerRect.top && event.clientY <= drawerRect.bottom) {
        // Dropped in drawer
        if (draggedItem.value.type === 'verb-instance') {
          // Remove instance from canvas
          const idx = tabletopVerbs.value.findIndex(cv => cv.instanceId === draggedItem.value.instance.instanceId)
          if (idx > -1) {
            // Return slotted cards to tabletop
            const instance = tabletopVerbs.value[idx]
            if (instance.slottedCards.length > 0) {
              // TODO: Convert slotted cards to entity format
        tabletopEntities.value.push(...instance.slottedCards)
            }
            tabletopVerbs.value.splice(idx, 1)
          }
        }
        // If from definition, just discard
        cleanupDrag()
        return
      }
    }
    
    // Dropped on canvas
    if (draggedItem.value.type === 'verb-definition') {
      // Create new instance on canvas
      tabletopVerbs.value.push({ ...draggedItem.value.dragInstance })
    }
    // If verb-instance, position already updated by onMouseMove
    
    cleanupDrag()
    return
  }
  
  // Handle Card drag
  if (draggedItem.value.type === 'card') {
    const canvas = document.querySelector('section')
    const container = canvas?.querySelector('.relative.w-full.h-full')
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const mouseX = event.clientX - containerRect.left
      const mouseY = event.clientY - containerRect.top
      
      // Check collision with canvas verbs
      for (const canvasVerb of tabletopVerbs.value) {
        const verbEl = document.getElementById(`verb-${canvasVerb.instanceId}`)
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
            handleVerbDropFromMouse(originalCard, canvasVerb.instanceId, fromDrawer)
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
            const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === originalCard.instanceId)
            if (tableIdx > -1) {
              tabletopEntities.value.splice(tableIdx, 1)
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
          id: `${originalCard.instanceId}-inst-${Date.now()}`, // Unique instance ID
          x: dragCard.x,
          y: dragCard.y
        }
        tabletopEntities.value.push(instanceCard)
        // Don't remove from drawer - it's a resource library!
      }
      // From tabletop: card is already on tabletop, position already updated by onMouseMove
    }
  }
  
  cleanupDrag()
}

const cleanupDrag = () => {
  draggedItem.value = null
  highlightedVerbs.value = new Set()
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
  const isFromTabletop = tabletopCards.value.some(c => c.instanceId === card.instanceId)
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
  
  // Check if this is a verb definition (from drawer) or instance (from canvas)
  const isDefinition = !!drawerVerbs.value.find(d => d.id === verb.id)
  const isCanvasInstance = !!tabletopVerbs.value.find(cv => cv.instanceId === verb.instanceId)
  
  // Get the actual DOM element
  const el = event.currentTarget
  const elRect = el.getBoundingClientRect()
  
  // Calculate element position and offset in canvas coordinates (accounting for zoom)
  const elX = (elRect.left - containerRect.left - panOffset.value.x) / zoomLevel.value
  const elY = (elRect.top - containerRect.top - panOffset.value.y) / zoomLevel.value
  const offsetX = mouseX - elX
  const offsetY = mouseY - elY
  
  if (isDefinition) {
    // Dragging from drawer - create new instance on drop
    draggedItem.value = {
      type: 'verb-definition',
      fromDrawer: true,
      definition: verb,
      dragInstance: {
        instanceId: `cv-${Date.now()}`,
        definitionId: verb.id,
        state: 'IDLE',
        slottedCards: [],
        x: mouseX - offsetX,
        y: mouseY - offsetY
      },
      offsetX,
      offsetY
    }
  } else if (isCanvasInstance) {
    // Dragging existing canvas instance
    draggedItem.value = {
      type: 'verb-instance',
      instance: tabletopVerbs.value.find(cv => cv.instanceId === verb.instanceId),
      offsetX,
      offsetY
    }
  }
  
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
  
  const onDrawerResizeMove = (moveE) => {
      drawerHeight.value = Math.max(100, Math.min(500, startH - (moveE.clientY - startY)))
  }
  
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  
  window.addEventListener('mousemove', onDrawerResizeMove)
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
      const verb = drawerVerbs.value.find(v => v.id === verbId)
      if (slots.length === 0) verb.state = 'IDLE'
    }
  }
  
  // Add to tabletop if not already there
  const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === cardData.id)
  if (tableIdx === -1) {
    tabletopEntities.value.push({ ...cardData, x: e.clientX - 200, y: e.clientY - 200 })
  }
}

// Drag into a Verb Slot (from HTML5 Drop)
const handleVerbDrop = ({ card, verbId }) => {
  const verb = drawerVerbs.value.find(v => v.id === verbId)
  
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
  
  const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === card.id)
  if (tableIdx > -1) tabletopEntities.value.splice(tableIdx, 1)

  // Remove from other slots if it was moved from slot to slot
  for (const [otherVerbId, slots] of Object.entries(slottedCards.value)) {
    if (otherVerbId === verbId) continue
    const slotIdx = slots.findIndex(c => c.id === card.id)
    if (slotIdx > -1) {
      slots.splice(slotIdx, 1)
      const otherVerb = drawerVerbs.value.find(v => v.id === otherVerbId)
      if (slots.length === 0) otherVerb.state = 'IDLE'
    }
  }

  // If slot is full (MVP: max 1), bounce the old card to tabletop
  if (slottedCards.value[verbId].length > 0) {
    const bouncedCard = slottedCards.value[verbId].pop()
    tabletopEntities.value.push(bouncedCard)
  }

  // Put in slot
  slottedCards.value[verbId].push(card)
  verb.state = 'READY'
  
  // Ensure only one Verb is READY at a time
  drawerVerbs.value.forEach(v => {
    if (v.id !== verbId && v.state === 'READY') {
      v.state = 'IDLE'
      // Clear the slot and return card to tabletop
      const clearedCard = slottedCards.value[v.id].pop()
      if (clearedCard) {
        tabletopEntities.value.push(clearedCard)
      }
    }
  })
}

// Drag into a Verb Slot (from Mouse Drag - collision detection)
const handleVerbDropFromMouse = (card, verbInstanceId, fromDrawer = false) => {
  const verbInstance = tabletopVerbs.value.find(cv => cv.instanceId === verbInstanceId)
  if (!verbInstance) return
  
  const verbDef = drawerVerbs.value.find(v => v.id === verbInstance.definitionId)
  if (!verbDef) return
  
  if (verbInstance.state === 'IGNITED') {
    console.warn('Verb is processing, cannot drop!')
    return
  }

  // Basic aspect validation
  const hasAspect = card.aspects.some(a => verbDef.requiredAspects.includes(a))
  
  if (!hasAspect) {
    // Rejection feedback - could add visual shake here
    console.log('Rejected: Card aspects do not match verb requirements')
    return
  }

  // Remove from source arrays
  // If from drawer, DON'T remove - drawer is a resource library!
  if (!fromDrawer) {
    const tableIdx = tabletopEntities.value.findIndex(c => c.instanceId === card.id)
    if (tableIdx > -1) tabletopEntities.value.splice(tableIdx, 1)
  }

  // Remove from other slots if it was moved from slot to slot
  for (const otherInstance of tabletopVerbs.value) {
    if (otherInstance.instanceId === verbInstanceId) continue
    const slotIdx = otherInstance.slottedCards.findIndex(c => c.id === card.id)
    if (slotIdx > -1) {
      otherInstance.slottedCards.splice(slotIdx, 1)
      if (otherInstance.slottedCards.length === 0) otherInstance.state = 'IDLE'
    }
  }

  // If slot is full (MVP: max 1), bounce the old card to tabletop
  if (verbInstance.slottedCards.length > 0) {
    const bouncedCard = verbInstance.slottedCards.pop()
    tabletopEntities.value.push(bouncedCard)
  }

  // Put in slot - create a new instance with unique ID
  const slotCard = fromDrawer 
    ? { ...card, id: `${card.id}-slot-${Date.now()}` } // New instance from drawer
    : { ...card } // Copy from tabletop
  
  verbInstance.slottedCards.push(slotCard)
  verbInstance.state = 'READY'
  
  // Ensure only one Verb instance is READY at a time
  tabletopVerbs.value.forEach(v => {
    if (v.instanceId !== verbInstanceId && v.state === 'READY') {
      v.state = 'IDLE'
      // Clear the slot and return card to tabletop
      const clearedCard = v.slottedCards.pop()
      if (clearedCard) {
        tabletopEntities.value.push(clearedCard)
      }
    }
  })
}

// Ignite Action
const igniteVerb = (verbInstanceId) => {
  const verbInstance = tabletopVerbs.value.find(cv => cv.instanceId === verbInstanceId)
  if (!verbInstance || verbInstance.state !== 'READY') return

  const verbDef = drawerVerbs.value.find(v => v.id === verbInstance.definitionId)
  if (!verbDef) return

  verbInstance.state = 'IGNITED'
  
  const consumedCard = verbInstance.slottedCards[0]
  
  // Add to running tasks
  const taskId = `task-${Date.now()}`
  const taskDuration = Math.floor(Math.random() * 30 + 30) // 30-60 seconds
  runningTasks.value.push({
    id: taskId,
    verbInstanceId: verbInstance.instanceId,
    verbDefinitionId: verbDef.id,
    verbLabel: verbDef.label,
    verbIcon: verbDef.icon,
    cardLabel: consumedCard?.label || 'Unknown',
    cardType: consumedCard?.type || 'unknown',
    startTime: Date.now(),
    duration: taskDuration * 1000, // convert to ms
    progress: 0
  })
  
  // Update progress periodically
  const progressInterval = setInterval(() => {
    const task = runningTasks.value.find(t => t.id === taskId)
    if (task) {
      const elapsed = Date.now() - task.startTime
      task.progress = Math.min(100, Math.round((elapsed / task.duration) * 100))
    }
  }, 500)

  // Simulate processing time
  setTimeout(() => {
    verbInstance.state = 'IDLE'
    verbInstance.slottedCards = [] // clear slot (destroy original card)
    
    // Remove from running tasks
    const taskIdx = runningTasks.value.findIndex(t => t.id === taskId)
    if (taskIdx > -1) {
      runningTasks.value.splice(taskIdx, 1)
    }
    clearInterval(progressInterval)
    
    // Spawn result card onto tabletop
    tabletopCards.value.push({
      id: `res-${Date.now()}`,
      type: 'static',
      label: `Result from: ${consumedCard?.label || 'Unknown'}`,
      aspects: ['knowledge', 'refined'],
      duration: null
    })
  }, taskDuration * 1000)
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
      
      <!-- Left Panel: Running Tasks -->
      <aside class="w-64 border-r border-zinc-800 bg-zinc-950/30 p-4 flex flex-col gap-4 overflow-y-auto z-10">
        <h2 class="text-xs uppercase tracking-widest text-zinc-500 font-bold">Running Tasks</h2>
        
        <!-- Task list -->
        <div class="flex flex-col gap-3">
          <div 
            v-for="task in runningTasks" 
            :key="task.id"
            class="bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 transition-all hover:border-orange-400/30"
          >
            <!-- Task header -->
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">{{ task.verbIcon }}</span>
              <span class="text-xs font-medium text-zinc-300">{{ task.verbLabel }}</span>
            </div>
            
            <!-- Task info -->
            <div class="text-xs text-zinc-400 mb-2">
              <span class="text-zinc-500">Processing:</span>
              <span class="text-zinc-300 ml-1">{{ task.cardLabel }}</span>
            </div>
            
            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                :style="{ width: task.progress + '%' }"
              ></div>
            </div>
            
            <!-- Progress text -->
            <div class="flex justify-between mt-1 text-[10px] text-zinc-500">
              <span>{{ Math.floor(task.duration / 1000) }}s</span>
              <span>{{ task.progress }}%</span>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-if="runningTasks.length === 0" class="text-center py-8 text-zinc-600 text-sm italic">
            No running tasks
          </div>
        </div>
      </aside>

      <!-- Center Panel: The Tabletop Canvas -->
      <section 
        class="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 p-6 overflow-hidden"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
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
          <!-- Dot grid pattern - extra large to cover zoom and pan -->
          <div 
            class="absolute opacity-40 pointer-events-none"
            :style="{
              width: '400vw',
              height: '400vw',
              left: '-200vw',
              top: '-200vw',
              backgroundImage: 'url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+\')',
              backgroundSize: '40px 40px'
            }"
          ></div>
          
          <!-- Verbs as draggable elements on canvas -->
          <div 
            v-for="instance in tabletopVerbs" 
            :key="instance.instanceId" 
            :id="`verb-${instance.instanceId}`"
            class="absolute cursor-move"
            :style="{ left: instance.x + 'px', top: instance.y + 'px' }"
            @mousedown.stop="startDraggingVerb(getFullEntity(instance), $event)"
          >
            <Verb 
              :verb="getFullEntity(instance)" 
              :slottedCards="instance.slottedCards"
              :is-highlighted="highlightedVerbs.has(instance.instanceId)"
              :is-selected="selectedVerbId === instance.instanceId"
              @drop="handleVerbDrop"
              @ignite="igniteVerb"
              @select="onVerbSelect"
            >
              <template #slotted-card="{ card }">
                <Card :card="card" isSlot :isLocked="instance.state === 'IGNITED'" class="scale-90" />
              </template>
            </Verb>
          </div>

          <!-- Cards on tabletop -->
          <div 
            v-for="card in tabletopCards" 
            :key="card.instanceId" 
            class="absolute w-48 cursor-move"
            :style="{ left: (card.x || 100) + 'px', top: (card.y || 100) + 'px' }"
            @mousedown.stop="startDraggingCard(card, $event)"
          >
            <Card :card="card" :is-selected="selectedCardId === card.instanceId" @select="onCardSelect" />
          </div>
          
          <!-- Drag card (temporary visual for drawer drag) -->
          <div 
            v-if="draggedItem && draggedItem.fromDrawer" 
            class="absolute pointer-events-none opacity-70 z-50"
            :style="{ left: draggedItem.type === 'card' ? draggedItem.dragCard.x + 'px' : draggedItem.dragInstance.x + 'px', top: draggedItem.type === 'card' ? draggedItem.dragCard.y + 'px' : draggedItem.dragInstance.y + 'px' }"
          >
            <Card v-if="draggedItem.type === 'card'" :card="draggedItem.dragCard" />
            <Verb v-if="draggedItem.type === 'verb-definition'" :verb="draggedItem.definition" />
          </div>
        </div>
      </section>

    </main>

    <!-- Bottom Panel: iOS-style Drawer -->
    <footer 
      class="fixed bottom-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-30 transition-all duration-300 ease-out overflow-hidden flex flex-col"
      :style="{ 
        height: isDrawerOpen ? `${drawerOpenHeight}px` : `${drawerClosedHeight}px`,
        maxWidth: 'calc(100vw - 128px)',
        width: 'calc(100vw - 128px)',
        left: '64px',
        right: '64px',
        borderRadius: isDrawerOpen ? '16px 16px 0 0' : '16px 16px 0 0'
      }"
    >
      <!-- Handle bar (always visible) -->
      <div 
        class="w-full h-6 flex items-center justify-center cursor-pointer flex-shrink-0"
        @mousedown="startDrawerDrag"
        @touchstart="startDrawerDrag"
        @click="toggleDrawer"
      >
        <div class="w-64 h-1 bg-zinc-600 rounded-full"></div>
      </div>
      
      <!-- Drawer content (only visible when open) -->
      <div 
        class="flex-1 flex flex-col overflow-hidden px-4 pb-4"
        :class="isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <!-- Search box -->
        <div class="mb-3 flex-shrink-0">
          <input 
            v-model="drawerSearchQuery"
            type="text"
            placeholder="Search cards and verbs..."
            class="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all"
          />
        </div>
        
        <!-- Type tabs -->
        <div class="mb-3 flex-shrink-0 flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="tab in ['all', 'dynamic', 'static', 'secret', 'nemesis', 'verbs']"
            :key="tab"
            @click="drawerActiveTab = tab"
            class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            :class="drawerActiveTab === tab 
              ? 'bg-orange-500 text-white' 
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
          >
            {{ tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
            <span class="ml-1 opacity-60">
              {{ getCardCountByType(tab) }}
            </span>
          </button>
        </div>
        
        <!-- Cards and verbs grid -->
        <div class="flex-1 overflow-y-auto scrollbar-hide pb-2 min-h-0">
          <div class="flex gap-4 pb-2">
            <!-- Resource cards -->
            <template v-if="drawerActiveTab !== 'verbs'">
              <div 
                v-for="card in filteredDrawerCards" 
                :key="card.instanceId" 
                class="w-48 shrink-0 transition-all cursor-grab active:cursor-grabbing"
                :class="{ 'opacity-50': draggedItem && draggedItem.fromDrawer && draggedItem.originalCard.instanceId === card.id }"
                @mousedown.stop="startDraggingCard(card, $event)"
              >
                <Card :card="card" :is-selected="selectedCardId === card.instanceId" :compact="true" @select="onCardSelect" />
              </div>
              <div v-if="filteredDrawerCards.length === 0" class="h-32 w-full flex items-center justify-center text-zinc-600 text-sm italic">
                {{ drawerSearchQuery ? 'No matching cards' : 'No cards in this category' }}
              </div>
            </template>
            
            <!-- Verbs -->
            <template v-if="displayVerbs.length > 0">
              <div 
                v-for="verb in displayVerbs" 
                :key="verb.id" 
                class="w-48 shrink-0 cursor-grab active:cursor-grabbing"
                @mousedown.stop="startDraggingVerb(verb, $event)"
              >
                <Verb 
                  :verb="verb" 
                  :compact="true"
                  :is-selected="selectedVerbId === verb.id"
                  @select="onVerbSelect"
                />
              </div>
            </template>
            <div v-if="drawerActiveTab === 'verbs' && displayVerbs.length === 0" class="h-32 w-full flex items-center justify-center text-zinc-600 text-sm italic">
              {{ drawerSearchQuery ? 'No matching verbs' : 'No verbs' }}
            </div>
          </div>
        </div>
      </div>
    </footer>
    
  </div>
</template>