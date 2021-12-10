import { youdao } from "../lib/YoudaoNote";

export default async function (req, res) {
    let param : any = req.query;
  try {
    await youdao.init();
  } catch (err) {
    res.end(
      JSON.stringify({
        code: 400,
        message: "初始化失败",
        data: null,
      })
    );
    return;
  }
  try {
    let data = await youdao.getFiles(param.id);
    res.send(
      JSON.stringify({
        code: 200,
        message: "获取成功",
        data: data,
      })
    );
    return;
  } catch (err) {
    res.end(
      JSON.stringify({
        code: 400,
        message: "获取失败",
        data: null,
      })
    );
    return;
  }
}
