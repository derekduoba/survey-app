
/* eslint max-len: off */
/* global Cookies */
/* eslint-env browser */

$(document).ready(() => {
  /** Functions **/

  /**
   * Add an answer field to the question creation form
   */
  function addAnswer(container, answer = 'Add an answer here...') {
    const textBox = `<input type="text" class="answer-field form-control input-lg" name="answer[]" placeholder="${answer}">`;
    $(container).append(textBox);
  };


  /**
   * Submit a newly-created question
   */
  function submitQuestion(question, answers) {
    const questionInfo = {
      question,
      answers,
    };
    $.ajax({
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: { 'X-HTTP-Method-Override': 'PUT' },
      data: JSON.stringify(questionInfo),
    }).done((res) => {
      $('.bottom-button').html('Question Created!');
      $('.create-question').data('question-created', true);
      const questionURL = `${window.location.origin}/question/${res.id}`;
      $('.content').html(
        /* eslint-disable prefer-template */
        '<h2 class="message">Here\'s a link to your question</h2>' +
          '<form>' +
          '<div id="question-url" class="input-group">' +
          '<input type="text" id="copy-input" class="form-control input-lg" value="' + questionURL + '" placeholder="Question URL">' +
          '<span class="input-group-btn">' +
          '<button class="btn btn-lg" type="button" id="copy-button" data-placement="button" title="Copy to Clipboard">' +
          'Copy Link' +
          '</button>' +
          '</span>' +
          '</div>' +
          '<button class="btn btn-lg" type="button" id="view-result" data-placement="button" data-question-id="' + res.id + '" title="View Results">' +
          'View Results' +
          '</button>' +
          '</form>'
      );
    }).fail((error) => console.error(`ERROR:\n ${error}`));
  };


  /**
   *  Copy a question URL to the clipboard
   **/
  function copyQuestionURL() {
    const input = document.querySelector('#copy-input');
    input.setSelectionRange(0, input.value.length + 1);
    try {
      const success = document.execCommand('copy');
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
    if (typeof random !== 'undefined' && random.length === 0) { random.push(''); }

    const questionInfo = {
      qid: qID,
      random,
    };
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      url: '/question',
      headers: { 'X-HTTP-Method-Override': 'GET' },
      data: questionInfo,
    })
    .done((res, status) => successFunction(res, status))
    .fail((error) => console.error(`ERROR: \n ${error}`));
  };


  /**
   * Render a question on the answer question page
   */
  function renderQuestion(questionData, emptyMessage = undefined) {
    if ($.isEmptyObject(questionData)) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html(`<h2>${emptyMessage}</h2>`);
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      };
    } else {
      function questionHTML(id, question) { return `<h2 data-id="${id}">${question}</h2>`; };

      function answerHTML(answers, questionID) {
        return answers.reduce((fullHTML, element) => (
          /* eslint-disable no-param-reassign, prefer-template */
          fullHTML += '<div class="answer">' +
            '<input type="radio" class="answer-selection" name="answer" value="' + element.id + '" data-answer-id="' + element.id + '" data-question-id="' + questionID + '">' +
            '<span class="answer-text">' + element.answer + '</span>' +
            '</div>'
        ), '');
      };
      $('.question').html(questionHTML(questionData.id, questionData.question));
      $('.answers').html(answerHTML(questionData.answers, questionData.id));
    }
  };


  /**
   * Render a single question's result
   **/
  function renderQuestionResult(questionData) {
    function questionHTML(id, question) { return '<div class="question"><h2 data-id="' + id + '">' + id + '. ' + question + '</h2></div>'; };

    function calculateAnswerPercent(totalResponses, answerResponseCount) {
      const width = (answerResponseCount / totalResponses) * 100;
      return `value="${width}"`;
    };

    function answerHTML(answers, qD) {
      return answers.reduce((fullHTML, element) => (
        fullHTML += '<div class="answer">' +
          '<progress class="answer-bar" max="100" ' + calculateAnswerPercent(qD.total_responses, element.responses) + '></progress>' +
          '<span class="answer-text" data-answer-id="' + element.id + '" data-question-id="' + qD.id + '">' +
          element.answer +
          '</span>' +
          '<span class="votes">' + element.responses + '</span>' +
          '</div>'
      ), '');
    };
    return '<div class="question-container">' +
      questionHTML(questionData.id, questionData.question) +
      answerHTML(questionData.answers, questionData) +
    '</div>';
  };


  /**
   * Render a list of question results as a collection
   */
  function renderQuestionResults(questionList, emptyMessage = undefined) {
    if (questionList.length === 0) {
      if (typeof emptyMessage !== 'undefined') {
        $('.content').html('<h2>' + emptyMessage + '</h2>');
      } else {
        $('.content').html('<h2>There aren\'t any questions!</h2>');
      };
    } else if (questionList.length === 1) {
      $('.question-results.single').html(renderQuestionResult(questionList[0]));
    } else {
      questionList.forEach((questionData) => {
        $('.question-results.list').append(renderQuestionResult(questionData));
      });
    };
  };


  /**
   * Get the cookie that stores answered questions
   */
  function getQuestionCookie() {
    const data = Cookies.get('seen-questions');
    return ((typeof data === 'undefined') ? [] : JSON.parse(data));
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
      data: JSON.stringify(answerData),
    }).done(() => {
      const seenQuestions = getQuestionCookie();
      seenQuestions.push(answerData.qid);
      Cookies.set('seen-questions', JSON.stringify(seenQuestions), { expires: 1 });
      const page = $(location).attr('pathname');
      switch (page) {
        case '/question/random':
          getQuestionData(undefined, seenQuestions, (res) => renderQuestion(res[0]));
          break;
        default:
          window.location = `${window.location.origin}/results/${answerData.qid}`;
          break;
      }
    }).fail((error) => console.log(`ERROR: \n ${error}`));
  };


  /** END FUNCTIONS **/


  // Initializers
  const page = $(location).attr('pathname');
  switch (page) {
    case '/question/random': {
      getQuestionData(undefined, getQuestionCookie(), (res) => renderQuestion(res[0]));
      break;
    }
    case (page.match(/\/question\/\d+/) || {}).input: {
      const parts = page.split('/');
      const qID = (parts.length > 2) ? Number(parts[2]) : undefined;
      const cookies = getQuestionCookie();
      if (typeof qID !== 'undefined' && cookies.indexOf(qID) >= 0) { window.location = `${window.location.origin}/results/${qID}`; }
      getQuestionData(qID, getQuestionCookie(), (res) => renderQuestion(res[0], 'This question doesn\'t exist.'));
      break;
    }
    case '/results/list': {
      getQuestionData(undefined, undefined, (res) => renderQuestionResults(res));
      break;
    }
    case (page.match(/\/results\/\d+/) || {}).input: {
      const parts = page.split('/');
      const qID = (parts.length > 2) ? parts[2] : undefined;
      getQuestionData(qID, undefined, (res) => renderQuestionResults(res, 'This question doesn\'t exist.'));
      break;
    }
    default:
      break;
  };


  /** UI ACTIONS **/

  /** Add answer **/
  $('.add-answer').on('click', () => {
    addAnswer($('.answers'));
  });


  // TODO: create a remove-answer function too


  /** Submit question **/
  $('button.create-question').click(() => {
    if ($('.create-question').data('question-created') !== true) {
      const question = $('.question :input').val();
      const answers = [];
      $('.answers :input').map((i, element) => answers.push($(element).val()));
      if (question && answers.length > 0) { submitQuestion(question, answers); };
    };
  });


  /** Submit Answer **/
  // eslint-disable-next-line prefer-arrow-callback
  $(document).on('click', '.answer-button', function () {
    const aID = $('input[name=answer]:checked').data('answer-id');
    const qID = $('input[name=answer]:checked').data('question-id');
    const answerData = {
      qid: qID,
      aid: aID,
    };
    // Only allow submission if question hasn't been answered
    const answeredQuestions = getQuestionCookie();
    if (!answeredQuestions.includes(qID) && typeof aID !== 'undefined') {
      submitAnswer(answerData);
    } else if (answeredQuestions.includes(qID)) {
      window.location = `${window.location.origin}/results/${qID}`;
    }
  });


  /** Auto-clipboard **/
  $(document).on('click', '#copy-button', copyQuestionURL);


  /** View question results **/
  $(document).on('click', '#view-result', function () {
    const qID = $(this).data('question-id');
    window.open(`${window.location.origin}/results/${qID}`, '_blank');
  });


  /** END UI ACTIONS **/
});
