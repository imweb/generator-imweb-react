'use strict';

const fs = require('fs');
const path = require('path');
const Generator = require('yeoman-generator');
const getName = require('imweb-git-user-name');
const moment = require('moment');
const chalk = require('chalk');

const validator = require('../../lib/validator');
const launcher = require('../../lib/launcher');

const FLAG1_LIST = [
  {
    name: '【企鹅辅导】App内嵌',
    value: 22109,
  },
  {
    name: '【企鹅辅导】RN',
    value: 22110,
  },
  {
    name: '【企鹅辅导】PCWeb',
    value: 22111,
  },
  {
    name: '【企鹅辅导】老师端内嵌',
    value: 22112,
  },
  {
    name: '【企鹅辅导】公众号',
    value: 22113,
  },
  {
    name: '【企鹅辅导】运营活动',
    value: 22114,
  },
  {
    name: '【企鹅辅导】小程序',
    value: 22115,
  },
  {
    name: '【企鹅辅导】学生端内嵌',
    value: 22144,
  },
  {
    name: '其他',
    value: -1,
  },
];
const DOMAIN = {
  22109: 'fudao.qq.com/h5/',
  22110: 'fudao.qq.com/rn/',
  22111: 'fudao.qq.com/pc/',
  22112: 'fudao.qq.com/teacher/',
  22113: 'fudao.qq.com/wx/',
  22114: 'fudao.qq.com/act/',
  22115: 'fudao.qq.com/wxapp/',
  22144: 'fudao.qq.com/student/',
};
const FLAG2 = '1';
const DSTR_LIST = [
  {
    name: JSON.stringify(['离线包', '非离线包', '直出']),
    value: encodeURIComponent(JSON.stringify(['离线包', '非离线包', '直出'])),
  },
  {
    name: '无',
    value: '',
  },
];
const PSTR = encodeURIComponent(
  JSON.stringify(['页面开始', '白屏结束', 'html结束', '主逻辑开始', '主逻辑结束', '首屏cgi拉取', '首屏渲染'])
);

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.distHtmlPath = path.resolve(this.destinationPath('src'));
    this.distPageResourcePath = path.resolve(this.destinationPath('src/pages'));

    this.userName = getName() || getName(true);
  }

  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'pageDesc',
        message: 'Input the name of the page which display in wang system:',
      },
      {
        type: 'input',
        name: 'pageName',
        message: 'Input the name of the page for [m.ke.qq.com/${???}.html]:',
        validate: (v, ans) => {
          v = v.trim();
          if (!validator.pageName(v)) {
            return `pageName [${v}] is invalid, the test [/^[0-9a-z][0-9a-zA-Z]*$/] failed`;
          }

          if (!validator.fileExist(v, this.destinationPath('src/pages'))) {
            return `page [${v}] is not existed`;
          }

          return true;
        },
      },
      {
        type: 'list',
        name: 'flag1',
        message: 'Choose the project:',
        choices: FLAG1_LIST,
      },
      {
        type: 'input',
        name: 'flag1Other',
        message: 'Input the flag1:',
        when: (answers) => {
          return answers.flag1 === -1;
        },
      },
      {
        type: 'list',
        name: 'dStr',
        message: 'Choose the dimensionality of page:',
        choices: DSTR_LIST,
      },
      {
        type: 'input',
        name: 'flag3',
        message: 'Input the flag3 value[在页面提示的最后一行中可以找到]:',
        validate: (v) => {
          if (!/\d+/.test(v)) {
            return `flag3 [${v}] must be number!`;
          }

          return true;
        },
        when: (answers) => {
          const { pageDesc, pageName, flag1Other, flag1, dStr } = answers;
          const f1 = flag1Other || flag1;
          const domain = DOMAIN[f1] || 'fudao.qq.com/';

          // launch chrome to add Speed Page
          const url = `http://wang.oa.com/h5/?appid=20466&f1=${f1}&f2=${FLAG2}&pn=${encodeURIComponent(
            pageDesc.trim()
          )}&pfn=${encodeURIComponent(pageName.trim())}&domain=${encodeURIComponent(
            domain
          )}&d=${dStr}&p=${PSTR}#/rum/speed`;
          launcher.chrome(url);

          return true;
        },
      },
    ];

    return this.prompt(prompts).then((props) => {
      props.pageDesc = props.pageDesc.trim();
      props.pageName = props.pageName.trim();
      if (props.flag1Other) {
        props.flag1 = props.flag1Other;
      }

      this.props = props;
    });
  }

  writing() {
    const { pageName, flag1, flag3, dStr } = this.props;

    const indexFilePath = this.destinationPath(`src/pages/${this.props.pageName}/index.html`);
    const cnt = fs.readFileSync(indexFilePath, 'utf-8');
    fs.writeFileSync(
      indexFilePath,
      cnt
        .replace(/\{% block timingId %\}[^{]*\{% endblock %\}/, '')
        .replace(/\{% block timingIdSvrRender %\}[^{]*\{% endblock %\}/, '') +
        `\n{% block timingId %}${flag1}-${FLAG2}-${flag3}{% endblock %}` +
        (dStr ? `\n{% block timingIdSvrRender %}${flag1}-${FLAG2}-${+flag3 + 2}{% endblock %}` : ''),
      'utf-8'
    );
  }

  end() {
    if (this.errFlag) {
      this.log(`[Error] ${this.errMsg}`);
    } else {
      this.log(
        `add speed report config [${chalk.green(
          this.props.flag1 + '-' + FLAG2 + '-' + this.props.flag3
        )}] to page ${chalk.green(this.props.pageDesc)}[${chalk.green(this.props.pageName)}] success!`
      );
    }
  }
};
