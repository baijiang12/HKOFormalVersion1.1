// pages/news/news.js
import { News } from 'news-model.js';
import { Config } from '../../utils/config.js';
var news = new News();
var times = require('../../utils/util.js');
var bmap = require('../../utils/libs/bmap-wx.min.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showSearch: true,
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    title: '- 下拉加载更多资讯 -',
    showModal: false,
    weatherData: ''
  },

  go: function () {
    this.setData({
      showModal: false,
    })
  },
  preventTouchMove: function () {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var BMap = new bmap.BMapWX({
      ak: '93n5HcAxtg3ig5Q6RE4thIYg110Dp27g'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      var d = new Date();
      var Day = d.getDay();
      var weatherData = data.currentWeather[0];
      var weatherDesc = weatherData.weatherDesc;//天气
      //var weathertemperature = weatherData.temperature;//温度
      var weatherCity = weatherData.currentCity;//城市
      //var weatherpm = weatherData.pm25;//pm2.5
      switch (Day) {
        case 1: Day = '星期一'; break;
        case 2: Day = '星期二'; break;
        case 3: Day = '星期三'; break;
        case 4: Day = '星期四'; break;
        case 5: Day = '星期五'; break;
        case 6: Day = '星期六'; break;
        case 0: Day = '星期七'; break;
          default: Day = '获取失败';break;
      }
      that.setData({
        weatherData: weatherDesc,
        day: Day,
        city: weatherCity
      });
    }
    // 发起weather请求
    BMap.weather({
      fail: fail,
      success: success
    });
    that._loadData(options.id);
    wx.request({
      url: Config.restUrl + '/news/banner.do',
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var a = [];
        for (var j = 0; j < res.data.length; j++) {
          var swipertime = res.data[j].time;
          var mass = times.formatTime(swipertime, 'Y-M-D');
          res.data[j].time = "";
          a[j] = mass;
          res.data[j].time = a[j];
        }
        that.setData({
          newsSwiper: res.data
        })
      }
    })
    wx.request({
      url: Config.restUrl + '/news/top.do',
      data: { offset: 0, limit: 1 },
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var d = [];
        for (var j = 0; j < res.data.length; j++) {
          var eldtime = res.data[j].time;
          var miss = times.formatTime(eldtime, 'Y-M-D');
          res.data[j].time = "";
          d[j] = miss;
          res.data[j].time = d[j];
        }
        that.setData({
          newsTop: res.data
        })
      }
    })

  },
  _loadData: function (id) {
    var that = this;
    var start = [];
    var limit = 2;
    news.getNewsData(id, (res) => {
      var now = new Date().getTime();
      for (var i = 0; i < res.length; i++) {
        var oldtime = res[i].time;
        var mess = times.getDateDiff(oldtime);
        //转换oldtime
        res[i].time = "";
        start[i] = mess;
        res[i].time = start[i];
      }
      that.setData({
        newsArr: res,
      })
    });
    limit++;
    that.data.limit = limit;

  },
  signIn: function () {
    //设置打晨卡重复功能缓存
    var that = this;
    var lastSignInDays = wx.getStorageSync('signIn');
    if (!lastSignInDays) {
      lastSignInDays = 0;
    }
    var today = new Date();
    var todays = times.getDays(today);
    var todayth = today.getTime();
    var hour = today.getHours();
    if (hour < 8 && 5 < hour) {
      if (lastSignInDays == todays) {
        wx.showModal({
          title: '您今天已经打过一次卡啦',
          content: '请明天5点到8点再来吧'
        })
      } else {
        wx.request({
          url: Config.restUrl + '/hitmorning.do',
          method: 'GET',
          header: {
            "Content-Type": "application/json"
          },
          success: function (res) {
            wx.setStorageSync('signIn', todays);
            that.setData({
              signIn: res.data,
              showModal: true,
            })
          },
        })
      }
    } else {
      wx.showModal({
        title: '时间已经过了',
        content: '请明天5点到8点再来吧'
      })
    }
  },
  onMatch: function (event) {
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
            url: "../tools/tools-game-today/tools-game-today?matchId=" + event.currentTarget.dataset.sportid,
          })
        }
      },
      fail: function (error) {
        console.log(error)
      }
    })
  },
  onShowSearch: function (event) {
    this.setData({
      showSearch: false
    })
  },
  onCancleSearch: function () {
    this.setData({
      showSearch: true
    })
  },


  onNewsDetail: function (event) {
    var newsId = event.currentTarget.dataset.newsid;
    wx.navigateTo({
      url: './news-detail/news-detail?id=' + newsId,
    })
  },
  /**
   *
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
    wx.showNavigationBarLoading();
    wx.request({
      url: Config.restUrl + '/news/list.do',
      data: { offset: 0, limit: 2 },
      method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
      },
      fail: function (error) {
        console.log(error);
      }
    })
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var start = [];
    var that = this;
    var limit = that.data.limit;
    wx.request({
      url: Config.restUrl + '/news/list.do',
      data: { offset: 0, limit: limit },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          hidden: false
        })
        var now = new Date().getTime();
        for (var i = 0; i < res.data.length; i++) {
          var oldtime = res.data[i].time;
          var mess = times.getDateDiff(oldtime);
          res.data[i].time = "";
          start[i] = mess;
          res.data[i].time = start[i];
        }
        that.setData({
          newsArr: res.data
        })
        if (limit > res.data.length) {
          setTimeout(function () {
            that.setData({
              hide: false,
              title: '托底了，兄台'
            })
          }, 500)
        } if (limit > res.data.length) {
          limit = res.data.length;
        } else {
          limit++;
          that.data.limit = limit;
        }
      },
      fail: function (err) {
        console.log(err);
      }
    })

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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})