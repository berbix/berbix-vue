export default {
  name: 'BerbixVerify',
  props: {
    clientId: String,
    role: String,
    baseUrl: String,
    environment: {
      type: String,
      default: 'production',
      validator: function(value) {
        return ['production', 'staging', 'sandbox'].indexOf(value) !== -1;
      },
    },
    overrideUrl: String,
    version: {
      type: String,
      default: 'v0',
    },
    email: String,
    phone: String,
    continuation: String,
  },
  data() {
    return {
      height: 0,
      show: true,
      idx: 0,
    };
  },
  methods: {
    makeBaseUrl() {
      const { baseUrl, environment } = this;
      if (baseUrl != null) {
        return baseUrl;
      }
      switch (environment) {
        case 'sandbox':
          return 'https://verify.sandbox.berbix.com';
        case 'staging':
          return 'https://verify.staging.berbix.com'
        default:
          return 'https://verify.berbix.com'
      }
    },
    frameUrl() {
      const { overrideUrl, version, clientId, role, email, phone, continuation } = this;
      if (overrideUrl != null) {
        return overrideUrl;
      }
      const result = (this.makeBaseUrl() + '/' + version + '/verify') +
        ('?client_id=' + clientId) +
        ('&role=' + role) +
        (email ? '&email=' + encodeURIComponent(email) : '') +
        (phone ? '&phone=' + encodeURIComponent(phone) : '') +
        (continuation ? '&continuation=' + continuation : '');
      //console.log(result);
      return result;
    },
    handleMessage: function(e) {
      if (e.origin !== this.makeBaseUrl()) {
        return;
      }

      var data = JSON.parse(e.data);
      if (data.type === 'VERIFICATION_COMPLETE') {
        try {
          if (data.payload.success) {
            this.$emit('complete', { value: data.payload.code });
          } else {
            this.$emit('error', data);
          }
        } catch (e) {
          // Continue clean-up even if callback throws
        }
        this.show = false;
      } else if (data.type === 'DISPLAY_IFRAME') {
        this.$emit('display');
        this.height = data.payload.height;
      } else if (data.type === 'RESIZE_IFRAME') {
        this.height = data.payload.height;
      } else if (data.type === 'RELOAD_IFRAME') {
        this.height = 0;
        this.idx += 1;
      } else if (data.type === 'STATE_CHANGE') {
        this.$emit('state-change', data.payload);
      } else if (data.type === 'ERROR_RENDERED') {
        this.$emit('error', data.payload);
      }
    },
  },
  created() {
    window.addEventListener('message', this.handleMessage);
  },
  destroyed() {
    window.removeEventListener('message', this.handleMessage);
  },
  render(createElement) {
    if (this.show) {
      return createElement('iframe', {
        key: this.idx,
        style: {
          height: this.height + 'px',
          'background-color': 'transparent',
          border: '0 none transparent',
          padding: 0,
          margin: 0,
          display: 'block',
          width: '100%',
          overflow: 'hidden',
        },
        attrs: {
          src: this.frameUrl(),
          allow: "camera",
          scrolling: "no",
        },
      })
    }
  }
}
