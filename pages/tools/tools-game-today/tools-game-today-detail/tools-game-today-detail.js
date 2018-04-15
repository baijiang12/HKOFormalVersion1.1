var util = require('../../../../utils/util.js');
import { Config } from '../../../../utils/config.js';
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theTab: 'left',
    info: '',
    showModalStatus: false,
    thisGame: {},
    addcomments: {},
    CommentSupport: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    // 球队支持缓存(点赞)
    //获取当前比赛场次id
    var gameId = JSON.parse(options.list).gameid;
    var team1Id = JSON.parse(options.list).teamidone;
    var team2Id = JSON.parse(options.list).teamidtwo;
    //当前比赛场次+某个球队
    var supportid1 = gameId + '' + team1Id;
    var supportid2 = gameId + '' + team2Id;
    this.setData({
      supportid1: supportid1,
      supportid2: supportid2
    })
    var gamesSupport = wx.getStorageSync('game_support');
    //判断是否有缓存
    if (gamesSupport) {
      var gameSupport1 = gamesSupport[supportid1];
      var gameSupport2 = gamesSupport[supportid2];
      //判断此比赛是否有缓存
      if (gameSupport1 != null && gameSupport2 != null) {
        that.setData({
          Supported1: gameSupport1,
          Supported2: gameSupport2
        })
      } else {
        gamesSupport[supportid1] = false;
        gamesSupport[supportid2] = false;
        var gameSupport1 = gamesSupport[supportid1];
        var gameSupport2 = gamesSupport[supportid2];
        that.setData({
          Supported1: gameSupport1,
          Supported2: gameSupport2
        })
        wx.setStorageSync('game_support', gamesSupport);
      }
    } else {
      var gamesSupport = {};
      gamesSupport[supportid1] = false;
      gamesSupport[supportid2] = false;
      var gameSupport1 = gamesSupport[supportid1];
      var gameSupport2 = gamesSupport[supportid2];
      that.setData({
        Supported1: gameSupport1,
        Supported2: gameSupport2
      })
      wx.setStorageSync('game_support', gamesSupport);
    }
    // 发送比赛详情请求
    wx.request({
      url: Config.restUrl +'games/' + gameId + '.do',
      method: 'GET',
      data: {
        offset: 0,
        limit: 5
      },
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        // console.log(res);

        // 将时间戳转换为正常时间格式
        var thisgamecomment = res.data.comments;
        var commentnum = Object.keys(thisgamecomment).length;
        that.setData({
          commentnum: commentnum
        })
        for (var i = 0; i < Object.keys(thisgamecomment).length; i++) {
          res.data.comments[i].time = util.getDateDiff(thisgamecomment[i].time)
          // console.log(util.formatTime(thisgamecomment[i].time,("Y")))
        }
        var support1 = (res.data.team1likecount / (res.data.team1likecount + res.data.team2likecount));
        var support2 = (res.data.team2likecount / (res.data.team1likecount + res.data.team2likecount));
        res.data.team1likecounts = Math.floor(support1 * 10000) / 100;
        res.data.team2likecounts = Math.floor(support2 * 10000) / 100;
        
        that.setData({
          thisGame: res.data
        });
        if (JSON.stringify(that.data.thisGame.pointInfos) == '[]'){
          that.setData({
            isnotpointInfos:true
          })
        }
        
        
        var thisgamecomments = that.data.thisGame.comments;
        if (JSON.stringify(that.data.thisGame.comments) != '[]') {
          var thiscommentsupportid = that.data.thisGame.comments[0].gameId + '' + that.data.thisGame.comments[0].id;
        } else {
          var thiscommentsupportid = 0;
        }
        // 评论缓存  
        // 设置每条评论的唯一标识符
        // 定义此页面的每个评论的缓存
        var commentsupportid = {};
        for (var i = 0; i < Object.keys(thisgamecomments).length; i++) {
          commentsupportid[i] = gameId + '' + thisgamecomments[i].id;
        }
        // // 是否有比赛的评论缓存
        var commentssupport = wx.getStorageSync('game_comments_support');
        if (commentssupport) {
          var commentsupport = {};
          for (var i = 0; i < Object.keys(thisgamecomments).length; i++) {
            commentsupport[i] = commentssupport[commentsupportid[i]];
          }
          // 判断此页面的评论是否添加到缓存
          if (commentssupport[thiscommentsupportid] != null) {
            that.setData({
              commentssupport
            })
          } else {
            for (var i = 0; i < Object.keys(thisgamecomments).length; i++) {
              commentssupport[commentsupportid[i]] = false;
              wx.setStorageSync('game_comments_support', commentssupport)
            }
            that.setData({
              commentssupport
            })
          }
        } else {
          // 添加缓存
          var commentssupport = {};

          for (var i = 0; i < Object.keys(thisgamecomments).length; i++) {
            commentssupport[commentsupportid[i]] = false;
            wx.setStorageSync('game_comments_support', commentssupport)
          }
          that.setData({
            commentssupport
          })

        }
      },
      fail: function (error) {
        console.log(error);
      }
    });

  },
  //评论功能  追加评论
  bindFormSubmit: function (e) {
    var textareaContent = e.detail.value.textarea;
    var gameId = this.data.thisGame.id;
    var that = this;
    this.setData({
      info: ''
    });
    var thisdata = {
      "gameId": gameId,
      "userId": wx.getStorageSync('userInfoId'),
      "content": textareaContent,
      "likecount": 0
    };
    wx.request({
      url: Config.restUrl +'gamecomments.do',
      method: 'POST',
      data: JSON.stringify(thisdata),
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {

        if (res.data.status == 0) {
          wx.hideToast()
          wx.showToast({
            title: '不能含有敏感词汇',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.hideToast();
          res.data.time = util.getDateDiff(res.data.time)
          that.setData({
            addcomments: res.data
          });
          var commentnum = that.data.commentnum +1 ;

          that.setData({
            commentnum: commentnum
          })
          wx.showToast({
            title: '评论成功',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function () {

      }
    });
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
                            app.globalData.userInfo = ress.userInfo;
                            // 进行弹窗
                            var currentStatu = e.currentTarget.dataset.statu;
                            that.util(currentStatu)
                            wx.request({
                              url: Config.restUrl +'users/' + wx.getStorageSync('userInfoId') + '.do',
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
  //标签切换
  switchTabs: function (event) {
    if (event.currentTarget.dataset.lor != this.data.theTab) {
      if (this.data.theTab == 'left') {
        this.setData({
          theTab: 'right'
        })
      } else {
        this.setData({
          theTab: 'left'
        })
      }
    }
  },

  //球队点赞事件
  gameSupport: function (event) {
    //判断是左右点击
    var that = this;
    if (event.currentTarget.dataset.teamid == 'support1') {
      if (!this.data.Supported2) {
        var gamesSupport = wx.getStorageSync('game_support');
        var Supported1 = !this.data.Supported1;
        gamesSupport[that.data.supportid1] = Supported1;
        wx.setStorageSync('game_support', gamesSupport);
        that.setData({
          Supported1: Supported1
        })
        var count = Supported1 ? 1 : -1
        var thisGame = that.data.thisGame;
        thisGame.team1likecounts = Math.floor(((thisGame.team1likecount + count) / ((thisGame.team1likecount + count) + thisGame.team2likecount) * 10000)) / 100
        thisGame.team2likecounts = Math.floor(((thisGame.team2likecount) / ((thisGame.team1likecount + count) + thisGame.team2likecount) * 10000)) / 100
        thisGame.team1likecount = thisGame.team1likecount + count;
        that.setData({
          thisGame: thisGame
        })

        wx.request({
          url: Config.restUrl +'games/addSupport/' + this.data.thisGame.id + '.do',
          method: 'PUT',
          data: {
            "gameId": this.data.thisGame.id,
            "support": 'team1likecount',
            "count": count
          },
          header: {
            "Content-type": "application/json"
          },
          success: function () { },
          fail: function () {

          }
        })
      } else {
        wx.showToast({
          title: '只可支持一个球队',
          icon: 'none',
          duration: 1500
        })
      }
    } else {
      if (!this.data.Supported1) {
        var gamesSupport = wx.getStorageSync('game_support');
        var Supported2 = !this.data.Supported2;
        gamesSupport[that.data.supportid2] = Supported2;
        wx.setStorageSync('game_support', gamesSupport);
        that.setData({
          Supported2: Supported2
        })
        var count = Supported2 ? 1 : -1
        var thisGame = that.data.thisGame;
        thisGame.team2likecounts = Math.floor(((thisGame.team2likecount + count) / ((thisGame.team2likecount + count) + thisGame.team1likecount) * 10000)) / 100
        thisGame.team1likecounts = Math.floor(((thisGame.team1likecount) / ((thisGame.team2likecount + count) + thisGame.team1likecount) * 10000)) / 100
        thisGame.team2likecount = thisGame.team2likecount + count;
        that.setData({
          thisGame: thisGame
        })
        wx.request({
          url: Config.restUrl +'games/addSupport/' + this.data.thisGame.id + '.do',
          method: 'PUT',
          data: {
            "gameId": this.data.thisGame.id,
            "support": 'team2likecount',
            "count": count
          },
          header: {
            "Content-type": "application/json"
          },
          success: function () { },
          fail: function () {

          }
        })
      } else {
        wx.showToast({
          title: '只可支持一个球队',
          icon: 'none',
          duration: 1500
        })
      }
    }
  },

  //评论点赞 
  commentSupport: function (event) {
    var that = this;
    var commentId = event.currentTarget.dataset.commentid;
    var gameId = event.currentTarget.dataset.gameid;
    if (event.currentTarget.dataset.add) {
      var add = event.currentTarget.dataset.add;
    }
    var thiscommentsupportid = gameId + '' + commentId;
    // 获取comments对象
    var thisgamecomments = this.data.thisGame.comments;
    // 评论缓存  

    var commentssupport = wx.getStorageSync('game_comments_support');
    if (commentssupport) {
      if (JSON.stringify(commentssupport[thiscommentsupportid]) != 'undefined') {
        commentssupport[thiscommentsupportid] = !commentssupport[thiscommentsupportid];
        wx.setStorageSync('game_comments_support', commentssupport)
        that.setData({
          commentssupport
        })
      } else {
        var commentssupport = wx.getStorageSync('game_comments_support');
        commentssupport[thiscommentsupportid] = false;
        commentssupport[thiscommentsupportid] = !commentssupport[thiscommentsupportid];
        wx.setStorageSync('game_comments_support', commentssupport);
        that.setData({
          commentssupport
        })
      }
    } else {
      var commentssupport = {};
      commentssupport[thiscommentsupportid] = false;
      commentssupport[thiscommentsupportid] = !commentssupport[thiscommentsupportid];
      wx.setStorageSync('game_comments_support', commentssupport);
      that.setData({
        commentssupport
      })
    }



    var count = commentssupport[thiscommentsupportid] ? 1 : -1

    var thisgamecomments = that.data.thisGame;
    if (add) {
      var addcomments = that.data.addcomments;
      addcomments.likecount = addcomments.likecount + count;
      that.setData({
        addcomments: addcomments
      })
    } else {
      for (var i = 0; i < Object.keys(thisgamecomments.comments).length; i++) {
        if (thisgamecomments.comments[i].id == commentId) {
          thisgamecomments.comments[i].likecount = thisgamecomments.comments[i].likecount + count;
          that.setData({
            thisGame: thisgamecomments
          })
        }
      }
    }

    wx.request({
      url: Config.restUrl +'gamecomments/addlike/' + commentId + '.do',
      data: {
        gameId: gameId,
        id: commentId,
        count: count
      },
      method: 'PUT',
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        // 数据绑定,设置缓存
      }

    })
  },

})