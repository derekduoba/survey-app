/**
 * Database model
 **/

var Sequelize = require('sequelize');

module.exports = function(sequelize) {

  // User table
  var users  = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name:Sequelize.STRING,
    password: Sequelize.STRING
  });

  // Question table
  var questions = sequelize.define('questions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    total_responses: {
      type: Sequelize.INTEGER,
      defaultValue:0
    },
    question:Sequelize.STRING
  });

  // Answer table
  var answers = sequelize.define('answers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    answer:Sequelize.STRING,
    responses: { 
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });

  // question_id becomes a foreign key on answer
  questions.hasMany(answers, {
    foreignKey: 'question_id', 
  });


  var delay = function(delayMS) {
    return new Promise(function(resolve){
      setTimeout(resolve, delayMS);
    });
  };
  

  var retryFunction = function(functionToRetry, initialTimeout, increment) {
    return functionToRetry().catch(function(err) {
      console.log('ERROR: ' + err);
      console.log('Retrying...');
      return delay(initialTimeout).then(function(){
        return retryFunction(functionToRetry, initialTimeout + increment, increment);
      });
    });
  };


  var retryFunctionWithTimeout = function(functionToRetry, initialTimeout, increment, maxTimeout) {
    var overallTimeout = delay(maxTimeout).then(function(){
      functionToRetry = function(){ return Promise.resolve() };
      throw new Error('Database could not be reached after maximum timeout (' + maxTimeout + 'ms)');
    }).catch(function(err) { 
      // TODO: This is a fatal application error and must be handled appropriately
      console.log(err); 
    });
    
    var operation = retryFunction(function(){
      return functionToRetry();
    }, initialTimeout, increment);
    return Promise.race([operation, overallTimeout]);
  };

  
  // NOTE: Uncomment to drop any preexisting table (DANGEROUS)
  //retryFunctionWithTimeout(function() { return sequelize.sync({force: true}).then(function() { console.log('Database connected'); }); } , 1000, 1000, 6000);
  retryFunctionWithTimeout(function() { return sequelize.sync().then(function() { console.log('Database model initialized'); }); } , 1000, 1000, 60000);

  return {users: users, questions: questions, answers: answers}
};
