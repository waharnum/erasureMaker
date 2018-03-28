FROM node:8
EXPOSE 8081
COPY . /erasuremaker/
WORKDIR /erasuremaker
VOLUME /erasuremaker/storage
RUN npm install
# Expected to come from erasureMaker_env.ini
ENV MAILGUN_API_KEY=$MAILGUN_API_KEY MAILGUN_DOMAIN=$MAILGUN_DOMAIN
CMD mkdir -p storage/erasures && mkdir -p storage/indexes && npm start
