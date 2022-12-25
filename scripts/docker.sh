# Build the Docker image
docker build -t kiga:latest .

# Run the Docker image
docker run -it --rm kiga:latest

# Run the Docker image and start a bash shell
# docker run -it --rm myimage:latest bash

# Run the Docker image and set the MY_VAR environment variable
# docker run -it --rm -e MY_VAR=value myimage:latest bash