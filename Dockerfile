FROM node:14

WORKDIR /usr/app

COPY package*.json ./
RUN npm install --quiet

COPY . .

CMD node app.js