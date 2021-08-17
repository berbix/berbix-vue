const SDK_VERSION = "1.0.1";

const PayloadType = {
  VerificationComplete: "VERIFICATION_COMPLETE",
  DisplayIFrame: "DISPLAY_IFRAME",
  ResizeIFrame: "RESIZE_IFRAME",
  ReloadIFrame: "RELOAD_IFRAME",
  StateChange: "STATE_CHANGE",
  ExitModal: "EXIT_MODAL",
  ErrorRendered: "ERROR_RENDERED",
};

const ModalType = {
  WithoutCloseButton: 1,
  WithCloseButton: 2,
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
      default: "v0",
    },
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
      const { baseUrl } = this;

      if (baseUrl) {
        return baseUrl;
      }

      return "https://verify.berbix.com";
    },
    frameUrl() {
      const {
        clientToken,
        overrideUrl,
        showCloseModalButton,
        showInModal,
        version,
      } = this;

      if (overrideUrl) {
        return overrideUrl;
      }

      var options = [`sdk=BerbixVue-${SDK_VERSION}`];

      if (clientToken) {
        options.push(`client_token=${clientToken}`);
      }

      if (showInModal) {
        options.push(
          `modal=${
            showCloseModalButton
              ? ModalType.WithCloseButton
              : ModalType.WithoutCloseButton
          }`
        );
      }

      var height = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      options.push(`max_height=${height}`);

      return `${this.makeBaseUrl()}/${version}/verify?${options.join("&")}`;
    },
    handleMessage(e) {
      if (e.origin !== this.makeBaseUrl()) {
        return;
      }

      var data = JSON.parse(e.data);
      const {
        type,
        payload: { success, margin, height },
      } = data;

      switch (type) {
        case PayloadType.VerificationComplete:
          try {
            if (success) {
              this.$emit("complete");
            } else {
              this.$emit("error", data);
            }
          } catch (e) {
            // Continue cleanup even if callback throws
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
    },
  },
  created() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
    }
  },
  destroyed() {
    if (typeof window !== "undefined") {
      window.removeEventListener("message", this.handleMessage);
    }
  },
  render(createElement) {
    if (!this.show) {
      return;
    }

    const iframe = createElement("iframe", {
      key: this.idx,
      style: {
        height: `${this.height}px`,
        "background-color": "transparent",
        border: "0 none transparent",
        padding: 0,
        margin: 0,
        display: "block",
        width: "100%",
        overflow: "hidden",
      },
      attrs: {
        src: this.frameUrl(),
        allow: "camera",
        scrolling: "no",
        referrerpolicy: "no-referrer-when-downgrade",
      },
    });

    if (this.showInModal) {
      return createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "background-color": "rgba(0, 0, 0, 0.6)",
            "z-index": 1000,
          },
        },
        [
          createElement(
            "div",
            {
              style: {
                margin: "0 auto",
                width: "100%",
                "max-width": "500px",
                "max-height": "100%",
                overflow: "auto",
                "margin-top": `${this.marginTop}px`,
              },
            },
            [iframe]
          ),
        ]
      );
    }
    return iframe;
  },
};
