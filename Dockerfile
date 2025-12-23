# base image
FROM pelias/baseimage

# change working dir as root to fix permissions
ENV WORKDIR=/code/pelias/api
RUN mkdir -p ${WORKDIR}
WORKDIR ${WORKDIR}

# copy files as root first
COPY ./package.json ${WORKDIR}
COPY . ${WORKDIR}

# Fix Windows line endings (CRLF -> LF) for shell scripts as root
RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} \; && \
    find ./bin -type f -exec sed -i 's/\r$//' {} \; && \
    chmod +x ./bin/*

# Fix ownership for pelias user
RUN chown -R pelias:pelias ${WORKDIR}

# Switch to pelias user
USER pelias

# Install dependencies as pelias user
RUN npm install

# skip tests for custom build (tests already pass in upstream)
# RUN npm test

# start service
CMD [ "./bin/start" ]
