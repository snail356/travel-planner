<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { TransportInfo } from '../../shared/types'
import { transportIcons } from '../icons'

defineProps<{ transports: TransportInfo[] }>()
</script>

<template>
  <section id="transport">
    <div class="wrap">
      <p class="eyebrow">GETTING AROUND</p>
      <h2>交通</h2>
      <p class="sub">機票、機場往返、市區移動</p>
      <div class="two">
        <div v-for="t in transports" :key="t.title" class="box">
          <div class="ico"><FontAwesomeIcon :icon="transportIcons[t.icon]" /></div>
          <h3>{{ t.title }}</h3>
          <p>{{ t.summary }}</p>
          <ul v-if="t.items.length">
            <li v-for="item in t.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
