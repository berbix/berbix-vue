const SDK_VERSION = '0.0.9';

export default {
  name: 'BerbixVerify',
  props: {
    // Required
    clientId: String,

    // Configuration
    templateKey: String,
    email: String,
    phone: String,
    clientToken: String,

    // Internal use
    environment: {
      type: String,
      default: 'production',
      validator: function(value) {
        return ['production', 'staging', 'sandbox'].indexOf(value) !== -1;
      },
    },
    baseUrl: String,
    overrideUrl: String,
    version: {
      type: String,
      default: 'v0',
    },

    // Deprecated
    continuation: String,
    role: String,
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
      const { overrideUrl, version, clientId, role, templateKey, email, phone, continuation, clientToken } = this;
      if (overrideUrl != null) {
        return overrideUrl;
      }
      const token = clientToken || continuation;
      const template = templateKey || role;
      var options = ['sdk=BerbixVue-' + SDK_VERSION];
      if (clientId) {
        options.push('client_id=' + clientId);
      }
      if (template) {
        options.push('template=' + template);
      }
      if (email) {
        options.push('email=' + encodeURIComponent(email));
      }
      if (phone) {
        options.push('phone=' + encodeURIComponent(phone));
      }
      if (token) {
        options.push('client_token=' + token);
      }
      return (this.makeBaseUrl() + '/' + version + '/verify?') + options.join('&');
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
        this.height = 200;
      }
    },
  },
  created() {
    if (typeof(window) !== 'undefined') {
      window.addEventListener('message', this.handleMessage);
    }
  },
  destroyed() {
    if (typeof(window) !== 'undefined') {
      window.removeEventListener('message', this.handleMessage);
    }
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
          referrerpolicy: "no-referrer-when-downgrade",
        },
      })
    }
  }
}
