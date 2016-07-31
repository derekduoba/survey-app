FROM node
MAINTAINER Derek Duoba <derekduoba@gmail.com>

RUN mkdir -p /var/www/survey-app
WORKDIR /var/www/survey-app

COPY lib /var/www/survey-app/lib
COPY models /var/www/survey-app/models
COPY public /var/www/survey-app/public
COPY routes /var/www/survey-app/routes
COPY views /var/www/survey-app/views
COPY app.js /var/www/survey-app/
COPY package.json /var/www/survey-app/

RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]
