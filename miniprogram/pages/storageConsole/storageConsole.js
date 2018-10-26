// pages/storageConsole/storageConsole.js

const app = getApp()

Page({

  data: {
    fileID: '',
    cloudPath: '',
    imagePath: '',
    cloudImgs: []
  },

  onLoad: function (options) {

    const {
      fileID,
      cloudPath,
      imagePath,
    } = app.globalData

    this.setData({
      fileID,
      cloudPath,
      imagePath,
    })

    const db = wx.cloud.database()
    db.collection('imgInfo').where({
      _openid: app.globalData.openid
    }).get({
      success: (res) => {
        // 输出 [{ "title": "The Catcher in the Rye", ... }]
        console.log(res)
        const imgList = [];
        res.data.forEach(item => {
          imgList.push(item.imgId);
        })
        wx.cloud.getTempFileURL({
          fileList: imgList,
          success: res => {
            // fileList 是一个有如下结构的对象数组
            // [{
            //    fileID: 'cloud://xxx.png', // 文件 ID
            //    tempFileURL: '', // 临时文件网络链接
            //    maxAge: 120 * 60 * 1000, // 有效期
            // }]
            console.log('res.fileList', res.fileList)
            this.setData({
              cloudImgs: res.fileList
            })
          },
          fail: console.error
        })
      }
    })

    console.group('文件存储文档')
    console.log('https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage.html')
    console.groupEnd()
  },

})