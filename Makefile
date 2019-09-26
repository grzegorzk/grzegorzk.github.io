NAME="npm"

run:
	docker build -t ${NAME} . \
	&& docker run -d --rm --name ${NAME} \
		--mount type=bind,source=$(CURDIR)/react-app,target=/usr/local/react-app \
		-p 3000:3000 \
		${NAME}

build:
	docker exec -it ${NAME} /bin/sh -c "npm run build"

deploy:
	make stop && \
	make run && \
	make build && \
	make stop && \
	cp -r react-app/build new_build && \
	git stash && \
	git checkout master && \
	git rm -r -f -q --ignore-unmatch * && \
	git commit -m "Replacing react build - step 1 (`date`)" && \
	mv new_build/* . && \
	rm -r new_build && \
	git add * && \
	# We expect `react-app` directory to survive `git checkout master` && \
	git restore --staged react-app && \
	git commit -m "Replacing react build - step 2 (`date`)" && \
	git push && \
	git checkout dev && \
	git stash pop

stop:
	docker stop ${NAME}

terminal:
	docker exec -it -e COLUMNS=`tput cols` -e LINES=`tput lines` ${NAME} /bin/sh
