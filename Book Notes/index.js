import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fs from "fs";
import path from "path";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const cover_API_URL = "https://covers.openlibrary.org/b/isbn/";
const cacheDir = path.resolve(__dirname,"public","cache");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const noteSQL= "SELECT notes.id,notes.isbn,notes.date_read,notes.rating,notes.intro,notes.note,notes.auther,notes.title, category, notes.category_id FROM notes JOIN categories ON categories.id = notes.category_id";
const tagSQL= "SELECT book_tags.book_id, book_tags.tag_id, tags.tag FROM book_tags INNER JOIN tags ON book_tags.tag_id = tags.id";
let orderPattern = " ORDER BY id ASC";

const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    password:"1006rebecca",
    database:"booknotes",
    port:5432
});

db.connect();

let currentCategory = 0;
let sort = 1;

app.get("/",async(req,res) =>{
  const notes = await checkNotesAndTags(noteSQL,tagSQL);
  for (const note of notes){
    if(!note.img){
      note.img = await cacheImage(note.isbn)
    }
  }
  const categories = checkCategories(notes);
  const tags = await checkTags();
  res.render("index.ejs",{notes : notes, total:notes.length, categories: categories, title:"All notes", currentCategory: currentCategory, tags : tags});
});

app.get("/post-details/:id",async(req,res) =>{
  const detailNoteSQL = noteSQL+" WHERE notes.id="+req.params.id;
  const detailTagSQL = tagSQL+" WHERE book_tags.book_id="+req.params.id;
  const notes = await checkNotesAndTags(detailNoteSQL,detailTagSQL);
  notes[0].img = await cacheImage(notes[0].isbn);
  res.render("article.ejs",{notes : notes[0]});
})

app.get("/filter",async(req,res)=>{
  currentCategory = parseInt(req.query.category);
  sort = req.query.sort;
  switch (sort){
    case "1":
      orderPattern = " ORDER BY date_read DESC";
    break;
    case "2":
      orderPattern = " ORDER BY date_read ASC";
    break;
    case "3":
      orderPattern = " ORDER BY rating DESC";
    break;
    case "4":
      orderPattern = " ORDER BY rating ASC";
    break;
    case "5":
      orderPattern = " ORDER BY title ASC";
    break;
    case "6":
      orderPattern = " ORDER BY title DESC";
    break;
  }
  const allNotes = await checkNotesAndTags(noteSQL+orderPattern,tagSQL);
  const categories = checkCategories(allNotes);
  let notes, title;
  if (currentCategory == 0){
    notes = allNotes
    title = "All notes";
  }else{
    const categoryNoteSQL = noteSQL + ` WHERE category_id = ${currentCategory}`;
    notes = await checkNotesAndTags(categoryNoteSQL+orderPattern,tagSQL);
    title = notes[0].category;
  }
  for (const note of notes){
    if(!note.img){
      note.img = await cacheImage(note.isbn)
    }
  }
  const tags = await checkTags();
  res.render("index.ejs",{notes : notes, total:allNotes.length, categories: categories, title: title, currentCategory: currentCategory, tags : tags});
})

app.get("/new", async(req,res) =>{
  const notes = await checkNotesAndTags(noteSQL+" ORDER BY category ASC",tagSQL);
  const categories = checkCategories(notes);
  const result = await db.query("SELECT * FROM tags ORDER BY tag ASC");
  let tags = [];
  result.rows.forEach((tag) =>{
    tags.push(tag);
  })
  res.render("newnotes.ejs",{categories : categories, tags : tags});
})

app.post("/new",async(req,res) =>{
  const title = req.body.bookname;
  const isbn = req.body.ISBN;
  const auther = req.body.auther;
  const date = req.body.date;
  const category = req.body.category.toLowerCase();
  const tags = req.body.tag;
  const rating = req.body.rating;
  const intro = req.body.intro;
  const note = req.body.note;
  const categoryResult = await db.query("INSERT INTO categories (category) VALUES ($1) ON CONFLICT (category) DO UPDATE SET category = EXCLUDED.category RETURNING id;",[category]);
  const categoryId = categoryResult.rows[0].id;
  const bookResult = await db.query("INSERT INTO notes (title, isbn, auther, date_read, rating, intro, note, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",[title,isbn,auther,date,rating,intro,note,categoryId])
  const bookId = bookResult.rows[0].id;

  if (!Array.isArray(tags)){
    const tagResult = await db.query("INSERT INTO tags (tag) VALUES ($1) ON CONFLICT (tag) DO UPDATE SET tag = EXCLUDED.tag RETURNING id;",[tags]);
    const tagId = tagResult.rows[0].id;
    await db.query("INSERT INTO book_tags (tag_id, book_id) VALUES ($1, $2)",[tagId,bookId]);
  }else{
    for (let tag in tags){
      const tagResult = await db.query("INSERT INTO tags (tag) VALUES ($1) ON CONFLICT (tag) DO UPDATE SET tag = EXCLUDED.tag RETURNING id;",[tag]);
      const tagId = tagResult.rows[0].id;
      await db.query("INSERT INTO book_tags (tag_id, book_id) VALUES ($1, $2)",[tagId,bookId]);
    }
  }
  res.redirect("/");
})

app.use(bodyParser.json());

app.post('/search', async function(req, res) {
  var input = req.body.input;
  const result = await db.query("SELECT title,isbn,id FROM notes WHERE LOWER (title) LIKE '%' || $1 || '%' OR isbn LIKE '%' || $1 || '%' ORDER BY title ASC",[input])
  let data = [];
  result.rows.forEach((e) =>{
    data.push(e);
  });
  res.json(data);
});

app.post('/tag', async function(req,res){
  var input = req.body.input;
  let data = [];
  for (let i=0; i<input.length;i++){
    const result = await db.query("SELECT book_id FROM book_tags WHERE tag_id = $1", [input[i]]);
    if(!data.includes(result.rows[0].book_id)){
      data.push(result.rows[0].book_id)
    }
  }
  res.json(data);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});  

async function checkNotesAndTags(noteSQL,tagSQL) {
  const result = await db.query(noteSQL);
  const tags = await db.query(tagSQL);
  let notes = [];
  result.rows.forEach((note) => {
    notes.push(note);
  });
  tags.rows.forEach((tag)=> {
    const foundNote = notes.find((note) => note.id == tag.book_id);
    if (typeof foundNote !== "undefined") {
      if (!foundNote.tags) {  // 如果tags属性不存在
        foundNote.tags = [];  // 创建一个新的数组
      }
      foundNote.tags.push({tagName:tag.tag, tagId: tag.tag_id});  // 就把tag添加到note的tags数组中
    }
  })
  return notes;
} 

async function cacheImage(isbn) {
  try {
    const isbnPath = isbn+".jpg"
    const filePath = path.join(cacheDir, isbnPath);
    const ejsPath = "/cache/"+isbnPath;
    // 判断图片是否已经存在于缓存目录中
    if (fs.existsSync(filePath)) {
      return ejsPath;
    } else {
      // 如果不存在，从网站下载图片
      const url = cover_API_URL + isbn + "-M.jpg";
      const response = await axios.get(url, { responseType: "stream" });
      // 检查响应状态码和内容类型
      if (response.status !== 200 || !response.headers['content-type'].startsWith('image/')) {
        // 如果不是有效的图片，直接返回空值，或者抛出一个自定义的异常
        return null;
      }
      // 创建一个可写流，用来保存图片
      const writer = fs.createWriteStream(filePath);
      // 将图片的响应流写入到本地文件中
      response.data.pipe(writer);
      // 等待图片写入完成
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      // 返回图片的本地路径
      return ejsPath;
    }
  } catch (error) {
    // 处理异常，可以打印错误信息，返回空值，或者重新抛出异常
    console.error(error);
    return null;
  }
}

/*
async function checkBookInfo(isbn){
  const response = await axios.get(bookInfo_API_URL+isbn+".json")
  return response
}   没代理没法连接这个api*/

function checkCategories(data) {
  let categorizedData = {};
  for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let category = item.category;
      if (!(category in categorizedData)) {
          categorizedData[category] = [];
      }
      categorizedData[category].push(item);
  }
  var keys = Object.keys(categorizedData);
  let categories = [];
  for (var i = 0; i<keys.length ; i++){
    categories.push({
      categoryId : categorizedData[keys[i]][0].category_id,
      name : keys[i],
      length: categorizedData[keys[i]].length
    })
  }
  categories.sort(compareByName); //将categories按照name属性名排序
  return categories;
}

async function checkTags(){
  const tagResult = await db.query(tagSQL);
  let tags = [];
  for(let i=0; i<tagResult.rows.length;i++){
    if (!(tags.find((tag) => tag.name == tagResult.rows[i].tag))){
      tags.push({name:tagResult.rows[i].tag,id:tagResult.rows[i].tag_id});
    }
  }
  tags.sort(compareByName); //从a到z排序
  return tags;
}

//定义一个函数，比较两个js对象的name属性在字典排序先后
function compareByName(a, b) {
  // 获取 a 和 b 的 name 属性的值，分别赋值给变量 nameA 和 nameB
  var nameA = a.name;
  var nameB = b.name;
  // 使用 nameA 和 nameB 的 localeCompare 方法，来比较两个字符串的字典顺序
  // 返回比较的结果，作为比较函数的返回值
  return nameA.localeCompare(nameB);
}

