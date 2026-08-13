import http.server
import socketserver
import urllib.request
import urllib.error
import sys
import os

PORT = 8000
DIRECTORY = "frontend"
API_BACKEND = "https://placement-portal-wuc5.onrender.com"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_PROXY(self):
        url = API_BACKEND + self.path
        req = urllib.request.Request(url, method=self.command)
        for key, value in self.headers.items():
            if key.lower() not in ['host', 'connection']:
                req.add_header(key, value)
        
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
        else:
            body = None

        try:
            with urllib.request.urlopen(req, data=body) as response:
                self.send_response(response.status)
                for key, value in response.headers.items():
                    self.send_header(key, value)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, value in e.headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def do_GET(self):
        if self.path.startswith('/api/') or self.path.startswith('/uploads/'):
            self.do_PROXY()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self.do_PROXY()
        else:
            super().do_GET()
            
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.do_PROXY()
        else:
            super().do_GET()

    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.do_PROXY()
        else:
            super().do_GET()

    def do_OPTIONS(self):
        if self.path.startswith('/api/'):
            self.do_PROXY()
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
