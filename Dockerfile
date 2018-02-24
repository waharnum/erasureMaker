FROM node:8
EXPOSE 8081
COPY . /erasuremaker/
WORKDIR /erasuremaker
VOLUME /erasureMaker/storage
RUN npm install
CMD mkdir -p storage/erasures && mkdir -p storage/indexes && npm start
