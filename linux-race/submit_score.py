#!/usr/bin/env python3
import sys
import datetime
import os

LEADERBOARD_FILE = '/var/race/leaderboard.txt'

def main():
    print("------------------------------------------------")
    print("CONGRATULATIONS! You have finished the race.")
    print("------------------------------------------------")
    try:
        # Flush stdout to ensure prompt appears immediately over netcat
        sys.stdout.flush()
        nickname = input("Enter your nickname for the leaderboard: ").strip()
    except EOFError:
        return

    if nickname:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"{now} - {nickname}\n"
        
        try:
            with open(LEADERBOARD_FILE, "a") as f:
                f.write(entry)
            print("Success! You are on the board.")
            print("Ask your friends to check: nc <server-ip> 1337")
        except PermissionError:
            print("Error: Permission denied. This script must be run via the wrapper.")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("No nickname entered.")

if __name__ == "__main__":
    main()
