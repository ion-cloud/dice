import 'babel-polyfill';
import 'buefy/dist/buefy.min.css'
import './index.styl';
import Vue from 'vue/dist/vue.common';
import VueHighCharts from 'vue-highcharts';
import HighCharts from 'highcharts';
import Buefy from 'buefy';
import App from './App.vue';
import {Dice} from '../../index';

// Ensure prouction gets no vue messages and dev gets correct ones
Vue.config.devtools = false;
if(process.env.NODE_ENV==='production'){
  Vue.config.silent = true;
  Vue.config.productionTip = false;
} //end if

// Set highcharts master options
HighCharts.setOptions({lang: {thousandsSep: ','}});

// Setup chart capabilities
Vue.use(Buefy);
Vue.use(VueHighCharts,{HighCharts});

new Vue({
  el: '#demo-dice',
  render: h=> h(App)
});
