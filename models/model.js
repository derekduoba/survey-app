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
    text:Sequelize.STRING
  });

  // Answer table
  var answers = sequelize.define('answers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    text:Sequelize.STRING,
    response_count: Sequelize.INTEGER
  });

  // question_id becomes a foreign key on answer
  questions.hasMany(answers, {foreignKey: 'question_id', as: 'Answer'});
  answers.belongsTo(questions, {foreignKey: 'question_id'});

  sequelize.sync({force: true}).then(function() {
    console.log('Everything is amazing!');
  }).catch(function(error) {
    console.log('Error during table creation.');
    console.log(error);
  });

  return {users: users, questions: questions, answers: answers};

};
