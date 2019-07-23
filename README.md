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
      templateKey="your_template_key"
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

### Props

```js
props: {
  clientId: String,
  clientToken: String,
  templateKey: String,
  email: String,
  phone: String,
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
