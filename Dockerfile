
FROM node:latest
MAINTAINER David Lorenz <info@activenode.de>
LABEL Name=history_leak Version=0.9.0 
RUN mkdir -p /usr/src/app 
COPY ./ /usr/src/app/
WORKDIR /usr/src/app
RUN ls -al
RUN npm install --production
EXPOSE 3000
CMD npm start
