FROM alpine:3.10

RUN apk update \
    && apk add --no-cache \
        'nodejs<=10.16.2' \
        'npm<=10.16.2' \
    && npm install --global create-react-app@3.1.1 bootstrap@4.3.1

RUN mkdir -p /usr/local/passstore

WORKDIR /usr/local/passstore

#ENTRYPOINT ["tail", "-f", "/dev/null"]
ENTRYPOINT ["npm", "start"]
