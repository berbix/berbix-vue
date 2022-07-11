import { h } from 'vue';
var SDK_VERSION = "3.0.0";
var PayloadType = {
  VerificationComplete: "VERIFICATION_COMPLETE",
  DisplayIFrame: "DISPLAY_IFRAME",
  ResizeIFrame: "RESIZE_IFRAME",
  ReloadIFrame: "RELOAD_IFRAME",
  StateChange: "STATE_CHANGE",
  ExitModal: "EXIT_MODAL",
  ErrorRendered: "ERROR_RENDERED"
};
var ModalType = {
  WithoutCloseButton: 1,
  WithCloseButton: 2
};
export default {
  name: "BerbixVerify",
  props: {
    // Configuration
    clientToken: String,
    showCloseModalButton: Boolean,
    showInModal: Boolean,
    // Internal use
    baseUrl: String,
    overrideUrl: String,
    version: {
      type: String,
      "default": "v0"
    }
  },
  data: function data() {
    return {
      height: 0,
      show: true,
      idx: 0
    };
  },
  methods: {
    makeBaseUrl: function makeBaseUrl() {
      var baseUrl = this.baseUrl;

      if (baseUrl) {
        return baseUrl;
      }

      return "https://verify.berbix.com";
    },
    frameUrl: function frameUrl() {
      var clientToken = this.clientToken,
          overrideUrl = this.overrideUrl,
          showCloseModalButton = this.showCloseModalButton,
          showInModal = this.showInModal,
          version = this.version;

      if (overrideUrl) {
        return overrideUrl;
      }

      var options = ["sdk=BerbixVue-".concat(SDK_VERSION)];

      if (clientToken) {
        options.push("client_token=".concat(clientToken));
      }

      if (showInModal) {
        options.push("modal=".concat(showCloseModalButton ? ModalType.WithCloseButton : ModalType.WithoutCloseButton));
      }

      var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      options.push("max_height=".concat(height));
      return "".concat(this.makeBaseUrl(), "/").concat(version, "/verify?").concat(options.join("&"));
    },
    handleMessage: function handleMessage(e) {
      if (e.origin !== this.makeBaseUrl()) {
        return;
      }

      var data = JSON.parse(e.data);
      var type = data.type,
          _data$payload = data.payload,
          success = _data$payload.success,
          margin = _data$payload.margin,
          height = _data$payload.height;

      switch (type) {
        case PayloadType.VerificationComplete:
          try {
            if (success) {
              this.$emit("complete");
            } else {
              this.$emit("error", data);
            }
          } catch (e) {// Continue cleanup even if callback throws
          }

          this.show = false;
          break;

        case PayloadType.DisplayIFrame:
          this.$emit("display");
          this.marginTop = margin || 0;
          this.height = height;
          break;

        case PayloadType.ResizeIFrame:
          this.height = height;
          break;

        case PayloadType.ReloadIFrame:
          this.height = 0;
          this.idx += 1;
          break;

        case PayloadType.StateChange:
          this.$emit("state-change", data.payload);
          break;

        case PayloadType.ExitModal:
          this.$emit("close-modal");
          break;

        case PayloadType.ErrorRendered:
          this.$emit("error", data.payload);
          this.height = 200;
          break;

        default:
          break;
      }
    }
  },
  created: function created() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
    }
  },
  destroyed: function destroyed() {
    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleMessage);
    }
  },
  render: function render() {
    if (!this.show) {
      return;
    }

    var iframe = h("iframe", {
      key: this.idx,
      style: {
        height: "".concat(this.height, "px"),
        "background-color": "transparent",
        border: "0 none transparent",
        padding: 0,
        margin: 0,
        display: "block",
        width: "100%",
        overflow: "hidden"
      },
      src: this.frameUrl(),
      allow: "camera",
      scrolling: "no",
      referrerpolicy: "no-referrer-when-downgrade"
    });

    if (this.showInModal) {
      return h("div", {
        style: {
          width: "100%",
          height: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          "background-color": "rgba(0, 0, 0, 0.6)",
          "z-index": 1000
        }
      }, [h("div", {
        style: {
          margin: "0 auto",
          width: "100%",
          "max-width": "500px",
          "max-height": "100%",
          overflow: "auto",
          "margin-top": "".concat(this.marginTop, "px")
        }
      }, [iframe])]);
    }

    return iframe;
  }
};
