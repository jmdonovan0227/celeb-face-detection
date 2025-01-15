# executable docker image
# node version we want to use (tells docker to use node image from dockerhub => parent image)
# you can also the specific node version like => 23.4.0 for example
FROM node:20.18.1
# this is the directory we want to work out of
WORKDIR /usr/src/celeb-face-detection/backend
# first = './' copy everything from root directory, second = './' we want to put it in our working directory 
COPY ./ ./
# what commands should we run in container
# RUN is an image build step, the state of container after a RUN command will be commited to Docker image
# A docker file can execute many RUN commands to build the image we want.
# NOTE THESE COMMANDS ARE RUN AT BUILD TIME => --build
RUN npm install

# run this command for alpine build images which don't have bash out of the box
# RUN apk update && apk add bash
# array of commands we want to run after we grab node version (what to run in container)
# CMD executes by default when you launch build image. A dockerfile can only have one command usually
# at the end of the file.
# NOTE THESE COMMANDS ARE RUN AT RUNTIME
CMD ["/bin/bash", "-c", "npm run migrate; npm start;"]