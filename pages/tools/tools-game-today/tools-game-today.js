// pages/tools/tools-game-today/tools-game-today.js
import { Config } from '../../../utils/config.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayGame: {
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      loading: true,
      currentTab:0
    })
   
    // 赛事关注缓存
    var that = this;
    that.setData({
      matchId: options.matchId
    })
    // 设置更新比赛数目的缓存
    wx.removeStorageSync('refresh_game')
    wx.setStorageSync('refresh_game', 0);
    var gamefollow = wx.getStorageSync('game_follow');
    // 判断是否有赛事关注缓存
    if (gamefollow) {
      if (gamefollow[options.matchId] != null) {
        that.setData({
          gamefollow
        })
      } else {
        gamefollow[options.matchId] = false;
        that.setData({
          gamefollow
        })
        wx.setStorageSync('game_follow', gamefollow);
      }
    } else {
      var gamefollow = {};
      gamefollow[options.matchId] = false;
      that.setData({
        gamefollow
      })
      wx.setStorageSync('game_follow', gamefollow);
    }
    if (options.matchId == 0){
      // 足球联赛
      // 获取今日比赛
      wx.request({
        url: Config.restUrl + 'games/list/future.do',
        method: 'POST',
        data: {
          offset: 0,
          limit: 10,
          gameId:0
        },
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          // 骚红
          // setTimeout(function(){
            that.setData({
              loading: false
            })
          // },20000)
          that.setData({
            todayGame: res.data
          })
        },
        fail: function (error) {
          console.log(error)
        }
      })
        // 获取积分榜
      wx.request({
        url: Config.restUrl + 'scorerankings/circulation/' +options.matchId+'.do',
        method: 'GET',
        data: {},
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          // console.log(res.data)
          that.setData({
            scorerankings: res.data
          })
        },
        fail: function () { }
      })
      // 获取射手榜
    wx.request({
      url: Config.restUrl + 'shooterrankings/' + options.matchId + '.do',
      method: 'GET',
      data: {},
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        that.setData({
          shooterrankings: res.data
        })
      },
      fail: function () { }
    })
    // 获取红黄牌
    wx.request({
      url: Config.restUrl + 'redyellowrankings/' + options.matchId + '.do',
      method: 'GET',
      data: {},
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        that.setData({
          redyellowrankings: res.data
        })
      },
      fail: function () { }
    })

    }else if(options.matchId == 1){
      // 足球杯赛
      // 获取今日比赛
      wx.request({
        url: Config.restUrl + 'games/list/future.do',
        method: 'POST',
        data: {
          offset: 0,
          limit: 10,
          gameId: 1
        },
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          // 骚红
          // setTimeout(function () {
            that.setData({
              loading: false
            })
          // }, 200)
          that.setData({
            todayGame: res.data
          })
        },
        fail: function (error) {
          console.log(error)
        }
      })
      // 获取足球杯赛小组赛对战情况
      wx.request({
        url: Config.restUrl + '/scorerankings/group/' + options.matchId + '.do',
        method: 'GET',
        data: {},
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          that.setData({
            groupMatch: res.data
          })
        },
        fail: function () { }
      })
      // 获取射手榜
      wx.request({
        url: Config.restUrl + 'shooterrankings/' + options.matchId + '.do',
        method: 'GET',
        data: {},
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          that.setData({
            shooterrankings: res.data
          })
        },
        fail: function () { }
      })
      // 获取红黄牌
      wx.request({
        url: Config.restUrl + 'redyellowrankings/' + options.matchId + '.do',
        method: 'GET',
        data: {},
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          that.setData({
            redyellowrankings: res.data
          })
        },
        fail: function () { }
      })

    }else if(options.matchId == 2){
      // 篮球杯赛/火神杯 赛程
      wx.request({
        url: Config.restUrl + 'games/list/future.do',
        method: 'POST',
        data: {
          offset: 0,
          limit: 10,
          gameId: 2
        },
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          // console.log(res);
          // 骚红
          // setTimeout(function () {
            that.setData({
              loading: false
            })
          // }, 200)
          that.setData({
            todayGame: res.data
          })
        },
        fail: function (error) {
          console.log(error)
        }
      })
      // 获取篮球小组赛对战情况
      wx.request({
        url: Config.restUrl + '/scorerankings/group/' + options.matchId + '.do',
        method: 'GET',
        data: {},
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          that.setData({
            groupMatch: res.data
          })
        },
        fail: function () { }
      })
    }
    
  },


  // 比赛详情跳转
  onGameDetailTap: function (event) {
    wx.navigateTo({
      url: 'tools-game-today-detail/tools-game-today-detail?list=' + JSON.stringify(event.currentTarget.dataset),
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  
  //下拉刷新
  pulldownrefresh: function () {
    // wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    that.setData({
      loading: true
    })
    // current 应该设置一个缓存,需将天数累加
    wx.request({
      url: Config.restUrl + 'games/list/ago.do',
      method: 'POST',
      data: {
        offset: wx.getStorageSync('refresh_game'),
        limit: 5,
        direction: '<'
      },
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        // setTimeout(function () {
          that.setData({
            loading: false
          })
        // }, 200)
        wx.setStorageSync('refresh_game', wx.getStorageSync('refresh_game') + 5);
        // 将新获取到的比赛追加到前面 
        if (JSON.stringify(res.data) != '[]') {
          var temp = res.data.reverse();
          var temp = res.data;
          var former = that.data.todayGame;
          var lenformer = Object.keys(temp).length;
          for (var i = 0; i < Object.keys(former).length; i++) {
            temp[lenformer + i] = former[i];
          }
          that.setData({
            todayGame: temp
          })
        } else {
          wx.showToast({
            title: '无更多赛事',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (error) {
        console.log(error)
      }
    })
    //模拟加载
    // setTimeout(function () {
    //   // complete
    //   wx.hideNavigationBarLoading() //完成停止加载
    //   wx.stopPullDownRefresh() //停止下拉刷新
    // }, 1000);
  },
  followTap: function (res) {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已授权
          var matchId = that.data.matchId;
          var gamefollow = wx.getStorageSync('game_follow');
          gamefollow[matchId] = !gamefollow[matchId];
          that.setData({
            gamefollow
          })
          wx.setStorageSync('game_follow', gamefollow);
          if (gamefollow[matchId]) {
            wx.request({
              url: Config.restUrl + 'users/concern.do',
              data: {
                userId: wx.getStorageSync('userInfoId'),
                gameId: matchId
              },
              header: {
                "Content-type": "application/json"
              },
              method: 'POST',
              success: function (res) {
              },
              fail: function () { }

            })
          } else {
            wx.request({
              url: Config.restUrl + 'users/concern.do',
              data: {
                userId: wx.getStorageSync('userInfoId'),
                gameId: matchId
              },
              header: {
                "Content-type": "application/json"
              },
              method: 'DELETE',
              success: function (res) {
              },
              fail: function () { }

            })
          }
        } else {
          // 未授权,获取用户信息
          wx.showModal({
            title: '提示',
            content: '关注前请登录',
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
                            // 进行关注
                            var matchId = that.data.matchId;
                            var gamefollow = wx.getStorageSync('game_follow');
                            gamefollow[matchId] = !gamefollow[matchId];
                            that.setData({
                              gamefollow
                            })
                            wx.setStorageSync('game_follow', gamefollow);
                            if (gamefollow[matchId]) {
                              wx.request({
                                url: Config.restUrl + 'users/concern.do',
                                data: {
                                  userId: wx.getStorageSync('userInfoId'),
                                  gameId: matchId
                                },
                                header: {
                                  "Content-type": "application/json"
                                },
                                method: 'POST',
                                success: function (res) {
                                },
                                fail: function () { }

                              })
                            } else {
                              wx.request({
                                url: Config.restUrl + 'users/concern.do',
                                data: {
                                  userId: wx.getStorageSync('userInfoId'),
                                  gameId: matchId
                                },
                                header: {
                                  "Content-type": "application/json"
                                },
                                method: 'DELETE',
                                success: function (res) {
                                },
                                fail: function () { }

                              })
                            }
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
  switchTab:function(e){
    // wx.startPullDownRefresh()
    this.setData({
      currentTab: e.currentTarget.dataset.currenttab
    })
  }
})