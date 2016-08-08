/**
 * Database model
 **/

const Sequelize = require('sequelize');

module.exports = function (sequelize) {
  // User table
  const users = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    password: Sequelize.STRING,
  });

  // Question table
  const questions = sequelize.define('questions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total_responses: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    question: Sequelize.STRING,
  });

  // Answer table
  const answers = sequelize.define('answers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    answer: Sequelize.STRING,
    responses: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });

  // question_id becomes a foreign key on answer
  questions.hasMany(answers, {
    foreignKey: 'question_id',
  });


  function delay(delayMS) {
    return new Promise((resolve) => setTimeout(resolve, delayMS));
  };


  function retryFunction(functionToRetry, initialTimeout, increment) {
    return functionToRetry().catch((err) => {
      console.log(`ERROR: ${err} \n Retrying...`);
      return delay(initialTimeout).then(() =>
        retryFunction(functionToRetry, initialTimeout + increment, increment
      ));
    });
  };


  function retryFunctionWithTimeout(functionToRetry, initialTimeout, increment, maxTimeout) {
    const overallTimeout = delay(maxTimeout).then(() => {
      // eslint-disable-next-line no-param-reassign
      functionToRetry = () => Promise.resolve();
      throw new Error(`Database could not be reached after maximum timeout (${maxTimeout} ms)`);
    });
    const operation = retryFunction(() => functionToRetry(), initialTimeout, increment);
    return Promise.race([operation, overallTimeout]);
  };


  // NOTE: Use the following to drop any preexisting tables (DANGEROUS)
  retryFunctionWithTimeout(() =>
    sequelize.sync().then(() => console.log('Database model initialized')),
    1e3,
    1e3,
    300e3
  ).catch((err) => console.error(err)); // TODO: Handle fatal error accordingly

  return { users, questions, answers };
};
