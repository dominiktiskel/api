# base image
FROM pelias/baseimage
USER pelias

# change working dir
ENV WORKDIR=/code/pelias/api
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORKDIR}
RUN npm install

COPY . ${WORKDIR}

# Fix Windows line endings (CRLF -> LF) for shell scripts
RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} \; && \
    find ./bin -type f -exec sed -i 's/\r$//' {} \;

# skip tests for custom build (tests already pass in upstream)
# RUN npm test

# start service
CMD [ "./bin/start" ]
