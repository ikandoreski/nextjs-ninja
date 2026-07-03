import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function getPublicRoot() {
  return resolve(process.cwd(), "public-site");
}

function readTextFile(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }

  return readFileSync(filePath, "utf8").trim();
}

function parseSitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]?.trim()).filter(Boolean);
}

async function submitIndexNow() {
  const publicRoot = getPublicRoot();
  const keyFilePath = resolve(publicRoot, "indexnow-key.txt");
  const sitemapPath = resolve(publicRoot, "sitemap.xml");

  const indexNowKey = readTextFile(keyFilePath);
  if (!indexNowKey) {
    console.log("IndexNow dilewati: file key belum tersedia atau fitur belum diaktifkan.");
    return;
  }

  const sitemapXml = readTextFile(sitemapPath);
  if (!sitemapXml) {
    throw new Error("sitemap.xml tidak ditemukan. Publish statis harus dijalankan lebih dulu.");
  }

  const urlList = parseSitemapUrls(sitemapXml);
  if (urlList.length === 0) {
    console.log("IndexNow dilewati: tidak ada URL di sitemap.");
    return;
  }

  const siteOrigin = new URL(urlList[0]).origin;
  const keyLocation = `${siteOrigin}/indexnow-key.txt`;

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: new URL(siteOrigin).host,
      key: indexNowKey,
      keyLocation,
      urlList,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal submit IndexNow. Status ${response.status}: ${errorText}`);
  }

  console.log(`IndexNow berhasil dikirim untuk ${urlList.length} URL.`);
}

submitIndexNow().catch((error) => {
  console.error(error);
  process.exit(1);
});
