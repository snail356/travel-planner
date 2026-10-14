<script setup lang="ts">
import type { Trip } from '../../shared/types'
import { useTrip } from '../composables/useTrip'

defineProps<{ trip: Trip }>()
const { foodTotal } = useTrip()
</script>

<template>
  <section id="cost">
    <div class="wrap">
      <p class="eyebrow">BUDGET</p>
      <h2>花費總覽</h2>
      <p class="sub">金額為新台幣（餐廳為當次合計）</p>
      <div class="member-card">
        <div class="top">
          <span class="brand">HongKong Trip</span>
          <span class="kind">旅費卡</span>
        </div>
        <div v-for="c in trip.costs" :key="c.label" class="row">
          <span class="lbl">{{ c.label }}</span>
          <span class="amt">${{ c.amount.toLocaleString() }}<template v-if="c.unit"> / {{ c.unit }}</template></span>
        </div>
        <div class="row">
          <span class="lbl">餐飲（各餐廳合計）</span>
          <span class="amt">${{ foodTotal.toLocaleString() }}</span>
        </div>
        <div class="total">
          <span>平均一人花費</span>
          <b>${{ trip.avgCostPerPerson.toLocaleString() }}</b>
        </div>
      </div>
    </div>
  </section>
</template>
