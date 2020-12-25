<template>
  <div class="extractor">
    <div class="extractor-title">
      <span>Steam Emoji Extractor</span>
    </div>
    <div class="extractor-body">
      <div class="extractor-body-selector">
        <div class="extractor-body-selector__label">
          <span>表情类型</span>
        </div>
        <el-radio-group class="extractor-body-selector__control" v-model="emojiType" size="medium">
          <el-radio-button label="表情图标"></el-radio-button>
          <el-radio-button label="动态贴纸"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="extractor-body-selector" v-if="showFileType">
        <div class="extractor-body-selector__label">
          <span>文件类型</span>
        </div>
        <el-radio-group class="extractor-body-selector__control" v-model="fileType" size="medium">
          <el-radio-button label="APNG"></el-radio-button>
          <el-radio-button label="GIF"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="extractor-body-input">
        <div class="extractor-body-input__label">
          <span>{{fileNameLabel}}</span>
        </div>
        <el-input class="extractor-body-input__control" v-model="fileName"/>
      </div>
      <div class="extractor-body-button">
        <el-button type="primary" @click="hanldeGetClicked">获取</el-button>
      </div>
    </div>
  </div>
</template>

<script>
const CORS_HOST = 'https://cors.pwp.workers.dev/';
const EMOJI_BASE = 'https://community.cloudflare.steamstatic.com/economy/emoticonlarge/';
const STICKER_BASE = 'https://community.cloudflare.steamstatic.com/economy/sticker/';

export default {
  data() {
    return {
      emojiType: '表情图标',
      fileType: 'APNG',
      fileName: '',
    };
  },
  computed: {
    fileNameLabel() {
      return this.emojiType === '表情图标' ? '表情名称' : '贴纸名称';
    },
    showFileType() {
      return this.emojiType === '动态贴纸';
    },
  },
  methods: {
    hanldeGetClicked() {
      if (this.emojiType === '表情图标') {
        
      }
    },
  },
};
</script>
