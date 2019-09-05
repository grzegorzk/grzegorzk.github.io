FROM alpine:3.10

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.10/main' >> /etc/apk/repositories

RUN apk update \
    && apk add --no-cache \
        'nodejs<10.17' \
        'npm<10.17' \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global create-react-app@3.1.1 bootstrap@4.3.1

RUN mkdir -p /usr/local/react-app

COPY docker-files/entrypoint.sh /
WORKDIR /usr/local/react-app

#ENTRYPOINT ["tail", "-f", "/dev/null"]
ENTRYPOINT ["/entrypoint.sh"]
