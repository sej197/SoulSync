#  official Node image
FROM node:18

#  app directory
WORKDIR /app

# package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy rest of project
COPY . .

# expose backend port
EXPOSE 5000

# start server
CMD ["npm", "start"]
