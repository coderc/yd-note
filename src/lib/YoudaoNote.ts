import got from "got/dist/source";
import { v4 } from "uuid";

interface NFile {
  path: string;
  download: string;
  name: string;
  size: number;
  isDir: boolean;
  fid: string;
  md5: string;
  author: string;
  origin: string;
  profiles: string;
  viewUrl: string | null,
  createTime: number,
  updateTime: number
}

export class YoudaoNote {
  // 用户信息
  private info: any = {};
  // 这个是分享的密钥shareKey
  private shareKey: string = "";
  // 这是唯一随机id
  private gid: string = "";
  // cookie
  private cookie: string = "";
  // fid
  private fid: string = "";
  // 分享的链接
  private shareUrl : string = "";

  constructor(url : string){
    this.shareUrl = url;
  }

  public async init() {
    // 先获取id
    let one_res = await got(this.shareUrl, {
      followRedirect: false,
    });
    // 赋值id
    let shareKey = (this.shareKey = one_res.headers["location"]?.split(
      "id="
    )[1] as string);
    // 随机的id
    this.gid = v4();

    // 首先先回到首页
    await this.gotoRoot();
  }

  /**
   * 回到首页
   */
  private async gotoRoot() {
    //https://note.youdao.com/yws/api/personal/share?method=get&shareKey=e0d13592fdb0d8e212b64c65cd9fca71&unloginId=737df993-7d1b-2b40-403b-cc26d3df5332
    let infoRes = await got(
      "https://note.youdao.com/yws/api/personal/share?method=get&shareKey=" +
        this.shareKey +
        "&unloginId=" +
        this.gid,
      {
        throwHttpErrors: false,
        responseType: "json",
      }
    );
    let info: any = (this.info = infoRes.body);
    this.fid = info.entry.id;
  }
  /**
   * 前进到某个id
   * @param dirid
   */
  async goto(dirid: string) {
    this.fid = dirid;
  }

  async getFiles(dirid?: string) {
    if (!dirid) dirid = this.fid;
    if (!dirid) {
      console.log("没有设置id并且父级id不存在");
      return null;
    }
    console.log(
      "https://note.youdao.com/yws/public/notebook/" +
        this.shareKey +
        "/subdir/" +
        dirid
    );

    let res = await got(
      "https://note.youdao.com/yws/public/notebook/" +
        this.shareKey +
        "/subdir/" +
        dirid,
      {
        responseType: "json",
        throwHttpErrors: false,
      }
    );
    let data: any[] = res.body as any[];
    let dataList: any[] = data[2];
    let flist: NFile[] = dataList.map((info) => {
      let path: string = info.p;
      console.log(info);
      
      let fid: string = path.split("/").pop() as string;
      let shareKey: string = this.shareKey;
      let nfile: NFile = {
        path: path,
        download: `https://note.youdao.com/yws/api/personal/file/${fid}?method=download&inline=true&shareKey=${shareKey}&cstk=false`,
        name: info.tl,
        size: info.sz,
        isDir: info.dr ? true : false,
        fid: fid,
        md5: info.checksum ?? "",
        author: info.au,
        origin: info.su,
        profiles: info.pp.dg ?? "",
        viewUrl: /\.(note|md)$/.test(info.tl) ? `https://note.youdao.com/ynoteshare/index.html?id=${shareKey}&type=notebook&_time=1639117913507#/${fid}` : null,
        createTime: info.ct,
        updateTime: info.mt
      };
      return nfile;
    });
    return flist;
  }
  /**
   * 获取文件内容
   * @param fid
   * @returns
   */
  async getFileContent(fid: string) {
    if (!this.gid) {
      console.log("gid 无法读取");
      return;
    }
    try {
      let data = await got(
        "https://note.youdao.com/yws/api/personal/file/" +
          fid +
          "?method=read&shareKey=" +
          this.shareKey +
          "&cstk=false",
        {
          throwHttpErrors: false,
        }
      );
      return data.body;
    } catch (e) {
      console.log("这个文件无法下载");
      return null;
    }
  }
  // async getNoteContent(fid: string) {
  //   function getVal(content: any, index: number) {
  //     let keys = Object.keys(content);
  //     return content[keys[index]];
  //   }
  //   let res = await got(
  //     `https://note.youdao.com/yws/api/note/${this.shareKey}/${fid}?sev=j1&editorType=1&unloginId=${this.gid}&editorVersion=new-json-editor`,
  //     {
  //       responseType: "json",
  //     }
  //   );
  //   let data: any = res.body;
  //   let content: any = JSON.parse(data.content);
  //   let list = content[5];

  //   return ContentTransform.parse(list);
  // }
}


export let youdao = new YoudaoNote("https://note.youdao.com/s/PxzWZMCW");