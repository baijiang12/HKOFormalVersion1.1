// pages/news/news-detail/news-detail.js
var time = require('../../../utils/util.js');
import { Config } from '../../../utils/config.js';
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        info: '',
        flag: false,
        showModalStatus: false,
        height: 20,
        focus: false,
        showModal: false,
        addcomments: {},
        newsDetails: {}
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var newsId = options.id;
        that.data.currentNewsId = newsId;
        wx.request({
            url: Config.restUrl + '/news/' + newsId + '.do',
            method: 'GET',
            header: {
                "Content-Type": "application/json"
            },
            success: function (res) {
                var oldtime = res.data.time;
                var mess = time.formatTime(oldtime, "Y/M/D h:m");
                res.data.time = "";
                res.data.time = mess;
                var status = [];
                for(var m=0;m<res.data.content_str.length;m++){
                    var s = res.data.content_str[m];
                    var h = s.match("https://heikeonline.oss-cn-beijing.aliyuncs.com/");
                    if (h != null) {
                        res.data.content_str[m] = '';
                        res.data.content_str[m] = h.input;
                        status[m] = false;
                        h = '';

                    } else {
                        res.data.content_str[m] = s;
                        status[m] = true;
                        h = '';
                    }
                }

                that.setData({
                    status:status
                })
                for (var i = 0; i < res.data.newsComments.length; i++) {
                    var commentTime = res.data.newsComments[i].time;
                    var date = time.getDateDiff(commentTime);
                    res.data.newsComments[i].time = "";
                    res.data.newsComments[i].time = date;
                }
                that.setData({
                    'newsDetails': res.data,
                })
                //设置文章点赞功能缓存
                var postsCollected = wx.getStorageSync('posts_collected');
                if (postsCollected) {
                    var postCollected = postsCollected[newsId];
                    if (!postCollected) {
                        postsCollected[newsId] = false;
                        wx.setStorageSync('postsCollected', postsCollected);
                    } else {
                        that.setData({
                            collected: postCollected
                        })
                    }
                } else {
                    var postsCollected = {};
                    postsCollected[newsId] = false;
                    wx.setStorageSync('posts_collected', postsCollected);
                }
                //设置评论缓存唯一标识
                var thisnewscomments = that.data.newsDetails.newsComments;
                if (JSON.stringify(that.data.newsDetails.newsComments) != '[]') {
                    var thiscommentzanid = that.data.newsDetails.newsComments[0].newsId + '' + that.data.newsDetails.newsComments[0].id;
                } else {
                    var thiscommentzanid = 0;
                }
                //为每一条评论赋值为变量，方便管理每一条评论
                var commentzanid = {};
                for (var i = 0; i < Object.keys(thisnewscomments).length; i++) {
                    commentzanid[i] = newsId + '' + thisnewscomments[i].id;
                }
                //缓存是否已存在
                var commentszan = wx.getStorageSync('news_comments_zan');
                if (commentszan) {
                    var commentzan = {};
                    for (var i = 0; i < Object.keys(thisnewscomments).length; i++) {
                        commentzan[i] = commentszan[commentzanid[i]];
                    }
                    //判断
                    if (commentszan[thiscommentzanid] != null) {
                        that.setData({
                            commentszan
                        })
                    } else {
                        for (var i = 0; i < Object.keys(thisnewscomments).length; i++) {
                            commentszan[commentzanid[i]] = false;
                            wx.setStorageSync('news_comments_zan', commentszan);
                        }
                        that.setData({
                            commentszan
                        })
                    }
                } else {
                    //添加缓存
                    var commentszan = {};
                    for (var i = 0; i < Object.keys(thisnewscomments).length; i++) {
                        commentszan[commentzanid[i]] = false;
                        wx.setStorageSync('news_comments_zan', commentszan);
                    }
                    that.setData({
                        commentszan
                    })
                }
            },
            fail: function (error) {
                console.log(error);
            }
        })
    },
    onCollectionTap: function (event) {
        var that = this;
        var id = that.data.currentNewsId;
        var collected = event.currentTarget.dataset.collected;
        var count = collected ? -1 : 1;
        var all = that.data.newsDetails;
        var collectedCount = all.likecount;
        collectedCount = collectedCount + count;
        all.likecount = collectedCount;
        that.setData({
            newsDetails: all
        })
        that.getPostsCollectedSync();
        wx.request({
            url: Config.restUrl + '/news/addlike/' + id + '.do',
            data: { newsId: id, count: count },
            method: 'PUT',
            header: {
                "Content-Type": "application/json"
            },
            success: function () {
            }
        })
    },
    getPostsCollectedSync: function () {
        var postsCollected = wx.getStorageSync('posts_collected');
        var postCollected = postsCollected[this.data.currentNewsId];
        //收藏变为未收藏，未收藏变为收藏
        postCollected = !postCollected;
        postsCollected[this.data.currentNewsId] = postCollected;
        this.showToast(postsCollected, postCollected);
    },
    showToast: function (postsCollected, postCollected) {
        //更新文章是否收藏的缓存值
        wx.setStorageSync('posts_collected', postsCollected);
        this.setData({
            //更新数据绑定变量，从而实现图片切换
            collected: postCollected
        })
        wx.showToast({
            title: postCollected ? '点赞成功' : '取消成功',
            duration: 1000,
            icon: 'success'
        })
    },
    bindFormSubmit: function (e) {
        var that = this;
        var s = that.data.newsDetails;
        var id = e.currentTarget.dataset.newsid;
        var textareaContent = e.detail.value.textarea;
        that.setData({
            info: ''
        })
        wx.request({
            url: Config.restUrl + '/newscomments.do',
            data: { 'newsId': id, 'userId': wx.getStorageSync('userInfoId'), 'content': textareaContent, 'likecount': 0 },
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                if (res.data.status == 0) {
                    wx.hideToast();
                    wx.showToast({
                        title: '不能含有敏感词汇',
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    wx.hideToast();
                    var mess = time.getDateDiff(new Date(), "Y/M/D h:m");
                    that.setData({
                        addcomments: res.data,
                        mess: mess,
                    })
                    wx.showToast({
                        title: '评论成功',
                        icon: 'none',
                        duration: 2000
                    })
                    var m = s.commentCount;
                    m=m+1;
                    s.commentCount = m;
                    that.setData({
                        newsDetails:s
                    })
                }
            },
            fail: function (err) {
                console.log(err);
            }
        })
        wx.showToast({
            icon: 'loading',
            duration: 6000
        })
    },
    powerDrawer: function (e) {
        var that = this;
        // 判断是否有用户信息,若无,先询问用户,若用户同意,则
        wx.getSetting({
            success: function (res) {
                if (res.authSetting['scope.userInfo']) {
                    // 已授权
                    var currentStatu = e.currentTarget.dataset.statu;
                    that.util(currentStatu)
                } else {
                    // 未授权,获取用户信息
                    wx.showModal({
                        title: '提示',
                        content: '评论前请登录',
                        showCancel: false,
                        success: function (result) {
                            if (result.confirm) {
                                wx.openSetting({
                                    success: function (data) {
                                        if (data) {
                                            if (data.authSetting["scope.userInfo"] == true) {
                                                wx.getUserInfo({
                                                    success: function (ress) {
                                                        console.log(ress)
                                                        app.globalData.userInfo = ress.userInfo;
                                                        // 进行弹窗
                                                        var currentStatu = e.currentTarget.dataset.statu;
                                                        that.util(currentStatu)
                                                        wx.request({
                                                            url: Config.restUrl + '/users/' + wx.getStorageSync('userInfoId') + '.do',
                                                            data: {
                                                                id: wx.getStorageSync('userInfoId'),
                                                                name: ress.userInfo.nickName,
                                                                icon: ress.userInfo.avatarUrl,
                                                            },
                                                            method: 'PUT',
                                                            header: {
                                                                "Content-type": "application/json"
                                                            },
                                                            success: function (resss) {
                                                                // console.log(res)
                                                            },
                                                            fail: function () {

                                                            }
                                                        })
                                                    }
                                                })
                                            }

                                        }
                                    },
                                    fail: function () {
                                        console.info("设置失败返回数据");

                                    }
                                });
                            } else if (result.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            }
        })

    },
    util: function (currentStatu) {
        /* 动画部分 */
        // 第1步：创建动画实例
        var animation = wx.createAnimation({
            duration: 200,  //动画时长
            timingFunction: "linear", //线性
            delay: 0  //0则不延迟
        });

        // 第2步：这个动画实例赋给当前的动画实例
        this.animation = animation;

        // 第3步：执行第一组动画
        animation.opacity(0).rotateX(-100).step();

        // 第4步：导出动画对象赋给数据对象储存
        this.setData({
            animationData: animation.export()
        })

        // 第5步：设置定时器到指定时候后，执行第二组动画
        setTimeout(function () {
            // 执行第二组动画
            animation.opacity(1).rotateX(0).step();
            // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
            this.setData({
                animationData: animation
            })

            //关闭
            if (currentStatu == "close") {
                this.setData(
                    {
                        showModalStatus: false
                    }
                );
            }
        }.bind(this), 200)

        // 显示
        if (currentStatu == "open") {
            this.setData(
                {
                    showModalStatus: true
                }
            );
        }
    },
    zanTap: function (event) {
        var that = this;
        var commentId = event.currentTarget.dataset.commentid;
        var newsId = event.currentTarget.dataset.newsid;
        if (event.currentTarget.dataset.add) {
            var add = event.currentTarget.dataset.add;
        }
        var thiscommentzanid = newsId + '' + commentId;
        // 获取comments对象
        var thisnewscomments = that.data.newsDetails.newsComments;
        // 评论缓存
        var commentszan = wx.getStorageSync('news_comments_zan');
        if (commentszan) {
            if (JSON.stringify(commentszan[thiscommentzanid] != 'undefined')) {
                commentszan[thiscommentzanid] = !commentszan[thiscommentzanid];
                wx.setStorageSync('news_comments_zan', commentszan);
                that.setData({
                    commentszan
                })
            } else {
                commentszan = wx.getStorageSync('news_comments_zan');
                commentszan[thiscommentzanid] = false;
                commentszan[thiscommentzanid] = !commentszan[thiscommentzanid];
                wx.setStorageSync('news_comments_zan', commentszan);
                that.setData({
                    commentszan
                })
            }
        } else {
            var commentszan = {};
            commentszan[thiscommentzanid] = false;
            commentszan[thiscommentzanid] = !commentszan[thiscommentzanid];
            wx.setStorageSync('news_comments_zan', commentszan);
            that.setData({
                commentszan
            })
        }
        var count = commentszan[thiscommentzanid] ? 1 : -1;
        var thisnewscomments = that.data.newsDetails;
        if (add) {
            var addcomments = that.data.addcomments;
            addcomments.likecount = addcomments.likecount + count;
            that.setData({
                addcomments: addcomments
            })
        } else {
            for (var i = 0; i < Object.keys(thisnewscomments.newsComments).length; i++) {
                if (thisnewscomments.newsComments[i].id == commentId) {
                    thisnewscomments.newsComments[i].likecount = thisnewscomments.newsComments[i].likecount + count;
                    that.setData({
                        newsDetails: thisnewscomments
                    })
                }
            }
        }
        wx.request({
            url: Config.restUrl + '/newscomments/addlike/' + commentId + '.do',
            data: {
                newsId: newsId,
                id: commentId,
                count: count
            },
            method: 'PUT',
            header: {
                "Content-Type": "application/json"
            },
            success: function (res) {
            }

        })
    },
    submit: function () {
        this.setData({
            showModal: true
        })
    },

    preventTouchMove: function () {

    },

    mytouchstart: function () {
        this.setData({
            showModal: false
        })
    },

    go: function () {
        this.setData({
            showModal: false
        })
    },
    bindButtonTap: function () {
        this.setData({
            focus: true
        })
    },
    bindTextAreaBlur: function (e) {
        console.log(e.detail.value)
    },
})