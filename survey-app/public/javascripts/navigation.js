'use strict';

/* eslint max-len: off */
/* global Cookies */
/* eslint-env browser */

$(document).ready(function () {
  /** Functions **/

  /**
   * Add an answer field to the question creation form
   */
  function addAnswer(container) {
    var answer = arguments.length <= 1 || arguments[1] === undefined ? 'Add an answer here...' : arguments[1];

    var textBox = '<input type="text" class="answer-field form-control input-lg" name="answer[]" placeholder="' + answer + '">';
    $(container).append(textBox);
  };

  /**
   * Submit a newly-created question
   */
  function submitQuestion(question, answers) {
    var questionInfo = {
      question: question,
      answers: answers
    };
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: { 'X-HTTP-Method-Override': 'PUT' },
      data: JSON.stringify(questionInfo)
    }).done(function (res) {
      $('.bottom-button').html('Question Created!');
      $('.create-question').data('question-created', true);
      var questionURL = window.location.origin + '/question/' + res.id;
      $('.content').html(
      /* eslint-disable prefer-template */
      '<h2 class="message">Here\'s a link to your question</h2>' + '<form>' + '<div id="question-url" class="input-group">' + '<input type="text" id="copy-input" class="form-control input-lg" value="' + questionURL + '" placeholder="Question URL">' + '<span class="input-group-btn">' + '<button class="btn btn-lg" type="button" id="copy-button" data-placement="button" title="Copy to Clipboard">' + 'Copy Link' + '</button>' + '</span>' + '</div>' + '<button class="btn btn-lg" type="button" id="view-result" data-placement="button" data-question-id="' + res.id + '" title="View Results">' + 'View Results' + '</button>' + '</form>');
    }).fail(function (error) {
      return console.error('ERROR:\n ' + error);
    });
  };

  /**
   *  Copy a question URL to the clipboard
   **/
  function copyQuestionURL() {
    var input = document.querySelector('#copy-input');
    input.setSelectionRange(0, input.value.length + 1);
    try {
      var success = document.execCommand('copy');
      if (success) {
        $('.message').html('Survey URL copied to the clipboard.');
      } else {
        $('.message').html('Could not automatically copy the URL to the clipboard. Try copying it manually.');
      }
    } catch (err) {
      $('.message').html('Could not automatically copy the URL to the clipboard. Try copying it manually.');
    };
    window.getSelection().removeAllRanges();
  };

  /**
   * Get information about a question (or a list of questions)
   */
  function getQuestionData(qID, random, successFunction) {
    // Add a space to an empty random array in order to allow it to be passed via ajax (lol jQuery)
    if (typeof random !== 'undefined' && random.length === 0) {
      random.push('');
    }

    var questionInfo = {
      qid: qID,
      random: random
    };
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: { 'X-HTTP-Method-Override': 'GET' },
      data: questionInfo
    }).done(function (res, status) {
      return successFunction(res, status);
    }).fail(function (error) {
      return console.error('ERROR: \n ' + error);
    });
  };

  /**
   * Render a question on the answer question page
   */
  function renderQuestion(questionData) {
    var emptyMessage = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

    if ($.isEmptyObject(questionData)) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html('<h2>' + emptyMessage + '</h2>');
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      };
    } else {
      var questionHTML = function questionHTML(id, question) {
        return '<h2 data-id="' + id + '">' + question + '</h2>';
      };

      var answerHTML = function answerHTML(answers, questionID) {
        return answers.reduce(function (fullHTML, element) {
          return (
            /* eslint-disable no-param-reassign, prefer-template */
            fullHTML += '<div class="answer">' + '<input type="radio" class="answer-selection" name="answer" value="' + element.id + '" data-answer-id="' + element.id + '" data-question-id="' + questionID + '">' + '<span class="answer-text">' + element.answer + '</span>' + '</div>'
          );
        }, '');
      };

      ;

      ;
      $('.question').html(questionHTML(questionData.id, questionData.question));
      $('.answers').html(answerHTML(questionData.answers, questionData.id));
    }
  };

  /**
   * Render a single question's result
   **/
  function renderQuestionResult(questionData) {
    function questionHTML(id, question) {
      return '<div class="question"><h2 data-id="' + id + '">' + id + '. ' + question + '</h2></div>';
    };

    function calculateAnswerPercent(totalResponses, answerResponseCount) {
      var width = answerResponseCount / totalResponses * 100;
      return 'value="' + width + '"';
    };

    function answerHTML(answers, qD) {
      return answers.reduce(function (fullHTML, element) {
        return fullHTML += '<div class="answer">' + '<progress class="answer-bar" max="100" ' + calculateAnswerPercent(qD.total_responses, element.responses) + '></progress>' + '<span class="answer-text" data-answer-id="' + element.id + '" data-question-id="' + qD.id + '">' + element.answer + '</span>' + '<span class="votes">' + element.responses + '</span>' + '</div>';
      }, '');
    };
    return '<div class="question-container">' + questionHTML(questionData.id, questionData.question) + answerHTML(questionData.answers, questionData) + '</div>';
  };

  /**
   * Render a list of question results as a collection
   */
  function renderQuestionResults(questionList) {
    var emptyMessage = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

    if (questionList.length === 0) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html('<h2>' + emptyMessage + '</h2>');
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      };
    } else if (questionList.length === 1) {
      $('.question-results.single').html(renderQuestionResult(questionList[0]));
    } else {
      questionList.forEach(function (questionData) {
        $('.question-results.list').append(renderQuestionResult(questionData));
      });
    };
  };

  /**
   * Get the cookie that stores answered questions
   */
  function getQuestionCookie() {
    var data = Cookies.get('seen-questions');
    return typeof data === 'undefined' ? [] : JSON.parse(data);
  };

  /**
   * Submit an answer to a question
   */
  function submitAnswer(answerData) {
    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      data: JSON.stringify(answerData)
    }).done(function () {
      var seenQuestions = getQuestionCookie();
      seenQuestions.push(answerData.qid);
      Cookies.set('seen-questions', JSON.stringify(seenQuestions), { expires: 1 });
      var page = $(location).attr('pathname');
      switch (page) {
        case '/question/random':
          getQuestionData(undefined, seenQuestions, function (res) {
            return renderQuestion(res[0]);
          });
          break;
        default:
          window.location = window.location.origin + '/results/' + answerData.qid;
          break;
      }
    }).fail(function (error) {
      return console.log('ERROR: \n ' + error);
    });
  };

  /** END FUNCTIONS **/

  // Initializers
  var page = $(location).attr('pathname');
  switch (page) {
    case '/question/random':
      {
        getQuestionData(undefined, getQuestionCookie(), function (res) {
          return renderQuestion(res[0]);
        });
        break;
      }
    case (page.match(/\/question\/\d+/) || {}).input:
      {
        var parts = page.split('/');
        var qID = parts.length > 2 ? Number(parts[2]) : undefined;
        var cookies = getQuestionCookie();
        if (typeof qID !== 'undefined' && cookies.indexOf(qID) >= 0) {
          window.location = window.location.origin + '/results/' + qID;
        }
        getQuestionData(qID, getQuestionCookie(), function (res) {
          return renderQuestion(res[0], 'This question doesn\'t exist.');
        });
        break;
      }
    case '/results/list':
      {
        getQuestionData(undefined, undefined, function (res) {
          return renderQuestionResults(res);
        });
        break;
      }
    case (page.match(/\/results\/\d+/) || {}).input:
      {
        var _parts = page.split('/');
        var _qID = _parts.length > 2 ? _parts[2] : undefined;
        getQuestionData(_qID, undefined, function (res) {
          return renderQuestionResults(res, 'This question doesn\'t exist.');
        });
        break;
      }
    default:
      break;
  };

  /** UI ACTIONS **/

  /** Add answer **/
  $('.add-answer').on('click', function () {
    addAnswer($('.answers'));
  });

  // TODO: create a remove-answer function too


  /** Submit question **/
  $('button.create-question').click(function () {
    if ($('.create-question').data('question-created') !== true) {
      (function () {
        var question = $('.question :input').val();
        var answers = [];
        $('.answers :input').map(function (i, element) {
          return answers.push($(element).val());
        });
        if (question && answers.length > 0) {
          submitQuestion(question, answers);
        };
      })();
    };
  });

  /** Submit Answer **/
  // eslint-disable-next-line prefer-arrow-callback
  $(document).on('click', '.answer-button', function () {
    var aID = $('input[name=answer]:checked').data('answer-id');
    var qID = $('input[name=answer]:checked').data('question-id');
    var answerData = {
      qid: qID,
      aid: aID
    };
    // Only allow submission if question hasn't been answered
    var answeredQuestions = getQuestionCookie();
    if (!answeredQuestions.includes(qID) && typeof aID !== 'undefined') {
      submitAnswer(answerData);
    } else if (answeredQuestions.includes(qID)) {
      window.location = window.location.origin + '/results/' + qID;
    }
  });

  /** Auto-clipboard **/
  $(document).on('click', '#copy-button', copyQuestionURL);

  /** View question results **/
  $(document).on('click', '#view-result', function () {
    var qID = $(this).data('question-id');
    window.open(window.location.origin + '/results/' + qID, '_blank');
  });

  /** END UI ACTIONS **/
});