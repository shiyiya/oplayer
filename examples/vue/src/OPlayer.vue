<template>
  <div id="oplayer"></div>
</template>

<script setup lang="ts">
import OPlayer, { PlayerOptions } from '@oplayer/core'
import dash from '@oplayer/dash'
import ui from '@oplayer/ui'
import { onBeforeUnmount, onMounted } from 'vue'

const player = ref<OPlayer>()

const { details } = defineProps<{ details: any }>()

const router = useRoute()

let poster = ''
const defaultEpisode = router.params.id

details.sections.section.forEach((section: any) => {
  section.ep_details.forEach((episode: any) => {
    console.log(episode.episode_id, defaultEpisode)
    if (episode.episode_id === parseInt(defaultEpisode)) {
      poster = episode.horizontal_cover
    }
  })
})

const options: PlayerOptions = {
  source: {
    src: '/dash/' + defaultEpisode + '/3.mpd',
    title: details.title,
    poster: '/static/img/' + poster + '@720w_405h_1e_1c_90q.webp'
  }
}

onMounted(() => {
  const plugins = [
    ui({
      theme: { primaryColor: '#ffc107' },
      keyboard: { global: true },
      slideToSeek: 'always',
      controlBar: { back: 'fullscreen' },
      subtitle: {
        source: ['Bahasa Indonesia', 'English', 'Thailand', 'Vietnam', 'Malaysia or zh-CN?', 'zh-CN?'].map(
          (name, key) => ({
            name: name,
            type: 'vtt',
            default: name == 'English',
            src: `/stream/subtitles/${key}/${defaultEpisode}`
          })
        )
      },
      menu: [
        {
          name: '480P',
          onChange({ value, name }, elm) {
            player.value?.changeQuality({ src: value })
            elm.innerText = name
          },
          children: [
            {
              name: '360P',
              value: `/dash/${defaultEpisode}/4.mpd`
            },
            {
              name: '480P',
              default: true,
              value: `/dash/${defaultEpisode}/3.mpd`
            },
            {
              name: '720P',
              value: `/dash/${defaultEpisode}/2.mpd`
            },
            {
              name: '1080P',
              value: `/dash/${defaultEpisode}/1.mpd`
            },
            {
              name: '1080(HD)',
              value: `/dash/${defaultEpisode}/0.mpd`
            }
          ]
        }
      ]
    }),
    dash()
  ]
  player.value = OPlayer.make('#oplayer', options).use(plugins).create()
})

onBeforeUnmount(() => {
  player.value?.destroy()
})
</script>
<style scoped>
#oplayer {
  aspect-ratio: 16/9;
}
</style>
