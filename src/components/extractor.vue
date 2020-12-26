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
        <el-radio-group
          class="extractor-body-selector__control"
          v-model="emojiType"
          size="medium"
        >
          <el-radio-button label="表情图标"></el-radio-button>
          <el-radio-button label="动态贴纸"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="extractor-body-selector" v-if="showFileType">
        <div class="extractor-body-selector__label">
          <span>文件类型</span>
        </div>
        <el-radio-group
          class="extractor-body-selector__control"
          v-model="fileType"
          size="medium"
        >
          <el-radio-button label="APNG"></el-radio-button>
          <el-radio-button label="GIF"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="extractor-body-selector" v-if="showBgType">
        <div class="extractor-body-selector__label">
          <span>背景</span>
        </div>
        <el-radio-group
          class="extractor-body-selector__control"
          v-model="bgType"
          size="medium"
        >
          <el-radio-button label="白色"></el-radio-button>
          <el-radio-button label="透明"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="extractor-body-input">
        <div class="extractor-body-input__label">
          <span>{{ fileNameLabel }}</span>
        </div>
        <el-input class="extractor-body-input__control" v-model="fileName" />
      </div>
      <div class="extractor-body-button">
        <el-button
          type="primary"
          @click="handleGetClicked"
          :loading="emojiLoading || emojiConverting"
        >
          {{ buttonText }}
        </el-button>
      </div>
    </div>
    <div class="extractor-footer">
      <span
        >Made by pwp.app<span class="extractor-footer-split">|</span
        ><a href="" target="_blank">GitHub</a></span
      >
    </div>
  </div>
</template>

<script>
import parseAPNG from 'apng-js';
import { buffer2blob, downloadFromBlob } from '../utils/utils';
import { CORS_HOST, EMOJI_BASE, STICKER_BASE } from '../constrants/urls';

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
    };
  },
  computed: {
    fileNameLabel() {
      return this.emojiType === '表情图标' ? '表情名称' : '贴纸名称';
    },
    showFileType() {
      return this.emojiType === '动态贴纸';
    },
    showBgType() {
      return this.showFileType && this.fileType === 'GIF';
    },
    encodedFileName() {
      return encodeURIComponent(this.fileName);
    },
    fileUrl() {
      return this.emojiType === '表情图标'
        ? `${CORS_HOST}/${EMOJI_BASE}/${this.encodedFileName}`
        : `${CORS_HOST}/${STICKER_BASE}/${this.encodedFileName}`;
    },
    buttonText() {
      if (this.emojiLoading) {
        return '获取中';
      } if (this.emojiConverting) {
        return '正在生成 GIF';
      }
      return '获取';
    },
    outputBgColor() {
      return this.bgType === '白色' ? '#fff' : 'rgba(0, 0, 0, 0)';
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
          return;
        }
      } catch (err) {
        console.error('Fetch emoji error: ', err);
        this.$message.error('获取失败');
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
        this.emojiType === '表情图标'
        || (this.emojiType === '动态贴纸' && this.fileType === 'APNG')
      ) {
        // download
        const blob = buffer2blob(imgData, 'image/png');
        downloadFromBlob(blob, `${this.fileName}.png`);
        this.emojiLoading = false;
        this.$message.success('获取成功');
      } else if (this.emojiType === '动态贴纸' && this.fileType === 'GIF') {
        // convert apng to gif
        const apng = parseAPNG(imgData);
        const gif = new this.GIF({
          worker: 10,
          workerScript: 'js/gif.worker.js',
          quality: 10,
          width: apng.width,
          height: apng.height,
          background: this.outputBgColor,
          transparent: this.bgType === '透明' ? 0x00000000 : null,
        });
        let loaded = 0;
        gif.on('finished', (blob) => {
          this.emojiConverting = false;
          downloadFromBlob(blob, `${this.fileName}.gif`);
        });
        try {
          apng.frames.forEach((frame) => {
            const { imageData } = frame;
            const img = new Image();
            img.onload = () => {
              loaded += 1;
              gif.addFrame(img, {
                delay: frame.delay,
                copy: true,
                biasTop: frame.top,
                biasLeft: frame.left,
                transparent: this.bgType === '透明',
              });
              if (loaded === apng.frames.length) {
                this.emojiLoading = false;
                this.emojiConverting = true;
                gif.render();
              }
            };
            img.src = URL.createObjectURL(imageData);
          });
        } catch (err) {
          console.error('Convert error: ', err);
          this.emojiConverting = false;
          this.$message.error('转换失败');
        }
      }
    },
  },
};
</script>
