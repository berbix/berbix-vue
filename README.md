# Berbix Vue.js SDK

This Berbix Vue.js library provides simple interfaces to interact with the Berbix Verify flow.

## Installation

    npm install berbix-vue

## Usage

### Basic usage

```js
<template>
  <div id="app">
    <BerbixVerify
      clientId="your_client_id"
      role="your_role_key"
      @complete="handleComplete"
    />
  </div>
</template>

<script>
import BerbixVerify from 'berbix-vue';

export default {
  name: 'app',
  components: {
    BerbixVerify
  },
  methods: {
    handleComplete(event) {
      // send event.value to backend to fetch user verification data
    },
  }
}
</script>
```

### Full props

```js
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
  clientToken: String,
}
```

### Events

The following events are emitted from the component:

* `display`: fires when the component is loaded and ready to be displayed
* `complete`: fires when the user has completed the verification flow
* `state-change`: fires when the user transitions between verifications
* `error`: fires when some error occurs in the flow

## Publishing

    # Update the version in package.json
    npm run build
    npm publish
