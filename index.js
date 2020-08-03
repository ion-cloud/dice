function randomInteger(min,max){
  return Math.round(Math.random()*(max-min))+min;
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
    }else if(!diceTypes.constant){
      diceTypes.constant = statement.constant*(statement.type==='add'?1:-1);
    }else{
      diceTypes.constant += statement.constant*(statement.type==='add'?1:-1);
    } //end if
  });
  return Object.keys(diceTypes)
    .reduce((result,sides,i)=>{
      if(diceTypes[sides]===0) return result; //skip 0dx or +0
      result+=diceTypes[sides]>=0?'+':'-';
      if(sides==='constant'){
        return result+Math.abs(diceTypes.constant); //implicit type coercion to string
      } //end if
      return result+`${Math.abs(diceTypes[sides])}d${sides}`;
    },'');
} //end simplify()

function compileStatements(diceString){
  let splitString = diceString.split(/(\+|\-)/g).filter(s=>s.length),
      operations = splitString.filter(s=>!['+','-'].includes(s)).filter(s=>s.length),
      operators = splitString.filter(s=>['+','-'].includes(s));

  //sometimes the first operation isn't declared explicitly
  if(!['+','-'].includes(splitString[0])) operators.unshift('+');
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
  constructor(diceString='',diceStringNext=''){
    this.statements = compileStatements(diceString);
    this.string = simplify(this.statements);
    this.statements = compileStatements(this.string);
    this.stringNext = '';
    this.statementsNext = [];
    if(diceStringNext){
      this.statementsNext = compileStatements(`${diceString}+${diceStringNext}`);
      this.stringNext = simplify(this.statementsNext);
      this.statementsNext = compileStatements(this.stringNext);
    } //end if
  }
  addNext(diceString){
    this.stringNext = `${this.stringNext}${['-','+'].includes(diceString.slice(0,1))?'':'+'}${diceString}`;
    this.statementsNext = compileStatements(this.stringNext);
    this.stringNext = simplify(this.statementsNext);
    this.statementsNext = compileStatements(this.stringNext);
  }
  subtractNext(diceString){

    // if we're subtracting a statement then we just perform an inverse
    // of the statement
    this.addNext(`-${diceString.replace(/[-+]/g,c=> c==='-'?'+':'-')}`);
  }
  add(diceString){
    this.string = `${this.string}${['-','+'].includes(diceString.slice(0,1))?'':'+'}${diceString}`;
    this.statements = compileStatements(this.string);
    this.string = simplify(this.statements);
    this.statements = compileStatements(this.string);
    this.addNext(diceString); //reflect base changes to next roll as well
  }
  subtract(diceString){

    // if we're subtracting a statement then we just perform an inverse
    // of the statement
    this.add(`-${diceString.replace(/[-+]/g,c=> c==='-'?'+':'-')}`);
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
      this.stringNext = '';
      this.statementsNext = [];
    } //end if
    return result;
  }
}

