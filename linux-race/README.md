# Linux Essentials Challenge

A Docker-based interactive race to teach Linux command line basics.

## Challenges
1. **Navigation**: Navigate through a deep directory maze.
2. **Grep**: Find a specific string inside a massive file.
3. **Permissions**: Unlock a file by changing its read permissions.
4. **Hidden Directories**: Find a flag hidden in a dot-directory.
5. **Absolute Paths**: Locate a file outside your home directory (in `/tmp`).
6. **User Switching**: Switch to a specific user (`ghost`) using a password.
7. **File Analysis**: Identify the only non-empty file among many empty ones.
8. **Finish**: Submit your score to the leaderboard.

## How to Run

1. Build the image:
   ```bash
   docker build -t linux-race .
   ```

2. Run the container (Must mount docker socket):
   ```bash
   docker run -d \
     -p 9999:9999 \
     -p 1337:1337 \
     -p 8888:8888 \
     -v /var/run/docker.sock:/var/run/docker.sock \
     --name race-instance \
     linux-race
   ```

3. Connect to the game:
   
   ```bash
   nc localhost 9999
   ```
   *This spawns a fresh container instance for you.*

4. Check Leaderboard:
   *   **Netcat:** `nc localhost 1337`
   *   **Web:** Open `http://localhost:8888` in your browser.
