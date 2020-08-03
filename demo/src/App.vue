<template lang="pug">
main
  section.section
    .container.margin-bottom
      h1.title Usage Examples
    .container.content
      p Basic Creation
      pre.
        const myDice = new Dice('1d6');
      p Basic Updating
      pre.
        myDice.addNext('1d4')
        // myDice.string === '1d6'
        // myDice.stringNext === '1d6+1d4'
        myDice.subtractNext('1d4')
        // myDice.string === '1d6'
        // myDice.stringNext === '1d6'
        myDice.subtractNext('1d4')
        // myDice.string === '1d6'
        // myDice.stringNext === '1d6-1d4'
        myDice.add('4')
        // myDice.string === '1d6+4'
        // myDice.stringNext === '1d6+4-1d4'
        myDice.subtract('1')
        // myDice.string === '1d6+3'
        // myDice.stringNext === '1d6+3-1d4'
        myDice.subtractNext('3-1d4')
        // myDice.string === '1d6+3'
        // myDice.stringNext === '1d6'
        const result = myDice.roll();
        // myDice.string === '1d6+3'
        // myDice.stringNext ==='1d6+3'
  section.section
    .container.margin-bottom
      h1.title Battle Analysis Demo
    .container.content
      .field
        .label Player Damage
        b-input(type='text',v-model='playerDamageString')
      .field
        .label Enemy Damage
        b-input(type='text',v-model='enemyDamageString')
      .container.margin-bottom
        .button.is-primary(@click='reroll()') Reroll
      .container.margin-bottom(v-if='healthChart')
        highcharts(:options='healthChart')
      .container(v-if='damageChart')
        highcharts(:options='damageChart')
      b-loading
  footer.footer
    .container
      .content.has-text-centered
        p.
          #[strong dice] and #[strong ion-cloud] were written by 
          #[a(href='http://nathanielinman.com') Nathaniel Inman] of
          #[a(href='http://www.theoestudio.com') The OE Studio].
        p.
          Copyright © {{(new Date).getFullYear()}}
          #[a(href='http://www.theoestudio.com') The OE Studio]. All Rights Reserved.
</template>
<script>
import {Dice} from '../../index';

window.Dice = Dice; //we allow user to play with Dice library in console
export default {
  name: 'app',
  created(){
    this.reroll();
  },
  data(){
    return {
      playerDamageString: '1d6',
      enemyDamageString: '1d8',
      healthChart: null,
      damageChart: null
    };
  },
  methods:{
    reroll(){
      let healthPlayer = 100,
          healthEnemy = 100,
          playerDice = new Dice(this.playerDamageString),
          enemyDice = new Dice(this.enemyDamageString),
          categories = [],
          dataPlayer = [],
          dataEnemy = [],
          combinedArray = [];

      for(let p=playerDice.min;p<=playerDice.max;p++){
        for(let e=enemyDice.max;e>=enemyDice.min;e--){
          healthPlayer = 100; healthEnemy = 100; //reset health
          categories.push(`${p}vs${e}`);
          do{
            healthPlayer-=e;
            if(healthPlayer>0) healthEnemy-=p;
          }while(healthPlayer>0&&healthEnemy>0);
          dataPlayer.push(healthPlayer);
          dataEnemy.push(healthEnemy);
        } //end for
      } //end for
      dataPlayer.forEach((player,i)=>{
        combinedArray.push({
          enemy: dataEnemy[i],
          player,
          category: categories[i],
          value: player-dataEnemy[i]
        });
      });
      combinedArray = combinedArray.sort((a,b)=> a.value>b.value?1:-1);
      dataPlayer = combinedArray.map(o=>o.player);
      dataEnemy = combinedArray.map(o=>o.enemy);
      categories = combinedArray.map(o=>o.category);
      this.healthChart = {
        title: {text: 'Health Results Based on Luck'},
        credits: false,
        xAxis: {categories,title:{text: 'Bad Luck to Good Luck'}},
        yAxis: {title: {text: 'Final Health'}},
        series: [
          {name: 'Player', data: dataPlayer},
          {name: 'Enemy', data: dataEnemy}
        ]
      };

      // damage chart is just random damage numbers using the input boxes
      let dataPlayerDamage = [],
          dataEnemyDamage = [];

      for(let i=0;i<50;i++){
        dataPlayerDamage.push(playerDice.roll());
        dataEnemyDamage.push(enemyDice.roll());
      } //end for
      this.damageChart = {
        title: {text: 'Damage Results Randomly Calculated'},
        credits: false,
        xAxis: {categories:categories.map((_,i)=> i),title:{text: 'Rounds'}},
        yAxis: {title: {text: 'Damage Amount'}},
        series: [
          {name: 'Player', data: dataPlayerDamage},
          {name: 'Enemy', data: dataEnemyDamage}
        ]
      };
    }
  }
};
</script>
<style lang="stylus" scoped>
.b-tabs .tab-content
  overflow visible

section.tab-content
  background #fff
  padding 1rem
  border-right 1px solid #dbdbdb
  border-left 1px solid #dbdbdb
  border-bottom 1px solid #dbdbdb
.b-tabs .tabs
  margin-bottom 0

.margin-bottom
  margin-bottom 1rem
</style>
