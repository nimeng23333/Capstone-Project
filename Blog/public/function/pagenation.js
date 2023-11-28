$(document).ready(function () {
    var total = $("#page-nav").data('total');//post条数
    var PageIndex = Number($("input[name='pagenumber']").val());//获取当前页面
    let PageSize = 10; //一页显示10条
    let pageHtml = $('.pagination'); // 分页栏
    let totalPage = Math.ceil(total / PageSize); // 获取到总页数
    function setPages() {
      let pageBtnPrev =
        "<li class='page-item btnPrev'><a href='/" + (PageIndex-1) + "' class='page-link' aria-label='Previous'><span aria-hidden='true'>«</span></a ></li>";
      let pageBtnNext =
        "<li class='page-item btnNext'><a href='/" + (PageIndex+1) + "' class='page-link' aria-label='Next'><span aria-hidden='true'>»</span></a></li>";
      pageHtml.append(pageBtnPrev); // 添加左按钮
      // 第一页
      let firstPage = $("<li class='page-item' pagenumber=1><a href='/1' class='page-link'>1</a ></li> ");
      // 最后一页
      let lastPage = $("<li class='page-item' pagenumber='" +totalPage +"'><a href='/"+ totalPage + "' class='page-link'>" +totalPage +'</a ></li>');
      // 左省略号
      let leftOmitPage = $("<li class='page-item' id='leftOmit'><a class='page-link'>...</a></li>");
      // 右省略号
      let rightOmitPage = $("<li class='page-item' id='rightOmit'><a class='page-link'>...</a></li>");
      // 左省略号图标
      let leftOmitIcon = $("<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chevron-left' viewBox='0 0 16 16'>" +"<path fill-rule='evenodd' d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/></svg>");
      // 右省略号图标
      let rightOmitIcon = $("<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-chevron-right' viewBox='0 0 16 16'>" +"<path fill-rule='evenodd' d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/></svg>");
      // 总页数小于等于10页全部显示
      if (totalPage <= 10) {
        for (let i = 1; i <= totalPage; i++) {
          pageHtml.append($("<li class='page-item' pagenumber=" + i +"><a href='/" + i + "' class='page-link'>" + i +'</a ></li> '));
        }
      } else if (PageIndex <= 8) {
        //总页数大于10且当前页远离总页数
        for (let i = 1; i <= 9; i++) {
          pageHtml.append($("<li class='page-item' pagenumber=" + i + "><a href='/" + i + "' class='page-link'>" + i + '</a ></li> '));
        }
        pageHtml.append(rightOmitPage);
        pageHtml.append(lastPage);
        //总页数大于10且当前页接近总页数
      } else if (PageIndex > totalPage - 7) {
        pageHtml.append(firstPage);
        pageHtml.append(leftOmitPage);
        for (let i = totalPage - 8; i <= totalPage; i++) {
          pageHtml.append(
            $("<li class='page-item' pagenumber=" + i + "><a href='/" + i + "' class='page-link'>" + i + '</a ></li> '));
        }
        //除开上面两个情况 当前页在中间
      } else {
        pageHtml.append(firstPage);
        pageHtml.append(leftOmitPage);
        for (let i = PageIndex - 3; i <= PageIndex + 3; i++) {
          pageHtml.append(
            $("<li class='page-item' pagenumber=" + i + "><a href='/" + i + "' class='page-link'>" + i +'</a ></li> '));
        }
        pageHtml.append(rightOmitPage);
        pageHtml.append(lastPage);
      }

      $(".pagination li[pagenumber='" + Number($("input[name='pagenumber']").val()) + "']").addClass('active');

      pageHtml.append(pageBtnNext); // 添加右按钮

      /* 第一页和最后一页左右按钮无效 */
      if (PageIndex == 1){
        $('.btnPrev').addClass('disabled');
      }
      if (PageIndex == totalPage){
        $('.btnNext').addClass('disabled');
      }

      /* 点击页码按钮进行翻页 */
      $('.pagination li[pagenumber]').on('click', function () {
        // 页数跳转
        PageIndex = Number($(this).text()); // 当前页
        $('input[name=pagenumber]').attr('value', PageIndex); // 设置当前第几页
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
        pageHtml.empty();
        setPages();
      });

      /* 点击按钮进行翻页 */
      $('.btnPrev').on('click', function () {
        // 向左翻页
        if (PageIndex > 1) {
          PageIndex--;
          pageHtml.empty();
          setPages();
        }
        $(this).addClass('disabled');
      });
      $('.btnNext').on('click', function () {
        // 向右翻页
        if (PageIndex < totalPage) {
          PageIndex++;
          pageHtml.empty();
          setPages();
        }
        $(this).addClass('disabled');
      });

      /* 点击左省略号向左翻页 */
      $('#leftOmit').click(function () {
        if (PageIndex > 10) {
          PageIndex -= 10;
          pageHtml.empty();
          setPages();
        }
      });
      /* 点击右省略号向右翻页 */
      $('#rightOmit').click(function () {
        if (PageIndex <= totalPage - 10) {
          PageIndex += 10;
          pageHtml.empty();
          setPages();
        }
      });
      /* 左省略号移入移出 */
      $('#leftOmit').mouseenter(function () {
        $(this).children().html(leftOmitIcon);
      });
      $('#leftOmit').mouseleave(function () {
        $(this).children().html('...');
      });
      /* 右省略号移入移出 */
      $('#rightOmit').mouseenter(function () {
        $(this).children().html(rightOmitIcon);
      });
      $('#rightOmit').mouseleave(function () {
        $(this).children().html('...');
      });
    }

    setPages();
  });