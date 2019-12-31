# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM tiangolo/node-frontend:10 as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

ARG NODE_ENV=production

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15

EXPOSE 80

COPY --from=build-stage /app/dist/ /usr/share/nginx/html

COPY /nginx.conf /etc/nginx/conf.d/default.template

COPY /run.sh /run.sh

CMD ["/run.sh"]
