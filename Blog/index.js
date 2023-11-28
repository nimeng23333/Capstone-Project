import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
const posts = [];

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const articleNum = 1354;

/* 设置中间件 */
app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let isEditVisible = false;

/* 设置根路由 */
app.get("/", (req, res) => {
  let renderPost = posts.slice(0,10);
  res.render("index.ejs", {isEditVisible, total : posts.length , postdata : renderPost});
  
});

/* 设置新增文章路由 */
app.get("/newpost", (req, res) => {
  res.render("post.ejs");
});

/* 设置新增文章确认路由 */
app.post("/submit", (req, res) => {
  var date = new Date();
  var newMonth = months[date.getMonth()];
  var newDay = date.getDate();
  var newYear = date.getFullYear();
  let newId = posts[0].id+1;
  let newPost = new Post(newId,req.body.title,req.body.auther,req.body.text,newYear,newMonth,newDay);
  posts.splice(0,0,newPost);
  res.redirect("/");
});

/* 设置编辑文章确认路由 */
app.post("/editsubmit", (req, res) => {
  var j = 0;
  let editpost = new Post(req.body.id,req.body.title,req.body.auther,req.body.text);
  posts.forEach((e) => {
      j = j + 1;
      if (e.id == req.body.id) {
        posts.splice(j - 1, 1,editpost);
      }
  });
  res.redirect("/");
});

/* 设置删除文章路由 */
app.post("/delete", (req, res) => {
  var j = 0;
  posts.forEach((e) => {
      j = j + 1;
      if (e.id == req.body.id) {
        posts.splice(j - 1, 1);
      }
  });
  isEditVisible = true;
  res.redirect("/");
});

/* 设置文章详情路由 */
app.get('/article/:postId', (req, res) => {
  const postId = req.params.postId;
  var j = 0;
  posts.forEach((e) => {
      j = j + 1;
      if (postId == e.id) {
        const nextPosts = posts.slice(j,j+4);
        res.render('article.ejs', { post : e , nextPosts : nextPosts});
      }
  });
});

/* 设置文章编辑路由 */
app.get('/edit/:postId', (req, res) => {
  const postId = req.params.postId;
  var j = 0;
  posts.forEach((e) => {
      j = j + 1;
      if (postId == e.id) {
        res.render('post.ejs', { post : e });
      }
  });
});

app.get('/:pageId', (req, res) => {
  const pageId = req.params.pageId;
  let renderPost = posts.slice((pageId-1)*10,pageId*10);
  res.render("index.ejs", {total : posts.length , postdata : renderPost , pageId : pageId});
});

/* 设置监听*/
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


/* 文章内容*/

function Post(id,title,auther,text,year,month,day){
  this.id = id;
  this.title = title;
  this.auther = auther;
  this.text = text;
  this.year = year;
  this.month = month;
  this.day = day;
}

var titles = [
"Nearly 200 Great Barrier Reef coral species also live in the deep sea", 
"East Antarctica's glaciers are stirring",
"Sterling could jump 8% if Brexit deal gets approved by UK Parliament",
"Nasa's IceSat space laser makes height maps of Earth",
"Underwater museum brings hope to Lake Titicaca",
"Sun-skimming probe starts calling home",
"Did Supernovae Kill Off Large Ocean Animals?",
];

var authors = [
"Jake Bittle",
"Michael Miller",
"Robert Johnson",
"John Doe",
];

var texts = [
"Holy grail funding non-disclosure agreement advisor ramen bootstrapping ecosystem. Beta crowdfunding iteration assets business plan paradigm shift stealth mass market seed money rockstar niche market marketing buzz market.",
"Burn rate release facebook termsheet equity technology. Interaction design rockstar network effects handshake creative startup direct mailing. Technology influencer direct mailing deployment return on investment seed round.",
"Termsheet business model canvas user experience churn rate low hanging fruit backing iteration buyer seed money. Virality release launch party channels validation learning curve paradigm shift hypotheses conversion. Stealth leverage freemium venture startup business-to-business accelerator market.",
"Freemium non-disclosure agreement lean startup bootstrapping holy grail ramen MVP iteration accelerator. Strategy market ramen leverage paradigm shift seed round entrepreneur crowdfunding social proof angel investor partner network virality.",
"There are more coral species lurking in the deep ocean that previously thought.",
"Nasa says it has detected the first signs of significant melting in a swathe of glaciers in East Antarctica.",
];

var years = [
  "2023",
  "2022",
  "2021",
  "2020",
  ];

for (var i = 0; i < articleNum; i++) {
  let newId = i;
  let newTitle = titles[Math.floor(Math.random() * titles.length)];
  let newAuthor = authors[Math.floor(Math.random() * authors.length)];
  let newText = texts[Math.floor(Math.random() * texts.length)];
  let newYear = Math.floor(Math.random() * 23)+2000;
  let newMonth = months[Math.floor(Math.random() * 12)];
  let newDay = Math.floor(Math.random() * 30) + 1;
  let newPost = new Post(newId, newTitle, newAuthor, newText, newYear, newMonth, newDay);
  posts.push(newPost);
}
posts.reverse();



