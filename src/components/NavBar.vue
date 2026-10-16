<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { navItems } from '../navItems'

const { route, food, spots, stay, transport, guide, cost } = navItems
const topLinks = [route, food, spots, stay, transport, guide, cost]
const tabs = [route, food, spots, stay, cost]
</script>

<template>
  <nav class="topnav">
    <div class="wrap">
      <a class="logo" href="#top">Hong<em>Kong</em></a>
      <a v-for="l in topLinks" :key="l.href" class="link" :href="l.href">{{ l.label }}</a>
    </div>
  </nav>
  <!-- 手機版底部 tab bar -->
  <nav class="tabbar" aria-label="快速導覽">
    <a v-for="t in tabs" :key="t.href" :href="t.href">
      <span><FontAwesomeIcon :icon="t.icon" /></span>{{ t.label }}
    </a>
  </nav>
</template>
