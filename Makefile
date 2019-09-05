NAME="npm"

run:
	docker build -t ${NAME} . \
	&& docker run -d --rm --name ${NAME} \
		--mount type=bind,source=$(CURDIR)/react-app,target=/usr/local/react-app \
		-p 3000:3000 \
		${NAME}

build:
	docker exec -it ${NAME} /bin/sh -c "npm run build" \
	&& cp $(CURDIR)/react-app/build/index.html $(CURDIR)/index.html

stop:
	docker stop ${NAME}

terminal:
	docker exec -it -e COLUMNS=`tput cols` -e LINES=`tput lines` ${NAME} /bin/sh
