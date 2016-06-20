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
  
  //NOTE: TURN OFF TABLE DROPPING
  //sequelize.sync({force: true}).then(function() {
  sequelize.sync().then(function() {
    console.log('DB Model Initialized');
  }).catch(function(error) {
    console.log('Error during table creation.');
    console.log(error);
  });

  return {users: users, questions: questions, answers: answers};

};
