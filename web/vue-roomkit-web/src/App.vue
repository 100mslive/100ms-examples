<template>
  <div id="app">
    <hms-prebuilt
      room-code="fba-xji-pnk"
    ></hms-prebuilt>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import '@100mslive/roomkit-web-component';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
};
</script>

<style>
#app {
  height: 100vh;
}
</style>
