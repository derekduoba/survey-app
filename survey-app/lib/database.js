/**
 * Database interation controller
 * TODO: Methods use callbacks for now. These should be converted to
 * promises at some point
 **/

const Hashids = require('hashids');
const sequelize = require('sequelize');

module.exports = (function () {
  let db;

  function logError(error) {
    console.error('DATABASE ERROR:');
    console.error(error);
  };

  return {
    /**
     * Initialize the module using a sequelizeJS object
     * @param {Object} db - A sequelizeJS object
     */
    init(database) {
      db = database;
    },


    /**
     * Create a survey question
     * @param {Object} questionData - JSON containing question information
     *  @param {String} question - The question
     *  @param {Array.<String>} answers - The answers
     * @return {Object} - Question Info
     *  @param {Number} id - Question ID; Will be blank on failure
     *  @param {Number} admin_key - The user administration key; Will be blank on failure
     */
    createQuestion(questionData, callback) {
      sequelize.Promise.resolve({}).then(() => {
        db.questions.create({ question: questionData.question }).then((question) => {
          this.question = question;
        }).then(() => {
          this.answers = sequelize.Promise.map(questionData.answers, (a) => {
            db.answers.create({ answer: a }).then((answer) => this.question.addAnswer(answer));
          });
        })
        .then(() => {
          callback({
            id: this.question.id,
            admin_key: new Hashids('survey time', 10).encode(this.question.id),
          });
        }).
        catch((error) => {
          logError(error);
          callback({});
        });
      });
    },


    /**
     * Get a survey question (or all questions)
     * TODO: This API could be extended to allow for batches of answers to
     * be returned (e.g. 100 at a time)
     * There are three different ways to obtain data using this function:
     * 1.) Get all questions by passing no data in the request object
     * 2.) Get a 'random' question by passing an array in the request.random property.
     *  This array may optionally contain a list of question IDs to ignore when choosing
     *  a question. At the moment the 'randomly chosen' question will simply be the
     *  question with the lwest ID that has not already been answered
     * 3.) Get a specific question by specifying an ID (e.g. 123) in the request.id property
     *
     * @param {Object} request - JSON containing question lookup information
     *  @param {Number} [id] - A question ID (e.g. 123); will return all questions if an
     *    id is not provided and 'random' is not set
     *  @param {Array.<Number>} [random] - Will retreive a random question that
     *    hasn't already been seen. The input array should contain a list of previously
     *    seen questions (can be empty)
     * @return {Array.Object} or {Object} - Array of objects containing the survey
     *  questions and answers. The array will be empty if no questions are found
     *  @param {Number} qid - The question ID
     *  @param {String} question - The question
     *  @param {Number} total_responses - The total number of responses to the current question
     *  @param {Array.<Object>} - Answer data
     *    @param {Number} id - Answer ID
     *    @param {String} answer - Answer
     *    @param {Number} responsess - Number of votes
     */
    getQuestion(request, callback) {
      function formatQuestionData(questions) {
        return questions.map((question) => ({
          id: question.id,
          question: question.dataValues.question,
          total_responses: question.dataValues.total_responses,
          answers: question.dataValues.answers.map((a) => a.dataValues),
        }));
      };
      // all questions
      if (typeof request.qid === 'undefined' && typeof request.random === 'undefined') {
        db.questions.findAll({
          where: {},
          include: [{
            model: db.answers,
          }],
        }).then((questions) => callback((questions != null) ? formatQuestionData(questions) : [])
        ).catch((error) => {
          logError(error);
          callback([], error);
        });
      // random question
      // eslint-disable-next-line max-len
      } else if (typeof request.qid === 'undefined' && typeof request.random !== 'undefined' && Array.isArray(request.random)) {
        db.questions.findOne({
          where: { id: { $not: request.random } },
          attributes: ['id', 'question', 'total_responses'],
          include: [{
            model: db.answers,
            where: { question_id: sequelize.col('questions.id') },
            attributes: ['id', 'answer', 'responses'],
          }],
        }).then((questions) => callback((questions != null) ? formatQuestionData([questions]) : [])
        ).catch((error) => {
          logError(error);
          callback([], error);
        });
      // specific question
      } else if (typeof request.qid !== 'undefined' && !isNaN(request.qid)) {
        db.questions.find({
          where: { id: request.qid },
          attributes: ['id', 'question', 'total_responses'],
          include: [{
            model: db.answers,
            where: { question_id: sequelize.col('questions.id') },
            attributes: ['id', 'answer', 'responses'],
          }],
        }).then((questions) => callback((questions != null) ? formatQuestionData([questions]) : [])
        ).catch((error) => {
          logError(error);
          callback([], error);
        });
      };
    },


    /**
     * Increment the number of votes for a question's answer
     * @param {Number} questionID - A question ID (e.g. 123)
     * @param {Number} answerID - A corresponding answer ID (e.g. 3)
     * @return {Boolean} true on success; false + error data on failure
     */
    updateVotes(questionID, answerID, callback) {
      db.answers.find({
        where: {
          question_id: questionID,
          id: answerID,
        },
      }).then((record) => {
        if (record) {
          record.increment('responses').then(() => {
            db.questions.find({
              where: {
                id: questionID,
              },
            }).then((record) => {
              record.increment('total_responses').then(() => {
                callback(true);
              });
            });
          });
        } else {
          logError(`No matching answer for qID= ${questionID}  aID=${answerID}`);
          callback(false);
        }
      }).catch((error) => {
        logError(error);
        callback(false);
      });
    },


    /**
     * Delete a question and all linked answers
     * Note: This is not currently used
     * @param {Number} questionID - a question id (e.g. 123)
     * @return {Boolean} true on success; false + error data otherwise
     */
    deleteQuestion(questionID, callback) {
      db.questions.destroy({
        where: { id: questionID },
        force: true,
      }).then(() => {
        callback(true);
      }).catch((error) => {
        logError(error);
      });
    },


    /**
     * Delete an answer from a question
     * Note: This will not be used for now
     * @param {Number} questionID - a question id (e.g. 123)
     * @return {Boolean} true on success; false + error data otherwise
     */
    deleteAnswer(questionID, answerID, callback) {
      db.answers.destroy({
        where: {
          question_id: questionID,
          id: answerID,
        },
        force: true,
      }).then(() => {
        callback(true);
      }).catch((error) => {
        logError(error);
      });
    },
  };
}());
