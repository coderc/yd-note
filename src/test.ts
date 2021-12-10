let eventMap = new Map<
  string,
  (
    item: any,
    tag: string,
    contents: any[],
    cb: (line: OrderItem) => any,
    orderList?: OrderList
  ) => any
>();

// 处理文本
eventMap.set("text", (item, tag, contents, cb) => {
  let line = "<p>";
  // 如果有内容则对内容进行操作
  for (let content of contents) {
    // 文字处理
    if (content["7"] == undefined) {
      let hfun = eventMap.get("li");
      if (hfun) {
        line += hfun(content, "", content, (line) => {
          return line.data;
        });
      }
    } else {
      line += ContentTransform.text(content["7"]);
    }
  }
  line += "</p>";
  return cb({
    data: line,
    tag: "text",
  });
});

// 链接 传给 content参数
/**
 * {
  '2': '3',
  '3': 'D4F2-1639029083595',
  '4': { hf: 'http://baidu.com' },
  '5': [ { '2': '2', '3': 'Ro8E-1639029083594', '7': [Array] } ],      
  '6': 'li'
}
 */
eventMap.set("li", (item, tag, contents, cb) => {
  let line = "";
  let links: any;

  if ((links = item["5"])) {
    let attr = item[4];
    line += `<a href="${attr.hf}" class="link">`;
    for (let link of links) {
      line += ContentTransform.text(link[7]);
    }
    line += "</a>";
  }
  return cb({
    data: line,
    tag: "li",
  });
});

// 处理引用
eventMap.set("q", (item, tag, contents, cb) => {
  let line = '<div class="quote">';
  for (let content of contents) {
    let disc = "";
    let scontent = content[5] ?? [];
    line += "<p>";
    for (let stxt of scontent) {
      let texts = stxt[7] ?? [];
      line += ContentTransform.text(texts);
    }
    line += "</p>";
  }
  line += "</div>";
  return cb({
    data: line,
    tag: "q",
  });
});

// 列表
let ul: DataIndex[] = [];
let ol: DataIndex[] = [];
eventMap.set("l", (item, tag, _contents, cb, orderList) => {
  let contents = item[5];
  let line = "<li>";
  for (let content of contents) {
    line = ContentTransform.text(content[7]);
  }
  line += "</li>";
  return cb({
    data: line,
    tag: "li",
  });
});

// 横线
eventMap.set("hr", (item, tag, _contents, cb, orderList) => {
  return cb({
    data: '<hr class="line" />',
    tag: "hr",
  });
});

// 标题
eventMap.set("h", (item, tag, contents, cb, orderList) => {
  let head = item[4]["l"];
  let line = `<${head}>`;
  // for()
  for (let content of contents) {
    let texts = content[7];
    line += ContentTransform.text(texts);
  }
  line += `</${head}>`;
  return cb({
    data: line,
    tag: head,
  });
});

// 任务列表
eventMap.set("td", (item, tag, contents, cb, orderList) => {
  let attr = item[4];
  let classes = attr["c"] ? "active" : "";

  let line = `<div class="todo" class="${classes}">`;
  for (let content of contents) {
    let texts = content[7];
    line += ContentTransform.text(texts);
  }
  line += "</div>";
  return cb({
    data: line,
    tag: "todo",
  });
});

// 代码
eventMap.set("cd", (item, tag, contents, cb, orderList) => {
  // 编程语言
  let language: string = item[4]["la"];
  let line: string = `<code class="${language}">`;
  let temp: string[] = [];
  for (let content of contents) {
    let texts = content[5];
    let tline = "";
    for (let text of texts) {
      tline += ContentTransform.text(text[7], false);
    }
    temp.push(tline);
  }
  line += temp.join("\n");
  line += `</code>`;
  return cb({
    data: line,
    tag: "code",
  });
});

// 这个是文件的
eventMap.set("a", (item, tag, _contents, cb, orderList) => {
  let content = item[4];
  let line = `<div class="file">`;
  line += `
    <div class="header">
      <div class="avatar">
          <img src="${content.sr}" />
      </div>
      <div class="title">
          <span>${content.fn}</span>
      </div>
    </div>
    <div class="content">
      <div class="size">
          <span>${content.fl}</span>
      </div>
      <div class="download">
          <a href="${content.re}">下载</a>
      </span>
    </div>
    `;
  line += "</div>";
  return cb({
    data: line,
    tag: "file",
  });
});

// 任务列表
eventMap.set("t", (item, tag, contents, cb, orderList) => {
  let line = "<table>";
  for (let tr of contents) {
    let trl = "<tr>";
    let tcs = tr[5];
    for (let tc of tcs) {
      //   console.log(tc);
      let tds = tc[5];
      trl += "<td>";
      for (let td of tds) {
        let tag = td[6];
        if (tag === "a") {
          let func = eventMap.get("a");
          if (func) {
            let res = func(td, tag, td, (line) => {
              return line.data;
            });
            trl += res;
          }
        } else {
          // console.log(JSON.stringify(td));
          if (td[5]) {
            for (let std of td[5]) {
              let tf = std[7];
              let link = std[6];
              if (link === "li") {
                let func = eventMap.get("li");
                if (func) {
                  trl += func(std, "", std, (line) => {
                    return line.data;
                  });
                }
              }
              if (tf) {
                trl += ContentTransform.text(tf);
              }
            }
          }
        }
      }
      trl += "</td>";
    }
    trl += "</tr>";
    line += trl;
  }

  line += "</table>";
  return cb({
    data: line,
    tag: "table",
  });
});

// 图片
eventMap.set("im", (item, tag, contents, cb, orderList) => {
  let line = `<div class="image">`;
  let attr = item[4];
  if (attr) {
      line += `<img src="${attr["u"]}" width="${attr["w"]}" height="${attr["h"]}" />`
  }
  line += "</div>";
  cb({
      data: line,
      tag: "image"
  })
});

// 任务列表
// eventMap.set("cd", (item, tag, contents, cb, orderList) => {
//   // 编程语言
//   let language: string = item[4]["la"];
//   let line: string = `<code class="${language}">`;
//   let temp: string[] = [];
//   for (let content of contents) {
//     let texts = content[5];
//     let tline = "";
//     for (let text of texts) {
//       tline += ContentTransform.text(text[7], false);
//     }
//     temp.push(tline);
//   }
//   line += temp.join("\n");
//   line += `</code>`;
//   return cb({
//     data: line,
//     tag: "code",
//   });
// });

export class ContentTransform {
  static parse(list: any[]): string {
    let orderList = new OrderList();
    for (let item of list) {
      // 当前行
      let line = "";
      // 标签
      let tag = item["6"] ?? "text"; // tag 代表是什么类型，默认是文字
      // 内容
      let contents = item["5"] ?? [];

      let func = eventMap.get(tag);
      if (func) {
        func(
          item,
          tag,
          contents,
          (sline: OrderItem) => {
            orderList.add(sline);
          },
          orderList
        );
      } else {
        console.log(tag);
      }
    }
    let data: string = orderList
      .getList()
      .map((e) => e.data.replace(/(class|style)=\"\"[\s]?/g, ""))
      .join("\n");
    return data;
  }
  static text(v: any[], isStyle: boolean = true) {
    let result = "";
    // 循环内可能存在的文本
    // v : [ { '8': '法撒旦范德萨发士大夫', '9': [ [Object] ] } ]
    for (let item of v) {
      // 下面的内容
      if (item["8"]) {
        // 用于存储类
        let classes: string[] = [];
        // 用于存储样式
        let style: string[] = [];
        let textStyle = item[9] ?? [];
        let child = "";

        // style 和 class
        if (isStyle) {
          for (let cls of textStyle) {
            if (cls[2] == "u") classes.push("text-underline");
            if (cls[2] == "i") classes.push("text-italic");
            if (cls[2] == "bg") style.push("background: " + cls[0]);
            if (cls[2] == "d") classes.push("text-del");
            if (cls[2] == "b") classes.push("text-bold");
            if (cls[2] == "ff") style.push("font-family: '" + cls[0] + "'");
            if (cls[2] == "c") style.push("color: " + cls[0]);
          }

          child =
            '<span class="' +
            classes.join(" ") +
            '" style="' +
            style.join("; ") +
            '">' +
            item[8] +
            "</span>";
        } else {
          child = item[8];
        }
        result += child;
      }
    }
    return result;
  }
}

class OrderList {
  private list: OrderItem[] = [];
  // 查询某个id对应的
  getToId(tag: string): {
    index: number;
    data: OrderItem;
  } | null {
    let list = this.list;
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item.tag === tag) {
        return {
          index: i,
          data: item,
        };
      }
    }
    return null;
  }
  add(data: OrderItem) {
    this.list.push(data);
  }
  addToId(index: number, data: OrderItem) {
    let list = this.list;
    if (index >= 0) {
      list.splice(index + 1, 0, data);
      return true;
    } else {
      return false;
    }
  }
  // 获取列表
  getList() {
    return this.list;
  }
}

interface OrderItem {
  data: string;
  tag: string;
}

interface DataIndex {
  data: any[];
  index: number;
}
