import { Base } from '../../utils/base.js';
class News extends Base {
  constructor() {
    super();
  }
  getNewsData(id,callback){
    var param = {
      url: 'news/list.do',
      data:{offset:0,limit:2},
      type:'POST',
      sCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }
}
export { News }