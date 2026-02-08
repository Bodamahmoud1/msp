FROM ubuntu:latest

# Install necessary packages
# Added docker.io to allow spawning sibling containers
# Added expect for the 'submit' command logic
# Added bash-completion for auto-complete and arrow key navigation
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    sudo \
    vim \
    nano \
    acl \
    coreutils \
    python3 \
    socat \
    docker.io \
    expect \
    bash-completion \
    && rm -rf /var/lib/apt/lists/*

# Copy the leaderboard submitter script
COPY submit_score.py /root/submit_score.py

# Copy the setup script
COPY setup_challenges.sh /root/setup_challenges.sh
RUN chmod +x /root/setup_challenges.sh

# Copy leaderboard script and entrypoint
COPY leaderboard.py /root/leaderboard.py
COPY web_leaderboard.py /root/web_leaderboard.py
COPY entrypoint.sh /root/entrypoint.sh
RUN chmod +x /root/entrypoint.sh

# Run the setup script to create users and challenges
RUN /root/setup_challenges.sh

# Define volume for leaderboard sharing
VOLUME /var/race

# Expose Leaderboard port and Game port
EXPOSE 1337
EXPOSE 9999
EXPOSE 8888

# Start services
CMD ["/root/entrypoint.sh"]
