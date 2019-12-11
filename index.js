function randomInteger(min,max){
  return Math.floor(Math.random()*(max-min))+min;
} //end randomInteger()

function simplify(statements){
  const diceTypes = {};

  statements.forEach(statement=>{
    if(statement.die){
      const {die} = statement;

      if(!diceTypes[die.sides]){
        diceTypes[die.sides] = die.number*(statement.type==='add'?1:-1);
      }else{
        diceTypes[die.sides] += die.number*(statement.type==='add'?1:-1);
      } //end if
    }else if(!diceTypes[0]){
      diceTypes[0] = statement.constant*(statement.type==='add'?1:-1);
    }else{
      diceTypes[0] += statement.constant*(statement.type==='add'?1:-1);
    } //end if
  });
  return Object.keys(diceTypes)
    .reduce((result,sides,i)=>{
      if(i!==0) result+=diceTypes[sides]>=0?'+':'-';
      if(sides==='0'){
        return result+Math.abs(diceTypes[sides]); //implicit type coercion to string
      } //end if
      return result+`${Math.abs(diceTypes[sides])}d${sides}`;
    },'');
} //end simplify()

function compileStatements(diceString){
  let splitString = diceString.split(/(\+|\-)/g),
      operations = splitString.filter(s=>!['+','-'].includes(s)),
      operators = splitString.filter(s=>['+','-'].includes(s));

  operators.unshift('+'); //first roll is always additive
  return operations.reduce((result,statement,i)=>{
    return [
      ...result,
      new Statement(operators[i],operations[i])
    ];
  },[]);
} //end compileStatements()

class Die{
  constructor(number,sides){
    this.number = parseInt(number,10);
    this.sides = parseInt(sides,10);
  }
}
class Statement{
  constructor(operatorString,operationString){
    this.type = operatorString==='+'?'add':'subtract';
    this.string = operationString;
    if(this.string.includes('d')){
      this.die = new Die(...operationString.split('d'));
    }else{
      this.constant = parseInt(this.string);
    } //end if
  }
  get min(){
    return this.die?this.die.number:this.constant;
  }
  get max(){
    return this.die?this.die.number*this.die.sides:this.constant;
  }
}

// Using #d# and # and the operators + and -, any statement string. Ex:
// 3d8+23-2d4
export class Dice{
  constructor(diceString='',stringNext=''){
    this.string = diceString;
    this.stringNext = stringNext;
    this.statements = compileStatements(this.string);
    if(stringNext) this.statementsNext = compileStatements(this.stringNext);
  }
  addNext(diceString){
    const operator = diceString.includes('-')?'-':'+';

    this.stringNext = `${this.stringNext}${operator}${diceString.replace(/\-|\+/g,'')}`;
    this.statementsNext = compileStatements(this.stringNext);
    const simplifiedString = simplify(this.statementsNext);

    this.statementsNext = compileStatements(simplifiedString);
  }
  subtractNext(diceString){
    this.addNext(`-${diceString}`);
  }
  add(diceString){
    const operator = diceString.includes('-')?'-':'+';

    this.string = `${this.string}${operator}${diceString.replace(/\-|\+/g,'')}`;
    this.statements = compileStatements(this.string);
    const simplifiedString = simplify(this.statements);

    this.statementsNext = compileStatements(simplifiedString);
  }
  subtract(diceString){
    this.add(`-${diceString}`);
  }
  get min(){
    let result = 0;

    this.statements.forEach(statement=>{
      result+=(statement.type==='add'?1:-1)*statement.min;
    });
    return result;
  }
  get max(){
    let result = 0;

    this.statements.forEach(statement=>{
      result+=(statement.type==='add'?1:-1)*statement.max;
    });
    return result;
  }
  roll(){
    let result = 0;

    this.statements.forEach(statement=>{
      let {min,max} = statement;

      result+=(statement.type==='add'?1:-1)*randomInteger(min,max);
    });

    // add the statements next rolls then purge them
    if(this.statementsNext){
      this.statementsNext.forEach(statement=>{
        let {min,max} = statement;

        result+=(statement.type==='add'?1:-1)*randomInteger(min,max);
      });
      this.statementsNext = null;
      this.stringNext = '';
    } //end if
    return result;
  }
}

