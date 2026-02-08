import http.server
import socketserver

PORT = 8888
LEADERBOARD_FILE = '/var/race/leaderboard.txt'

class LeaderboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        html_head = """
        <html>
        <head>
            <title>MSP Linux Race Leaderboard</title>
            <meta http-equiv="refresh" content="5">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
                body { 
                    font-family: 'VT323', monospace; 
                    background-color: #000000; 
                    color: #00ff00; 
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-image: radial-gradient(circle, #001100 0%, #000000 100%);
                }
                .container {
                    width: 600px;
                    border: 2px solid #00ff00;
                    padding: 40px;
                    box-shadow: 0 0 20px #00ff00, inset 0 0 20px #00ff00;
                    background-color: rgba(0, 0, 0, 0.8);
                    text-align: center;
                }
                h1 { 
                    font-size: 3em;
                    margin-top: 0;
                    text-shadow: 0 0 10px #00ff00;
                    border-bottom: 2px solid #00ff00;
                    padding-bottom: 10px;
                }
                .entry {
                    font-size: 2.5em;
                    margin: 15px 0;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #004400;
                    padding: 5px 0;
                }
                .rank { color: #ff00ff; text-shadow: 0 0 5px #ff00ff; }
                .name { color: #00ffff; text-shadow: 0 0 5px #00ffff; }
                .empty { color: #555; font-style: italic; font-size: 1.5em; }
                .glitch { animation: glitch 1s linear infinite; }
                @keyframes glitch {
                    2%, 64% { transform: translate(2px,0) skew(0deg); }
                    4%, 60% { transform: translate(-2px,0) skew(0deg); }
                    62% { transform: translate(0,0) skew(5deg); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="glitch">/// SYSTEM LEADERBOARD ///</h1>
                <div id="list">
        """
        
        html_body = ""
        
        try:
            with open(LEADERBOARD_FILE, 'r') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]
                
            if not lines:
                html_body = '<div class="entry empty">No hackers detected yet...</div>'
            else:
                for i, line in enumerate(lines):
                    # Parse "YYYY-MM-DD HH:MM:SS - nickname"
                    parts = line.split(' - ', 1)
                    nickname = parts[1] if len(parts) > 1 else line
                    
                    rank = i + 1
                    suffix = "th"
                    if 11 <= (rank % 100) <= 13:
                        suffix = "th"
                    else:
                        rem = rank % 10
                        if rem == 1: suffix = "st"
                        elif rem == 2: suffix = "nd"
                        elif rem == 3: suffix = "rd"
                    
                    rank_str = f"{rank}{suffix}"
                    
                    html_body += f"""
                    <div class="entry">
                        <span class="rank">{rank_str}</span>
                        <span class="name">{nickname}</span>
                    </div>
                    """
        except FileNotFoundError:
            html_body = '<div class="entry empty">System Error: Database Missing</div>'
            
        html_footer = """
                </div>
            </div>
        </body>
        </html>
        """
        
        self.wfile.write((html_head + html_body + html_footer).encode())

with socketserver.TCPServer(("", PORT), LeaderboardHandler) as httpd:
    print(f"Serving leaderboard at port {PORT}")
    httpd.serve_forever()
