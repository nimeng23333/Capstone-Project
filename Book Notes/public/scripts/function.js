(function ($) {
	'use strict';

	//  Search Form Open
	$('#searchOpen').on('click', function () {
		$('.search-wrapper').addClass('open');
		setTimeout(function () {
			$('.search-box').focus();
		}, 400);
	});
	// Search Form Close
	$('#searchClose').on('click', function () {
		$('.search-wrapper').removeClass('open');
		$('.dropdown-menu').removeClass('show');
		$('#search-query').val('');
	});

	var input = $('#search-query');

	/*检查输入框是否有东西，有就显示dropdown-menu */

	// 检查输入框的内容
	function checkInput() {
		var searchQuery = $(this).val();
		$.ajax({
			url: "/search",
			type: "POST",
			data: {input: searchQuery},
			dataType: "json",
			success: function(data) {
				if(data.length == 0){
					$('#search-result').empty();
					$('#search-result').append("<li><a class='dropdown-item' href='#'>No matching result.</a></li>");
				}else{
					$('#search-result').empty();
					for (let i=0; i<data.length ;i++){
						$('#search-result').append("<li><a class='dropdown-item' href='/post-details/" + data[i].id + "'><span class='search-title'>" + data[i].title +"</span> - <span class='extra-small fw-light'> ISBN:"+ data[i].isbn + "</span></a></li>");
					}
				}
			},
			error: function(xhr, status, error) {
			  // 请求失败的回调函数，xhr是XMLHttpRequest对象，status是状态码，error是错误信息
			  console.error(error); 
			}
		  });
		if(input.val() === '') {
			// 如果输入框为空，移除dropdown list的 'show' 类
			$('.dropdown-menu').removeClass('show');
		} else {
			// 如果输入框不为空，添加dropdown list的 'show' 类
			$('.dropdown-menu').addClass('show');
		}
	}

	// 监听输入事件(input有变化的时候就调用chekinput)
	input.on('input', checkInput);
	// input失去焦点的时候关闭dropdown
	input.on('blur', function(){$('.dropdown-menu').removeClass('show');});

	// 初始检查
	checkInput();

	/*检查输入框是否有东西 end*/

	// tab
	$('.tab-content').find('.tab-pane').each(function (idx, item) {
		var navTabs = $(this).closest('.code-tabs').find('.nav-tabs'),
			title = $(this).attr('title');
		navTabs.append('<li class="nav-item"><a class="nav-link" href="#">' + title + '</a></li>');
	});

	$('.code-tabs ul.nav-tabs').each(function () {
		$(this).find('li:first').addClass('active');
	});

	$('.code-tabs .tab-content').each(function () {
		$(this).find('div:first').addClass('active');
	});

	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var tab = $(this).parent(),
			tabIndex = tab.index(),
			tabPanel = $(this).closest('.code-tabs'),
			tabPane = tabPanel.find('.tab-pane').eq(tabIndex);
		tabPanel.find('.active').removeClass('active');
		tab.addClass('active');
		tabPane.addClass('active');
	});


	// Accordions
	$('.collapse').on('shown.bs.collapse', function () {
		$(this).parent().find('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
	}).on('hidden.bs.collapse', function () {
		$(this).parent().find('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
	});



	//easeInOutExpo Declaration
	jQuery.extend(jQuery.easing, {
		easeInOutExpo: function (x, t, b, c, d) {
			if (t === 0) {return b;}
			if (t === d) {return b + c;}
			if ((t /= d / 2) < 1) {return c / 2 * Math.pow(2, 10 * (t - 1)) + b;}
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		}
	});

	// back to top button
	$('#scrollTop').click(function (e) {
		e.preventDefault();
		$('html,body').animate({
			scrollTop: 0
		}, 1500, 'easeInOutExpo');
	});

	//article paragraphing
	function formatArticle(article, container) {
		let htmlArticle = article.split("\n").map(paragraph => `<p>${paragraph}</p>`).join("");
		$(container).innerHTML = htmlArticle;
	}


	// 新post页面添加category及tag
	$("#newCategory").on('click',() => showEdit("#newCategory"));
	$("#newCategory-close").on('click',() => hideEdit("#newCategory"));
	$("#newCategory-done").on('click',() => confirmEdit("#newCategory"));
	$("#newTag").on('click',() => showEdit("#newTag"));
	$("#newTag-close").on('click',() => hideEdit("#newTag"));
	$("#newTag-done").on('click',() => confirmEdit("#newTag"));


	function showEdit(label) {
		$(label).attr("hidden", true);
		$(label + "-input").removeAttr("hidden");
		$(label + "-input").focus();
		$(label + "-done").removeAttr("hidden");
		$(label + "-close").removeAttr("hidden");
	}
	function hideEdit(label) {
		$(label).removeAttr("hidden");
		$(label + "-input").attr("hidden", true);
		$(label + "-done").attr("hidden", true);
		$(label + "-close").attr("hidden", true);
	}
	let cacheCategoryId = 0;
	let cacheTagId = 0;

	function confirmEdit(label){
		let newInput = $(label+"-input").val()
		newInput = newInput.slice(0,1).toUpperCase() + newInput.slice(1).toLowerCase();
		if (newInput ==""){
			hideEdit(label);
		}else{
			$(label+"-input").val('');
			switch (label){
				case "#newCategory":
					$(label+"-add").before("<li class='list-inline-item-new'><input type='radio' name='category' id='category-new-" + cacheCategoryId +"' class='btn-check' required><label for='category-new-" + cacheCategoryId + "' class='btn btn-outline-primary btn-new'>"+ newInput +"</label></li>")
					cacheCategoryId ++;
				break;
				case "#newTag":
					$(label+"-add").before("<li class='list-inline-item-new'><input type='checkbox' name='tag' id='tag-new-"+ cacheTagId + "' class='btn-check'><label for='tag-new-" + cacheTagId + "' class='btn btn-outline-primary btn-new'>"+ newInput +"</label></li>")
					cacheTagId ++;
				break;
			}
			hideEdit(label);
		}
	}

	//new note 打分
	// 定义一个变量，用来存储当前的评分
	var currentRating = 0;

	// 定义一个函数，用来更新星星的颜色
	function updateStars(rating) {
	$('.stars').css("width", rating*10+"%");
	}

	// 当点击星星时，更新当前的评分，并更新星星的颜色
	$('.stars-container-add').click((event) =>{
		var x = event.clientX; //x为鼠标点击位置
		//获得星星的左右边界
		var rect = $('.stars-container-add')[0].getBoundingClientRect();
		var left = rect.left;
		var right = rect.right;
		currentRating = Math.ceil((x-left)/(right-left)*10);
		$('#rating').attr("value",currentRating);
		updateStars(currentRating);
	});

	// 当鼠标在星星上移动时，临时更新星星的颜色，以预览效果
	$('.stars-container-add').mousemove(
	function (event) {
		var x = event.clientX;
		var rect = $('.stars-container-add')[0].getBoundingClientRect();
		var left = rect.left;
		var right = rect.right;
		if (x>=left && x<=right){
			var hoverRating = Math.ceil((x-left)/(right-left)*10);
			updateStars(hoverRating);
		}
	});
	//鼠标移出更新星星颜色
	$('.stars-container-add').mouseleave(() => {
		updateStars(currentRating);
	});


	//tag筛选并高亮功能
	$("[id^='tag-']").on("click",function(){
		var ids = [];
		$("[id^='tag-']:checked").each(function() {
			// 将当前checkbox的id添加到数组中
			ids.push(this.id.slice(4));
		  });
		if(ids.length>0){
			$("span[class^='tag-']").removeClass("tag-selected");
			ids.forEach(e =>{
				$(".tag-"+e).addClass("tag-selected");
			})
			$.ajax({
				url: "/tag",
				type: "POST",
				data: {input: ids},
				dataType: "json",
				success: function(data) {
					$("article[id^='post-']").attr("hidden", true);
					data.forEach(e =>{
						$("article#post-"+e).removeAttr("hidden");
					})
				},
				error: function(xhr, status, error) {
				  console.error(error); 
				}
			});
		}else{
			$("span[class^='tag-']").removeClass("tag-selected");
			$("article[id^='post-'").removeAttr("hidden");
		}

	})

})(jQuery);