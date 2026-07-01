const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const root = process.cwd();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function toSafePath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = path.normalize(path.join(root, decodedPath));

  if (!normalizedPath.startsWith(root)) {
    return null;
  }

  return normalizedPath;
}

function statFile(filePath) {
  return fs.promises.stat(filePath).catch(() => null);
}

async function resolveRequestPath(requestPath) {
  const safePath = toSafePath(requestPath);
  if (!safePath) {
    return null;
  }

  const candidates = [];

  if (requestPath === "/" || requestPath === "/index.html") {
    candidates.push(path.join(root, "index.html"));
  } else {
    candidates.push(safePath);

    if (path.extname(safePath) === "") {
      candidates.push(path.join(safePath, "index.html"));
      candidates.push(`${safePath}.html`);
    } else if (requestPath.endsWith("/")) {
      candidates.push(path.join(safePath, "index.html"));
    }
  }

  for (const candidate of candidates) {
    const stats = await statFile(candidate);
    if (stats && stats.isFile()) {
      return candidate;
    }
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const filePath = await resolveRequestPath(url.pathname);

    if (!filePath) {
      send(res, 404, "Not Found", {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      contentTypes[extension] || "application/octet-stream";

    const data = await fs.promises.readFile(filePath);
    send(res, 200, data, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
    });
  } catch (error) {
    send(res, 500, "Server Error", {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    });
  }
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}/`);
});
