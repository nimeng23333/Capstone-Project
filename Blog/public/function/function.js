// 按键监听
const editBtn = document.getElementById('edit-toggler');

editBtn.addEventListener("click" , function(){
    for (const i of document.getElementsByClassName("edit-tool")){
        i.classList.toggle("invisible");
    };
}); 

