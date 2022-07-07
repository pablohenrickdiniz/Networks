FROM node:17.9 as core
COPY Networks /app/Networks
COPY examples /app/examples
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
ENTRYPOINT [ "/app/run.sh" ]

FROM core as perlin
RUN echo "#!/bin/sh\nnode /app/examples/perlin-noise/train.js" > /app/run.sh
RUN chmod +x /app/run.sh

FROM core as server
COPY server.js /app/server.js
RUN echo "#!/bin/sh\nnode /app/server.js" > /app/run.sh
RUN chmod +x /app/run.sh