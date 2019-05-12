FROM node:12
MAINTAINER Claude-André Alves (claude-andre.inacioalves@heig-vd.ch)

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/musician.js"]