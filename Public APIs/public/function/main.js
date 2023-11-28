$(document).ready(function() {

    // 点击链接后内容按照顶部偏移滚动
    $('body').on('click', 'a[href^="#"]', function(event) {
        event.preventDefault();

        var offset = 102; 
        var target = this.hash;
        if ($(target).offset()) { //检查$(target).offset()是否为undefined，如果不是则滚动页面
            $('html, body').animate({
                scrollTop: $(target).offset().top - offset
            }, 100);
        }
    });

    // 侧边栏active内容不在窗口时侧边栏跟随主内容滚动
    window.addEventListener('scroll', function() {
        var element = document.getElementsByClassName('active')[0];
        if (!isInViewport(element)) {
            element.scrollIntoView({behavior:"smooth",block:"center"});
        } 
        this.setTimeout(function(){
            if (!isInViewport(element)) {
                element.scrollIntoView({behavior:"smooth",block:"center"});
            } 
        },200)//设置0.2s后再检查一次，以免没滑动到位
    });
    
    // 侧边栏滚动时主内容不跟随滚动
    var sidebar = document.querySelector('.scrollarea'); // 侧边导航栏的元素
    sidebar.addEventListener('scroll', function(event) {
        event.preventDefault();
    });

    // 检测元素是否在窗口的函数
    function isInViewport(element) {
        var rect = element.getBoundingClientRect();
        return (
            rect.top >= 100 &&
            rect.bottom <= (window.innerHeight-100 || document.documentElement.clientHeight-300)
        );
    }

    /* 搜索和过滤功能 start */
    var filterResult = $('.searchable-container .api-list-item');
    var searchResult = $('.searchable-container .api-list-item');

    //搜索
    $('#search-input').on('keyup', function() {
        //正则表达式
        var rex = new RegExp($(this).val(), 'i');
        //过滤
        searchResult = $('.searchable-container .api-list-item').filter(function(){
            return rex.test($(this).text());
        })
        updateDisplay();
        updateCategory();
    });

    //过滤

    $("input[type = 'checkbox']").on('click',showFilter); //注意回调函数不加括号，否则只会在一开始调用而不是每次点击

    //点击dropdown-menu里的内容时阻止menu关闭
    $('.dropdown-menu').on('click', function(event) {
        event.stopPropagation();
    });

    //设置filter重置按钮
    $('.filter-reset').on('click',function(){
        $("input[type = 'checkbox']").each(function(){
            $(this).prop('checked', false);
        })
        showFilter();
    })

    //filter主要功能
    function showFilter(){
        //重置
        var checkedAuth = [];var checkedHTTPS = [];var checkedCors = [];
        //检查checkbox
        $("input[name='Auth']:checked").each(function(){checkedAuth.push($(this).attr('id'));})
        $("input[name='HTTPS']:checked").each(function(){ checkedHTTPS.push($(this).attr('id'));})
        $("input[name='Cors']:checked").each(function(){checkedCors.push($(this).attr('id'));})
        //空的就全集
        if(checkedAuth.length == 0){checkedAuth = ["Auth-no","Auth-apiKey","Auth-OAuth","Auth-X-Mashape-Key","Auth-User-Agent"];}
        if(checkedHTTPS.length == 0){checkedHTTPS = ["HTTPS-no","HTTPS-yes"];}
        if(checkedCors.length == 0){checkedCors = ["Cors-no","Cors-yes","Cors-unknown"];}
        //过滤
        filterResult = $('.searchable-container .api-list-item').filter(function(){
            var auth = $(this).children().eq(2).children().attr('class').split(' ')[1];
            var https = $(this).children().eq(3).children().attr('class').split(' ')[1];
            var cors = $(this).children().eq(4).children().attr('class').split(' ')[1];//获取每个tr.api-list-item的第3-5个子元素的子元素的第二个class
            return $.inArray(auth, checkedAuth) !== -1 &&  $.inArray(https, checkedHTTPS) !== -1 && $.inArray(cors, checkedCors) !== -1;
        })
        //更新
        updateDisplay();
        updateCategory();
    }
    //过滤end

    //更新显示
    function updateDisplay(){
        $('.searchable-container .api-list-item').hide();
        searchResult.filter(function() {
            return $.inArray(this, filterResult) !== -1;
        }).show();
    }
    
    function updateCategory() {
        //遍历所有category，把tbody里api-list-item类tr全隐藏的category隐藏，并让sidebar里没有的category变浅
        $('.category').each(function(){
            var flag = 0;
            let id = $(this).attr('id');
            $(this).find('tbody .api-list-item').each(function(){
                if($(this).css('display') !== 'none'){
                    flag = 1;
                }
            })
            if (flag == 0){
                $(this).hide();
                $("a[href='#"+id +"']").addClass("no-category");
            }else{
                $(this).show();
                $("a[href='#"+id +"']").removeClass("no-category")
            }
        }); 
    }
    /* 搜索过滤 end */ 

    //键盘快捷键
    $(document).on('keydown', function(event) {
        if (event.ctrlKey && event.key === '/') { // 当按下Ctrl+/键时
            $('#search-input').focus(); // 焦点到搜索框
        }
        if (event.key === 'Escape'){ // 当按下Esc键时
            document.activeElement.blur(); // 取消当前活动元素的焦点
        }
    });


    /*检查输入框是否有东西 */
    // 获取输入框
    var input = $('input.ds-input');

    // 检查输入框的内容
    function checkInput() {
        if(input.val() === '') {
            // 如果输入框为空，添加 'empty' 类
            input.addClass('empty');
        } else {
            // 如果输入框不为空，移除 'empty' 类
            input.removeClass('empty');
        }
    }

    // 监听输入事件(input有变化的时候就调用chekinput)
    input.on('input', checkInput);

    // 初始检查
    checkInput();

    /*检查输入框是否有东西 end*/

    //清除输入框
    $('.search-delete').on('click', function(){
        $('input.ds-input').val('');
        searchResult = $('.searchable-container .api-list-item');
        updateCategory()
        checkInput();
    })

});

