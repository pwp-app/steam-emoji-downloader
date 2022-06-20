<template>
  <div class="downloader">
    <div class="downloader-title">
      <span>Steam Emoji Downloader</span>
    </div>
    <div class="downloader-body">
      <div class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>表情类型</span>
        </div>
        <el-radio-group
          v-model="emojiType"
          class="downloader-body-selector__control"
          size="default"
        >
          <el-radio-button label="emoji">表情图标</el-radio-button>
          <el-radio-button label="sticker">动态贴纸</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="showFileType" class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>文件类型</span>
        </div>
        <el-radio-group
          v-model="fileType"
          class="downloader-body-selector__control"
          size="default"
        >
          <el-radio-button label="apng">APNG</el-radio-button>
          <el-radio-button label="gif">GIF</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="showBgType" class="downloader-body-selector">
        <div class="downloader-body-selector__label">
          <span>背景</span>
        </div>
        <el-radio-group
          v-model="bgType"
          class="downloader-body-selector__control"
          size="default"
        >
          <el-radio-button label="white">白色</el-radio-button>
          <el-radio-button label="transparent">透明</el-radio-button>
        </el-radio-group>
      </div>
      <div class="downloader-body-input">
        <div class="downloader-body-input__label">
          <span>{{ fileNameLabel }}</span>
        </div>
        <el-input
          v-model="fileName"
          class="downloader-body-input__control"
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
        <a
          href="https://github.com/pwp-app/steam-emoji-downloader"
          target="_blank"
          >GitHub</a
        >
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
      emojiType: '表情图标',
      emojiLoading: false,
      emojiConverting: false,
      fileType: 'APNG',
      bgType: '白色',
      fileName: '',
      version,
    };
  },
  computed: {
    fileNameLabel() {
      return this.emojiType === 'emoji' ? '表情名称' : '贴纸名称';
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
        : `${CORS_HOST.replace(/\/$/, '')}/${STICKER_BASE.replace(/\/$/, '')}/${this.encodedFileName}`;
    },
    buttonText() {
      if (this.emojiLoading) {
        return '获取中';
      }
      if (this.emojiConverting) {
        return '正在生成 GIF';
      }
      return '获取';
    },
    outputBgColor() {
      return this.bgType === 'white' ? '#fff' : 'rgba(0, 0, 0, 0)';
    },
  },
  methods: {
    async handleGetClicked() {
      this.fileName = this.fileName.trim();
      if (!this.fileName) {
        this.$message.error(`请输入${this.fileNameLabel}`);
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
          this.$message.error('获取失败');
          this.emojiLoading = false;
          return;
        }
      } catch (err) {
        console.error('Fetch emoji error: ', err);
        this.$message.error('获取失败');
        this.emojiLoading = false;
        return;
      }
      let fileRes;
      try {
        fileRes = await this.axios.get(this.fileUrl, {
          responseType: 'arraybuffer',
        });
        if (fileRes.status !== 200) {
          this.$message.error('获取失败');
          this.emojiLoading = false;
          return;
        }
      } catch (err) {
        console.error('Download emoji error: ', err);
        this.emojiLoading = false;
        this.$message.error('获取失败');
        return;
      }
      const { data: imgData } = fileRes;
      if (
        this.emojiType === 'emoji'
        || (this.emojiType === 'sticker' && this.fileType === 'apng')
      ) {
        // download
        const blob = buffer2blob(imgData, 'image/png');
        downloadFromBlob(blob, `${this.fileName}.png`);
        this.emojiLoading = false;
        this.$message.success('获取成功');
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
          this.$message.error('转换失败');
        }
      }
    },
  },
};
</script>