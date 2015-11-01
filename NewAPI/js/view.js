$(function () {
    var $parent = $('#divall'), $carry = $('.carrynews'),
	$removenews = $('.remove'), $removeall = $('.removeall'), $removeright = $('#removethispc');
    //新建
    $carry.on('click', function () {
        alert('确定新建文件夹？')
        setTimeout(
function () {
    $parent.append("<li><input type='text' \class='fname'\ value='新建文件夹'/></li>");
}, 500);
    });
    //清空
    $removeall.on('click', function () {
        alert('确定清空所有文件夹？')
        setTimeout(
    function () {
        $parent.empty();

    }, 500);
    }); //新文件夹不起作用！！		

    //打开文件夹
    $parent.on('click', "li[filetype='folder']", function () {

        if ($(this).attr('path')) {
            openfloder($(this).attr('path'));
        } else {
            //alert("没有可以链接的地址");
            $(".dialog__content").empty();
            $("<h2>没有可以链接的地址</h2><div><button id='dialogClose'  class='action'  >Close</button></div>").appendTo($(".dialog__content"));
            $('#dialogClose').off().click(function () {
                $(this).DialogToggle({
                    'id': 'somedialog',  //传入id，可以控制样式
                    'dialogFx': '0'     //传入显示和隐藏的参数
                });
            });
            $(this).DialogToggle({
                'id': 'somedialog',  //传入id，可以控制样式
                'dialogFx': '1'     //传入显示和隐藏的参数
            });
        }
    });
    //下载或者添加到压缩包
    $parent.on('click', "li[filetype!='folder']", function (e) {
        if ($(e.target).hasClass("add_cart")) {
            if (parseInt($(e.target).parent().attr('size'))<5) {
                addTozip(e.target);
            } else {
                alert("大于5M的文件不能压缩");
            }
        } else {
            downloadfile({ name: $(this).find("p").text(), path: $(this).attr("path"), size: $(this).attr('size') });
        }



    });
    //纯属娱乐耍耍，如需更多功能亲们自行开发...............


    $(".dialog__overlay").click(function () {
        $(this).DialogToggle({
            'id': 'somedialog',
            'dialogFx': '0'
        });
    });



});

$(".scroller").scroll(function () {
    if ($('.scroller').scrollTop() > 400) {
        $("#a_top").fadeIn(200);
    }
    else {
        $("#a_top").fadeOut(200);
    }
});
//下载文件函数
function downloadfile(file) {
    $(".dialog__content").empty();
    $(".search-close").click();
    if (file.hasOwnProperty('name') && file.hasOwnProperty('path') && file.hasOwnProperty('size')) {
        var size = file.size;
        if (size / 1000 < 0.01) {
            size = size.toFixed(2) + "B";
        } else if (size / 1000000 >= 0.01) {
            size = (size / 1000000).toFixed(2) + "M";
        } else {
            size = (size / 1000).toFixed(2) + "K";
        }
        $("<h2>点击<strong>Download</strong>下载<strong>" + file.name + "</strong>(" + size + ")</h2><div><a id='btndownload' target='_blank' class='action' href=\"api/Files/download?filepath=" + encodeURI(file.path.replace(/\+/g, "%2B").replace(/\&/g, "%26")) + "\">Download</a></div>").appendTo($(".dialog__content"));
        $(this).DialogToggle({
            'id': 'somedialog',  //传入id，可以控制样式
            'dialogFx': '1'     //传入显示和隐藏的参数
        });
    }
}

//返回上级目录
$(document).on('click', "#a_back", function () {
    var arr = $("#thisway").attr('path').replace($("#rootfolder").text(),"").split('\\').slice(1);
    var arr2 = $("#thisway").attr('path').split('\\');
    var backpath = arr2.slice(0, arr2.length - 1).join('\\') ;
    if (backpath && arr.length >0) { openfloder(backpath); } else { alert("已经是最上层目录了"); }
});

//右侧菜单按钮的事件
$("body").on('click', "#a_catalog", function () {
    $("#somedialog").removeClass().addClass("dialog");

});

$("body").on('click', "#a_search", function () {
    $("#somedialog").removeClass().addClass("dialog");
    $(".search").css("display", "");
});
$("#a_top").click(function () {
    $('.scroller').animate({ scrollTop: 0 }, 800);
    return false;
});

//添加到压缩包

function addTozip(add_a) {

    var flyElm = $(add_a).parent().clone().css('opacity', '0.7');
    flyElm.css({
        'z-index': 9000,
        'display': 'block',
        'position': 'absolute',
        'top': $(add_a).parent().offset().top + 'px',
        'left': $(add_a).parent().offset().left + 'px',
        'width': $(add_a).parent().width() + 'px',
        'height': $(add_a).parent().height() + 'px'
    });
    $('body').append(flyElm);
    flyElm.animate({
        top: $('#a_zip').offset().top,
        left: $('#a_zip').offset().left,
        width: 10,
        height: 10
    }, {
        duration: 1000, queue: false, complete: function () {
            flyElm.remove();
            var img = $(add_a).parent()[0].style.background;
            var name = $(add_a).next().text();
            var path = $(add_a).parent().attr('path');
            var status = false;
            $("#file_cart li").each(function () {
                if ($(this).attr('path') == path) {
                    status = true;
                    return false;
                }
            });
            if (!status) {
                $("<li filetype='file' style='background:" + img + "' path='" + path + "' title='" + name + "'><a class='del_a'>*</a><p class='fname'>" + name + "</p></li>").appendTo($("#file_cart"));
                var n = $("#file_cart li").length;
                $('.items').text(n);
                $('#d_c').text(n);
            }
            $("#cart_container").css("display", "block");
        }
    }
    );
};

//显示压缩包内容

$("body").on("click", "#a_zip", function () {
    $("#cart_container").fadeIn(500);
});

//隐藏压缩包内容
$("body").on("click", ".clo_x_a", function () {
    $("#cart_container").fadeOut(500);
});

//压缩包中删除一个文件

$("body").on("click", ".del_a", function () {
    $(this).parent().remove();
    var n = $("#file_cart li").length;
    $('.items').text(n);
    $('#d_c').text(n);
});
//清空压缩包
$("body").on("click", ".clear", function () {
    $("#file_cart").empty();
    $('.items').text(0);
    $('#d_c').text(0);
});
//下载压缩包
$("body").on("click", "#downloadzip_a", function () {
    var paths = "";
    if ($("#file_cart li").length == 0) {
        alert("还没有文件加入压缩包");
    } else {
        $("#file_cart li").each(function () {
            if (typeof ($(this).attr('path')) != "undefined") {
                paths += $(this).attr('path') + '|';
            }
        });
        $("#file_cart").empty();
        $('.items').text(0);
        $('#d_c').text(0);
        $(".cartloader").css('display', "block");
        $.ajax({
            url: "api/Files/downloadzip",
            type: "POST",
            data: { '': encodeURI(paths.replace(/\+/g, "%2B").replace(/\&/g, "%26")) },//这里键名称必须为空，多个参数请传对象，api端参数名必须为value
            success: function (data) {
                var getjson = eval("(" + data + ")");
                if (getjson.status != "success") {
                    alert(getjson.content);
                } else {

                    $("#ifile").attr("src", "api/Files/download?filepath=" + getjson.rootfolder + "");
                }
                $(".cartloader").css('display', "none");
            }
        });
    }
});




    //绑定打开菜单方法到#a_catalog
    new mlPushMenu(document.getElementById('mp-menu'), 'a_catalog');
    //ZTREE
    var setting = {
        async: {
            enable: true,
            url: "api/Files/getnode",
            type: "get",
            autoParam: ["filepath"],
            dataFilter: filter
        },
        data: {
            key: {
                title: "",
                name: "name"
            }
        },
        callback: {
            onClick: onClick,

        },
        view: {
            showLine: false,
            autoCancelSelected: false,
            selectedMulti: false,

        }
    };

    var zNodes = [
        {
            name: "文件夹目录",
            filepath: "",
            isParent: true
        }
    ];

    var log, className = "dark";
    function filter(treeId, parentNode, childNodes) {
        var getjson = eval("(" + childNodes + ")");
        if (getjson.status != "success") { alert(getjson.content); } else {
            return getjson.content.folders;
        }

    }

    function onClick(event, treeId, treeNode, clickFlag) {
        openfloder(treeNode.filepath);
    }


    //ready

    window.onload = function () {

        //打开根目录
        openfloder('');
        //加载树
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var FileNode = treeObj.getNodeByParam("name", "文件夹目录", null);
        treeObj.reAsyncChildNodes(FileNode, "refresh");

    }

    //查询框
    var $search = $('.search'), $input = $('.search-input'), $close = $('.search-close'), $svg = $('.search-svg'), $path = $('.search-svg__path')[0], initD = $svg.data('init'), midD = $svg.data('mid'), finalD = $svg.data('active'), backDelay = 400, midAnim = 200, bigAnim = 400, animating = false;

    $(document).on('click', '.search:not(.active)', function () {
        if (animating)
            return;
        animating = true;
        $search.addClass('active');
        Snap($path).animate({ 'path': midD }, midAnim, mina.backin, function () {
            Snap($path).animate({ 'path': finalD }, bigAnim, mina.easeinout, function () {
                $input.addClass('visible');
                $input.focus();
                $close.addClass('visible');
                animating = false;
            });
        });
    });
    $(document).on('click', '.search-close', function () {
        $search.css('display', 'none');
        if (animating)
            return;
        animating = true;
        $input.removeClass('visible');
        $close.removeClass('visible');
        $search.removeClass('active');
        setTimeout(function () {
            Snap($path).animate({ 'path': midD }, bigAnim, mina.easeinout, function () {
                Snap($path).animate({ 'path': initD }, midAnim, mina.easeinout, function () {
                    animating = false;
                });
            });
        }, backDelay);
    });
    $(document).on('keydown', '#searchText', function (event) {
        var newcontent = "";
        var searchtext = $.trim($(this).val());
        if (event.keyCode == 13 && searchtext!="") {
            var arr = searchtext.split('.');
            var searchfile = "", strhz = "";
            $(".search-close").click();
            if (arr.length > 1) {
                searchfile = arr.slice(0, arr.length - 1).join('.');
                strhz = arr.slice(-1);

            } else {
                searchfile = arr.join('');
            }
            pageload(80, 400);
            $("#mp-pusher").addClass("mp-pushed");
            $.ajax({
                url: "api/Files/searchfile?strsearch=" + encodeURI(searchfile.replace(/\+/g, "%2B").replace(/\&/g, "%26")) + "&strhz=" + encodeURI(strhz.replace(/\+/g, "%2B").replace(/\&/g, "%26")),
                type: "GET",
                success: function (data) {
                    var getjson = eval("(" + data + ")");
                    if (getjson.status != "success") {
                        alert(getjson.content);
                    } else {
                        //    $.each(getjson.content, function (i, value) {
                        //        var filetype = (value.type == "folder") ? "folder" : "file";
                        //        var addbtn = (filetype == "folder") ? "" : "<a class='add_cart'>+</a>";
                        //        newcontent += "<li filetype=" + filetype + " style='background:url(images/filetype/" + value.type + ".png) 50% 30%  no-repeat;' path=\"" + value.path + "\" title=\"" + value.name + "\"><a class='add_cart'>+</a><p  class='fname' >" + value.name + "</p>";
                        //});
                        $("#divall").empty();
                        if ((getjson.content.folders.length + getjson.content.files.length) == 0) {
                            $("#thisway").text("没有找到您要查找的文件！");
                        } else {
                            $("#thisway").text("共查找到" + (getjson.content.folders.length + getjson.content.files.length) + "个结果");
                        }
                        pageload(100, 200);
                        for (var i = 0; i < getjson.content.folders.length; i++) {
                            var name = getjson.content.folders[i].name;
                            var filetype = "folder";

                            $("#divall").append("<li filetype=" + filetype + " style='background:url(images/filetype/folder.png) 50% 30%  no-repeat;' path=\"" + getjson.content.folders[i].path + "\" title=\"" + name + "\"><p  class='fname' >" + name + "</p></li>");
                        }
                        for (var j = 0; j < getjson.content.files.length; j++) {
                            var filetype = getFileType(getjson.content.files[j].name);

                            var name = getjson.content.files[j].name;
                            $("#divall").append("<li filetype=" + filetype + " style='background:url(images/filetype/" + filetype + ".png) 50% 30%  no-repeat;' path=\"" + getjson.content.files[j].path + "\" title=\"" + name + "\"><a class='add_cart'>+</a><p  class='fname' >" + name + "</p></li>");
                        }


                    }
                },
                complete: function (data) {
                    $("#mp-pusher").removeClass("mp-pushed");
                }

            });
        }
    });






    //打开文件夹函数
    function openfloder(folderpath) {

        var showpath = folderpath.replace($("#rootfolder").text(), "").split('\\').slice(1);
        if (showpath.length > 4) {
            showpath = "...\\" + showpath.slice(-4).join('\\');
        } else {
            showpath = showpath.slice(-4).join('\\');
        }
        $("#thisway").text((showpath == '') ? "" : showpath);
        $("#thisway").attr('path', folderpath);
        $("#a_back").text((showpath == '') ? "" : "返回上级目录");
        $("#divall").empty();
        pageload(80, 200);
        $.ajax({
            url: "api/Files/getlist?filepath=" + encodeURI(folderpath.replace(/\+/g, "%2B").replace(/\&/g, "%26")),
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            type: "GET",
            success: function (data) {

                var getjson = eval("(" + data + ")");
                if (getjson.status != "success") {
                    alert(getjson.content);
                } else {
                    $("#rootfolder").text(getjson.rootfolder);
                    pageload(100, 100);
                    for (var i = 0; i < getjson.content.folders.length; i++) {
                        var name = getjson.content.folders[i].name;
                        var filetype = "folder";

                        $("#divall").append("<li filetype=" + filetype + " style='background:url(images/filetype/folder.png) 50% 30%  no-repeat;' path=\"" + getjson.content.folders[i].path + "\" title=\"" + name + "\"><p  class='fname' >" + name + "</p></li>");
                    }
                    for (var j = 0; j < getjson.content.files.length; j++) {
                        var filetype = getFileType(getjson.content.files[j].name);
                        var size = getjson.content.files[j].size;
                        var size_title = 0;
                        if (size / 1000 < 0.01) {
                            size_title = size+"B";
                        } else if (size / 1000000 >= 0.01) {
                            size_title = (size / 1000000).toFixed(2)+"M";
                        } else {
                            size_title = (size / 1000).toFixed(2)+"K";
                        }
                        var name = getjson.content.files[j].name;
                        $("#divall").append("<li filetype=" + filetype + " style='background:url(images/filetype/" + filetype + ".png) 50% 30%  no-repeat;' path=\"" + getjson.content.files[j].path + "\" title=\"" + name + "(" + size_title + ")\" size=\"" + size + "\" ><a class='add_cart'>+</a><p  class='fname' >" + name + "</p></li>");
                        
                    }


                }
            }
        });

    }


//进度条
function pageload(widthpercent, speed) {
    var width = widthpercent * 1.5 + '%';
    if (widthpercent == 100) {
        $('#pageload').animate({ width: "100%" }, speed, function () {
            $('#pageload').animate({ width: '0' }, 0);
        });
    } else {
        $('#pageload').animate({ width: width }, speed);
    }

}

function getFileType(name) {
    var hz = name.toLowerCase().split('.')[name.split('.').length - 1];
    var resulttype = "other";
    $(typexml).find("hz").each(function (i, value) {
        if (value.textContent.toLowerCase() == hz) {
            resulttype = value.parentNode.getAttribute("type");
            return false;
        }
    });
    return resulttype;
}