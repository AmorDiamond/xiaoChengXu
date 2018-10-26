// miniprogram/pages/user/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    openId: '',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.onGetOpenid();
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
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
  
  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.onGetOpenid();
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid;
        this.onGetUserAvatar();
        this.setData({
          openId: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },
  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        const openid = this.data.openId;
        // 上传图片
        const cloudPath = 'avatar-image' + openid + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            this.updateAvatarInfo(res.fileID),
            this.setData({
              avatarUrl: res.fileID
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  updateAvatarInfo: function (fileID) {
    const db = wx.cloud.database()
    const imgId = fileID;
    db.collection('avatarInfo').where({
      _openid: app.globalData.openid
    }).get({
      success: (res) => {
        // 输出 [{ "title": "The Catcher in the Rye", ... }]
        console.log(res);
        const data = res.data[0];
        if (data) {
          db.collection('avatarInfo').doc(data._id).update({
            data: {
              imgId: imgId
            },
            success: res => {
              // 在返回结果中会包含新创建的记录的 _id
              wx.showToast({
                title: '修改记录成功',
              })
              console.log('[数据库] [修改记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '修改记录失败'
              })
              console.error('[数据库] [修改记录] 失败：', err)
            }
          })
        } else {
          db.collection('avatarInfo').add({
            data: {
              imgId: imgId
            },
            success: res => {
              // 在返回结果中会包含新创建的记录的 _id
              wx.showToast({
                title: '新增记录成功',
              })
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '新增记录失败'
              })
              console.error('[数据库] [新增记录] 失败：', err)
            }
          })
        }
      }
    })
  },
  onGetUserAvatar: function () {
    const db = wx.cloud.database()
    db.collection('avatarInfo').where({
      _openid: app.globalData.openid
    }).get({
      success: (res) => {
        // 输出 [{ "title": "The Catcher in the Rye", ... }]
        console.log(res)
        this.setData({
          avatarUrl: res.data[0].imgId
        })
        const imgList = [];
        res.data.forEach(item => {
          imgList.push(item.imgId);
        })
        // wx.cloud.getTempFileURL({
        //   fileList: imgList,
        //   success: res => {
        //     // fileList 是一个有如下结构的对象数组
        //     // [{
        //     //    fileID: 'cloud://xxx.png', // 文件 ID
        //     //    tempFileURL: '', // 临时文件网络链接
        //     //    maxAge: 120 * 60 * 1000, // 有效期
        //     // }]
        //     console.log('res.fileList', res.fileList)
        //     this.setData({
        //       avatarUrl: res.fileList[0]
        //     })
        //   },
        //   fail: console.error
        // })
      }
    })
  }
})