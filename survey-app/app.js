const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const validator = require('validator');

const dbHost = process.env.DATABASE_HOST || 'localhost';
const dbName = process.env.MYSQL_DATABASE || 'survey_app';
const dbUser = process.env.MYSQL_USER || 'surveyuser';
const dbPassword = process.env.MYSQL_PW || 'every1lovessurveys';

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: 3306,
  dialect: 'mysql',
  retry: {
    max: 100,
  },
});
const db = require('./models/model.js')(sequelize);
const dbController = require('./lib/database.js');
dbController.init(db);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator({
  customValidators: {
    isNotUndefined(value) {
      return typeof value !== 'undefined';
    },
    isArray(value) {
      return Array.isArray(value);
    },
    answersAreNotEmpty(values) {
      return values.every((value) => {
        if (validator.isNull(value)) {
          return false;
        }
        return true;
      });
    },
    answersAreNotTooLong(values) {
      return values.every((value) => (value.length <= 255));
    },
    questionIsNotTooLong(value) {
      return (value.length <= 255);
    },
    randomContainsNumbers(values) {
      if (values.length === 0) {
        return true;
      } else if (values.length === 1 && values[0] === '') {
        return true;
      }
      return values.every((value) => {
        if (validator.isInt(value)) {
          return true;
        }
        return false;
      });
    },
  },
  customSanitizers: {
    trimAnswers(values) {
      return values.map((value) => value.trim());
    },
  },
}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
require('./routes/api')(app, dbController);
require('./routes/views')(app, dbController);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  console.log('DEVELOPMENT MODE');
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.set('env', 'development');
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => {
  console.log(`Server started: http://localhost:${app.get('port')}/`);
});
