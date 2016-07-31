CREATE DATABASE survey_app;
CREATE USER 'surveyuser'@'localhost' IDENTIFIED BY 'every1lovessurveys';
GRANT ALL PRIVILEGES ON survey_app.* to 'surveyuser'@'localhost';
