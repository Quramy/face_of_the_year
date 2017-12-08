#!/usr/bin/env node

const puppeteer = require("puppeteer");
const mkdirp = require("mkdirp");
const fs = require("mz/fs");
const rp = require("request-promise");
const _ = require("lodash");

const classes = ["高橋一生", "ブルゾンちえみ", "吉岡里帆", "藤井聡太", "カズオ イシグロ"];
const classPrefixes = ["issei", "chiemi", "riho", "sota", "kazuo"];
const classIndex = +process.argv[2] || 0, className = classes[classIndex], classPrefix = classPrefixes[classIndex];

const queryTemplate = (q) => `https://www.google.co.jp/search?q=${q}+顔&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi12K-LrfjXAhXFi5QKHcvwDS4Q_AUICigB&biw=2133&bih=1017`;

function wait(msec = 100) {
  return new Promise(res => setTimeout(res(), msec));
}

mkdirp.sync("data/raw_images");

async function createList() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 8000,
  });
  await page.goto(queryTemplate(className));
  await wait(200);
  const imageUrlList = await page.evaluate(() => {
    const ret = [];
    for (let node of document.querySelectorAll("a[jsname][href].rg_l")) {
      ret.push(new URL(node.href).searchParams.get("imgurl"));
    }
    return Promise.resolve(ret);
  });

  await browser.close();
  return imageUrlList;
}

async function getImage(url, prefix, idx) {
  try {
    const options = {
      url,
      encoding: null,
      resolveWithFullResponse: true,
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
      },
    };

    const res = await rp.get(options);
    const ext = res.headers["content-type"].replace(/image\//, ".");
    const buf = Buffer.from(res.body, "utf-8");
    console.log("Fetched: ", url);
    return await fs.writeFile(`data/raw_images/${prefix}_raw_${idx}${ext}`, buf);
  } catch (e) {
    console.warn(e);
  }
}

async function main() {
  console.log("prefix:", classPrefix);
  const list = await createList();
  await fs.writeFile("data/_list.json", JSON.stringify(list, null, 2), "utf-8");
  await Promise.all(list.map((url, i) => getImage(url, classPrefix, i)));
}

main();
