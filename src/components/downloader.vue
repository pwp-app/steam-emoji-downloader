<template>
  <div class="downloader">
    <div class="downloader-title">
      <span>Steam Emoji Downloader</span>
    </div>
    <div class="downloader-body">
      <div class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>{{ $t('emojiType') }}</span>
        </div>
        <el-radio-group
          v-model="emojiType"
          class="downloader-body-selector__control"
          size="default"
        >
          <el-radio-button label="emoji">{{ $t('emoji') }}</el-radio-button>
          <el-radio-button label="sticker">{{ $t('sticker') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="showFileType" class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>{{ $t('fileType') }}</span>
        </div>
        <el-radio-group v-model="fileType" class="downloader-body-selector__control" size="default">
          <el-radio-button label="apng">APNG</el-radio-button>
          <el-radio-button label="gif">GIF</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="showBgType" class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>{{ $t('background') }}</span>
        </div>
        <el-radio-group v-model="bgType" class="downloader-body-selector__control" size="default">
          <el-radio-button label="white">{{ $t('white') }}</el-radio-button>
          <el-radio-button label="transparent">{{ $t('transparent') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="downloader-body-input">
        <div class="downloader-body-input__label">
          <span>{{ fileNameLabel }}</span>
        </div>
        <el-input
          v-model="fileName"
          class="downloader-body-input__control"
          :placeholder="pleaseInputText"
          @keyup.enter="handleGetClicked"
        />
      </div>
      <div class="downloader-body-button">
        <el-button
          type="primary"
          :loading="emojiLoading || emojiConverting"
          @click="handleGetClicked"
        >
          {{ buttonText }}
        </el-button>
      </div>
    </div>
    <div class="downloader-footer">
      <span>
        Made by BackRunner
        <span class="downloader-footer-split">|</span>
        <a href="https://github.com/pwp-app/steam-emoji-downloader" target="_blank">GitHub</a>
        <span class="downloader-footer-split">|</span>
        v{{ version }}
      </span>
    </div>
  </div>
</template>

<script>
import parseAPNG from 'apng-js';
import version from '../version';
import { buffer2blob, downloadFromBlob } from '../utils/utils';
import { CORS_HOST, EMOJI_BASE, STICKER_BASE } from '../constants/urls';

const nameTestPattern = /^:(.+):$/;

export default {
  data() {
    return {
      emojiType: 'emoji',
      emojiLoading: false,
      emojiConverting: false,
      fileType: 'apng',
      bgType: 'white',
      fileName: '',
      version,
    };
  },
  computed: {
    fileNameLabel() {
      return this.emojiType === 'emoji' ? this.$t('emoji') : this.$t('sticker');
    },
    pleaseInputText() {
      return `${this.$t('pleaseInput')}${this.$t('name').replace('<label>', this.fileNameLabel).toLowerCase()}`;
    },
    showFileType() {
      return this.emojiType === 'sticker';
    },
    showBgType() {
      return this.showFileType && this.fileType === 'gif';
    },
    encodedFileName() {
      return encodeURIComponent(this.fileName);
    },
    fileUrl() {
      return this.emojiType === 'emoji'
        ? `${CORS_HOST.replace(/\/$/, '')}/${EMOJI_BASE.replace(/\/$/, '')}/${this.encodedFileName}`
        : `${CORS_HOST.replace(/\/$/, '')}/${STICKER_BASE.replace(/\/$/, '')}/${
            this.encodedFileName
          }`;
    },
    buttonText() {
      if (this.emojiLoading) {
        return this.$t('fetching');
      }
      if (this.emojiConverting) {
        return this.$t('generating');
      }
      return this.$t('fetch');
    },
    outputBgColor() {
      return this.bgType === 'white' ? '#fff' : 'rgba(0, 0, 0, 0)';
    },
  },
  methods: {
    async handleGetClicked() {
      this.fileName = this.fileName.trim();
      if (!this.fileName) {
        this.$message.error(this.pleaseInputText);
        return;
      }
      if (nameTestPattern.test(this.fileName)) {
        const matched = nameTestPattern.exec(this.fileName);
        // eslint-disable-next-line prefer-destructuring
        this.fileName = matched[1];
      }
      this.emojiLoading = true;
      try {
        const res = await this.axios.head(this.fileUrl);
        if (res.status !== 200) {
          this.$message.error(this.$t('fetchFailed'));
          this.emojiLoading = false;
          return;
        }
      } catch (err) {
        console.error('Fetch emoji error: ', err);
        this.$message.error(this.$t('fetchFailed'));
        this.emojiLoading = false;
        return;
      }
      let fileRes;
      try {
        fileRes = await this.axios.get(this.fileUrl, {
          responseType: 'arraybuffer',
        });
        if (fileRes.status !== 200) {
          this.$message.error(this.$t('fetchFailed'));
          this.emojiLoading = false;
          return;
        }
      } catch (err) {
        console.error('Download emoji error: ', err);
        this.emojiLoading = false;
        this.$message.error(this.$t('fetchFailed'));
        return;
      }
      const { data: imgData } = fileRes;
      if (
        this.emojiType === 'emoji' ||
        (this.emojiType === 'sticker' && this.fileType === 'apng')
      ) {
        // download
        const blob = buffer2blob(imgData, 'image/png');
        downloadFromBlob(blob, `${this.fileName}.png`);
        this.emojiLoading = false;
        this.$message.success(this.$t('fetchSuccess'));
      } else if (this.emojiType === 'sticker' && this.fileType === 'gif') {
        // convert apng to gif
        const apng = parseAPNG(imgData);
        const gif = new this.GIF({
          worker: 10,
          workerScript: 'js/gif.worker.js',
          quality: 10,
          width: apng.width,
          height: apng.height,
          background: this.outputBgColor,
          transparent: this.bgType === 'transparent' ? 0x00000000 : null,
        });
        gif.on('finished', (blob) => {
          this.emojiConverting = false;
          downloadFromBlob(blob, `${this.fileName}.gif`);
        });
        try {
          const images = [];
          const addFrames = () => {
            images.sort((a, b) => a.index - b.index);
            images.forEach((item, index) => {
              const frame = apng.frames[index];
              gif.addFrame(item.img, {
                delay: frame.delay,
                apng: true,
                width: frame.width,
                height: frame.height,
                top: frame.top,
                left: frame.left,
                disposeOp: frame.disposeOp,
                blendOp: frame.blendOp,
                transparent: this.bgType === 'transparent',
              });
            });
            this.emojiLoading = false;
            this.emojiConverting = true;
            gif.render();
          };
          apng.frames.forEach((frame, index) => {
            const { imageData } = frame;
            const img = new Image();
            img.onload = () => {
              images.push({ img, index });
              if (images.length === apng.frames.length) {
                addFrames();
              }
            };
            img.src = URL.createObjectURL(imageData);
          });
        } catch (err) {
          console.error('Convert error: ', err);
          this.emojiLoading = false;
          this.emojiConverting = false;
          this.$message.error(this.$t('generateFailed'));
        }
      }
    },
  },
};
</script>
