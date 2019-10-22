// Using #d# and # and the operators + and -, any statement string. Ex:
// 3d8+23-2d4
export class Dice{
  constructor(damageString){
    this.string = damageString;
    this.compileStatements();
  }
  compileStatements(){
    let splitString = this.string.split(/(\+|\-)/g),
        filteredOperations = splitString.filter(s=>!['+','-'].includes(s)),
        filteredOperators = splitString.filter(s=>['+','-'].includes(s));

    this.statements = [];
    filteredOperators.unshift('+'); //first roll is always additive
    filteredOperations.forEach((s,i)=>{
      this.statements.push({
        operator: filteredOperators[i],
        operation: filteredOperations[i]
      });
    });
    return this.statements;
  }
  get min(){
    let result = 0;

    this.statements.forEach(statement=>{
      if(statement.operator==='+'){
        result+=minOperation(statement.operation);
      }else{
        result-=minOperation(statement.operation);
      }
    });
    return result;
  }
  get max(){
    let result = 0;

    this.statements.forEach(statement=>{
      if(statement.operator==='+'){
        result+=maxOperation(statement.operation);
      }else{
        result-=maxOperation(statement.operation);
      } //end if
    });
    return result;
  }
  randomInteger(min,max){
    return Math.floor(Math.random()*(max-min))+min;
  }
  roll(){
    let result = 0;

    this.statements.forEach(statement=>{
      let min = minOperation(statement.operation),
          max = maxOperation(statement.operation);

      if(statement.operator==='+'){
        result+=this.randomInteger(min,max);
      }else{
        result-=this.randomInteger(min,max);
      } //end if
    });
    return result;
  }
}

function minOperation(operation){
  let splitString = operation.split(/d/g);

  return +splitString[0];
} //end minOperation()

function maxOperation(operation){
  let splitString = operation.split(/d/g),
      result = 0;

  if(splitString.length>1){
    result = splitString[0]*splitString[1]; //#d#
  }else{
    result = +splitString[0]; //#
  } //end if
  return result;
} //end maxOperation()
