<template>
  <div class="container">
    <Extractor />
  </div>
</template>

<script>
import { lazyloadGoogleFonts } from 'lazyload-gfonts';
import Extractor from './components/extractor.vue';

export default {
  components: {
    Extractor,
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
