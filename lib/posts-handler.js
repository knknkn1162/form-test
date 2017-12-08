//import { decode } from "punycode";

'use strict';
const jade = require("jade");
const Post = require("./post");
const Cookies = require("cookies");

const trackingIdKey = "tracking_id";


function handle(req, res) {
  const cookies = new Cookies(req, res);
  addTrackingCookie(cookies);
  switch (req.method) {
    case "GET":
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      Post.findAll({order: "id DESC"}).then((posts) => {
        posts.forEach((post) => {post.content=post.content.replace(/\n/g, "<br>");});
        res.end(jade.renderFile("./views/posts.jade", {
          posts: posts,
          user: req.user,
        }));
      console.info(
        `観覧されました: user: ${req.user},` +
        `trackingId: ${cookies.get(trackingIdKey) },` + 
        `remoteAddress: ${req.connection.remoteAddress}`
      );
      });
      break;
    case "POST":
      let body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      }).on("end", () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const content = decoded.split("content=")[1];
        console.info("投稿されました: " + content);
        Post.create({
          content: content,
          trackingCookie: cookies.get(trackingIdKey),
          postedBy: req.user
        }).then(() => {
          handleRedirectPosts(req, res);
        });
      });
      break;
    case "PUT":
      res.writeHead(400, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end("未対応のメソッド");
      break;
    default:
      break;
  }
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      let body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      }).on("end", () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const id = decoded.split("id=")[1];
        Post.findById(id).then((post) => {
          // サーバー側でも本人かどうか確認する
          if (req.user === post.postedBy || req.user === "admin") {
            post.destroy();
          }
          handleRedirectPosts(req, res);
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function addTrackingCookie(cookies) {
  if (!cookies.get(trackingIdKey)) {
    const trackingId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    const tomorrow = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));
    // name, value, option
    cookies.set(trackingIdKey, trackingId, {expires: tomorrow});
  }
}


function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    "Location": "/posts"
  });
  res.end();
}


module.exports = {
  handleDelete: handleDelete,
  handle: handle
};