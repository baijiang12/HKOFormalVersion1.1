// pages/tools/tools.js
var matchList = require("../data.js");
import { Config } from '../../utils/config.js';
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      loading: true
    })
    // console.log(matchList);
    this.setData({
      matchList: matchList
    });
    // setTimeout(function () {
      that.setData({
        loading: false
      })
    // }, 100000000)
  },
  sportDetail: function (event) {
    var matchStatus = event.currentTarget.dataset.status;
    if (matchStatus == 0) {
      wx.showToast({
        title: '暂无赛事',
        icon: 'none',
        duration: 2000
      })
    } else {      
      wx.request({
        url: Config.restUrl + 'games/list/future.do',
        method: 'POST',
        data: {
          offset: 0,
          limit: 10,
          gameId: event.currentTarget.dataset.sportid
        },
        header: {
          "Content-type": "application/json"
        },
        success: function (res) {
          if (JSON.stringify(res.data) == '[]') {
            wx.showToast({
              title: '暂无赛事',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.navigateTo({
              url: "tools-game-today/tools-game-today?matchId=" + event.currentTarget.dataset.sportid,
            })}
        },
        fail: function (error) {
          console.log(error)
        }
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  formSubimt: function (res) {
    wx.request({
      url: Config.restUrl + 'formvalues.do',
      data: {
        userId: wx.getStorageSync('userInfoId'),
        formId: res.detail.formId,
        // formId: 1522653763724,
      },
      method: 'POST',
      header: {
        "Content-type": "application/json"
      },
      success: function (res) {
        // console.log(res)
      },
      fail: function () {

      }

    })
  },
})