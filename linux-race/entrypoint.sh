#!/bin/bash

# Start Leaderboard server (TCP) in background
python3 /root/leaderboard.py &

# Start Web Leaderboard server (HTTP) in background
python3 /root/web_leaderboard.py &

# Get current container ID to share volumes (leaderboard)
CONTAINER_ID=$(hostname)

# Start Game Server on port 9999
# Spawns a NEW container for each connection using the host docker socket
# --rm: delete container after exit
# --volumes-from: share the leaderboard file with the main container
# -u chall1: Start directly as chall1 (fixes "I am root" issue)
# -it: Interactive TTY (ensures shell prompt works)
echo "Starting Game Listener on 9999..."
socat TCP-LISTEN:9999,fork,reuseaddr EXEC:"docker run --rm -it --volumes-from $CONTAINER_ID -u chall1 linux-race /bin/bash",pty,stderr,setsid,sigint,sane &

# Wait for any process to exit
wait
