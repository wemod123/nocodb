<script lang="ts" setup>
import { onKeyDown } from '@vueuse/core'
import { useAttachmentCell } from './utils'
import { computed, iconMap, isImage, ref, useAttachment, useEventListener } from '#imports'
import type { NcButton } from '#build/components';

const { selectedImage, visibleItems, downloadFile } = useAttachmentCell()!

const carouselRef = ref()

const container = ref()

const imageItems = computed(() => visibleItems.value.filter((item) => isImage(item.title, item.mimetype)))

const { getPossibleAttachmentSrc } = useAttachment()

/** navigate to previous image on button click */
onKeyDown(
  (e) => ['Left', 'ArrowLeft', 'A'].includes(e.key),
  () => {
    if (carouselRef.value) carouselRef.value.prev()
  },
)

/** navigate to next image on button click */
onKeyDown(
  (e) => ['Right', 'ArrowRight', 'D'].includes(e.key),
  () => {
    if (carouselRef.value) carouselRef.value.next()
  },
)

/** set our selected image when slide changes */
function onSlideChange(index: number) {
  selectedImage.value = imageItems.value[index]
}

/** set our carousel ref and move to initial slide  */
const setCarouselRef = (el: Element) => {
  carouselRef.value = el

  carouselRef.value?.goTo(
    imageItems.value.findIndex((item) => item === selectedImage.value),
    true,
  )
}

/** close overlay view when clicking outside of image */
useEventListener(container, 'click', (e) => {
  if (!(e.target as HTMLElement)?.closest('.keep-open') && !(e.target as HTMLElement)?.closest('img')) {
    selectedImage.value = false
  }
})
</script>

<template>
  <GeneralOverlay v-model="selectedImage" :z-index="1001" class="bg-gray-500 bg-opacity-80">
    <template v-if="selectedImage">
      <div ref="container" class="overflow-hidden text-center relative xs:h-screen">
        <div
          class="keep-open flex items-center h-14 px-8 w-full py-2 bg-gray-700 text-white mb-4 text-center rounded shadow"
          
        >
          <div class="font-bold text-slate-100 text-lg">{{ selectedImage && selectedImage.title }}</div>
          <div class="flex-grow" />
          <NcButton size="small" @click.stop="downloadFile(selectedImage)"> 
            <component :is="iconMap.cloudDownload" class="mx-2 !text-white"/>
            <span>{{ $t("general.download") }}</span>
          </NcButton>
          <a-button shape="circle" type="text" class="ml-4 hover:!bg-slate-500/60 !bg-slate-600"  @click.stop="selectedImage = false"> 
            <component :is="iconMap.close" class="text-slate-300"/>
          </a-button>
        </div>
        <div class="px-12 pt-8">
        <a-carousel
          v-if="!!selectedImage"
          :ref="setCarouselRef"
          dots-class="slick-dots slick-thumb"
          :after-change="onSlideChange"
          arrows
        >
          <template #prevArrow>
            <div class="custom-slick-arrow left-2 z-1 keep-open">
              <MaterialSymbolsArrowCircleLeftRounded class="rounded-full" />
            </div>
          </template>

          <template #nextArrow>
            <div class="custom-slick-arrow !right-2 z-1 keep-open">
              <MaterialSymbolsArrowCircleRightRounded class="rounded-full" />
            </div>
          </template>

          <template #customPaging="props">
            <div class="cursor-pointer h-full nc-attachment-img-wrapper">
              <LazyCellAttachmentImage
                class="!block m-auto h-full w-full"
                :alt="imageItems[props.i].title || `#${props.i}`"
                :srcs="getPossibleAttachmentSrc(imageItems[props.i])"
              />
            </div>
          </template>
          <div v-for="(item, idx) of imageItems" :key="idx">
            <LazyCellAttachmentImage :srcs="getPossibleAttachmentSrc(item)" class="max-w-70vw max-h-70vh" />
          </div>
        </a-carousel>
        </div>
      </div>
    </template>
  </GeneralOverlay>
</template>

<style scoped>
.ant-carousel :deep(.custom-slick-arrow .nc-icon):hover {
  @apply !bg-white;
}
.ant-carousel :deep(.slick-dots) {
  @apply relative mt-4;
}

.ant-carousel :deep(.slick-slide) {
  @apply w-full;
}

.ant-carousel :deep(.slick-slide img) {
  @apply border-1 m-auto;
}

.ant-carousel :deep(.slick-thumb) {
  @apply bottom-2;
}

.ant-carousel :deep(.slick-thumb li) {
  @apply w-[60px] h-[45px];
}

.ant-carousel :deep(.slick-thumb li img) {
  @apply w-full h-full block;
  filter: grayscale(100%);
}

.ant-carousel :deep(.slick-thumb li.slick-active img) {
  filter: grayscale(0%);
}

.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  @apply text-4xl text-white hover:text-primary active:text-accent opacity-100 cursor-pointer z-1;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.5;
}

.nc-attachment-img-wrapper {
  width: fit-content !important;
}
</style>
