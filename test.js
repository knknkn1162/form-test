'use strict';
const jade = require("jade");
const assert= require("assert");


const html = jade.renderFile("./views/posts.jade", {
  posts: [{
    id: 1,
    content: "<script>alert(\'test\');</script>",
    postedBy: 'guest1',
    trackingCookie: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
  user: 'guest1'
});

assert(html.indexOf('&lt;script&gt;alert(\'test\');&lt;/script&gt;') > 0);
console.log("テストが正常に終了しました");
