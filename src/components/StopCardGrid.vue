<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import type { Stop } from '../../shared/types'
import { useTrip } from '../composables/useTrip'
import { useCurrentCheckins } from '../composables/useCheckins'
import StopPhoto from './StopPhoto.vue'

defineProps<{ id: string; eyebrow: string; title: string; sub: string; stops: Stop[] }>()
const { selectStop } = useTrip()
const { isChecked } = useCurrentCheckins()
</script>

<template>
  <section :id="id">
    <div class="wrap">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p class="sub">{{ sub }}</p>
      <div class="grid">
        <div v-for="s in stops" :key="s.id" class="card" @click="selectStop(s)">
          <StopPhoto :stop="s" />
          <div class="body">
            <div class="t">{{ s.name }}</div>
            <div class="chips">
              <span class="chip-red">Day {{ s.day }}</span>
              <span class="chip-red">{{ s.area }}</span>
              <span v-if="s.pass" class="chip-red">FunPASS</span>
            </div>
            <div class="foot">
              <span class="price">
                <template v-if="s.price"><small>NT$</small>{{ s.price }}</template>
                <template v-else-if="s.pass">套票</template>
                <template v-else>免費</template>
              </span>
              <span v-if="isChecked(s.id)" class="done-mark" title="已打卡"><FontAwesomeIcon :icon="faCheck" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
