FROM alpine:3.10

RUN apk update \
    && apk add --no-cache \
        'nodejs<=10.16.2' \
        'npm<=10.16.2' \
    && npm install --global create-react-app@3.1.1

ENTRYPOINT ["tail", "-f", "/dev/null"]
