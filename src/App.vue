<template>
  <div class="container">
    <Downloader />
  </div>
</template>

<script>
import { lazyloadGoogleFonts } from 'lazyload-gfonts';
import Downloader from './components/downloader.vue';

export default {
  components: {
    Downloader,
  },
  beforeCreate() {
    lazyloadGoogleFonts({
      fontFamily: 'Noto+Sans+SC:wght@300;400;500;900',
      display: 'swap',
      apiHost: 'gfonts.pwp.link',
    });
  }
};
</script>
