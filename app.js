//app.js
import { Config } from 'utils/config.js';
App({
  globalData: {
    userInfo: null,
    userid: null
  },
  onLaunch: function () {
    // wx.removeStorageSync('userInfoId');
    // 判断用户是否已在服务器注册
    var that = this;
    if (wx.getStorageSync('userInfoId')) {
      // 已注册 用户信息更新
      // console.log(wx.getStorageSync('userInfoId'));
      // 验证用户session_key是否过期
      wx.checkSession({
        success: function () {
          // session_key未过期
          // 查看用户是否有用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo'] == true) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    that.globalData.userInfo = res.userInfo;
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (that.userInfoReadyCallback) {
                      that.userInfoReadyCallback(res)
                    }
                  }
                })
              } else {
                // 未授权
                wx.getUserInfo({
                  success: function (res) {
                    that.globalData.userInfo = res.userInfo;
                    wx.request({
                      url: Config.restUrl + 'users/' + result.data.id + '.do',
                      data: {
                        id: result.data.id,
                        name: res.userInfo.nickName,
                        icon: res.userInfo.avatarUrl,
                      },
                      method: 'PUT',
                      header: {
                        "Content-type": "application/json"
                      },
                      success: function (res) {
                        // console.log(res)
                      },
                      fail: function () {

                      }
                    })
                  }
                })
              }
            }
          })
        },
        fail: function () {
          //session_key过期已失效 session_key更新,用户信息更新
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId\
              if (res.code) {
                wx.request({
                  url: Config.restUrl +'users/update' + res.code + '.do',
                  data: {
                    id: wx.getStorageSync('userInfoId'),
                    code: res.code
                  },
                  method: 'GET',
                  success: function (result) {
                    //获取用户信息
                    //将用户id存入缓存 
                    wx.getUserInfo({
                      success: function (ress) {
                        // 用户信息更新
                        wx.request({
                          url: Config.restUrl + 'users/' + wx.getStorageSync('userInfoId') + '.do',
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
                        });
                      }
                    })
                  },
                  fail: function (res) { },
                  complete: function () { }
                })
              } else {
                console.log('session_key和用户信息更新失败！' + res.errMsg)
              }
            }
          })
        }
      })
    } else {
      // 未注册 进行注册
      var that = this;
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId\
          if (res.code) {
            wx.request({
              url: Config.restUrl +'users/register.do?code=' + res.code,
              data: {},
              method: 'GET',
              success: function (result) {
                //获取用户信息
                //将用户id存入缓存 
                wx.setStorageSync('userInfoId', result.data.id);
                wx.getUserInfo({
                  success: function (res) {
                    that.globalData.userInfo = res.userInfo;
                    wx.request({
                      url: Config.restUrl +'users/' + result.data.id + '.do',
                      data: {
                        id: result.data.id,
                        name: res.userInfo.nickName,
                        icon: res.userInfo.avatarUrl,
                      },
                      method: 'PUT',
                      header: {
                        "Content-type": "application/json"
                      },
                      success: function (res) {
                        // console.log(res)
                      },
                      fail: function () {

                      }
                    })
                  }
                })
              },
              fail: function (res) {},
              complete: function () { }
            })
          } else {
            console.log('注册失败！' + res.errMsg)
          }
        }
      })
    }

  },
})