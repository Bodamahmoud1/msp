import socket
import threading

HOST = '0.0.0.0'
PORT = 1337
LEADERBOARD_FILE = '/var/race/leaderboard.txt'

def handle_client(conn, addr):
    try:
        with open(LEADERBOARD_FILE, 'r') as f:
            data = f.read()
            if not data:
                data = "No winners yet!\n"
            conn.sendall(data.encode())
    except FileNotFoundError:
        conn.sendall(b"No leaderboard file found.\n")
    except Exception as e:
        conn.sendall(f"Error: {e}\n".encode())
    finally:
        conn.close()

def main():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(5)
    print(f"Leaderboard running on {HOST}:{PORT}")

    while True:
        conn, addr = s.accept()
        t = threading.Thread(target=handle_client, args=(conn, addr))
        t.start()

if __name__ == '__main__':
    main()
