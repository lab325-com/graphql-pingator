FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN npm install \
&& npm install -g pm2@latest @babel/cli @babel/node @babel/core @babel/preset-env sequelize-cli

COPY . .

RUN rm .npmrc

CMD pm2-runtime start ecosystem.config.js --only graphql-pingator
