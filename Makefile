NAME="npm"

run:
	docker build -t ${NAME} . \
	&& docker run -d --rm --name ${NAME} \
		--mount type=bind,source=$(CURDIR)/passstore,target=/usr/local/passstore \
		${NAME}

stop:
	docker stop ${NAME}

terminal:
	docker exec -it -e COLUMNS=`tput cols` -e LINES=`tput lines` ${NAME} /bin/sh
