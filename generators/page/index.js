'use strict';

const Generator = require('yeoman-generator');
const getName = require('imweb-git-user-name');
const chalk = require('chalk');
const shelljs = require('shelljs');

const validator = require('../../lib/validator');

const assets = [
  'action_creators.js',
  'const.js',
  'Container.jsx',
  'index.jsx',
  'index.scss',
  'reducer.js',
  'store.js',
];

const tpls = ['index.html'];

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.userName = getName() || getName(true);
  }

  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'pageName',
        message: '页面名字:',
        validate: (v) => {
          v = v.trim();

          if (!validator.pageName(v)) {
            return `页面名字 [${v}] 非法, 名字必须符合：[/^[0-9a-z][0-9a-zA-Z]*$/]`;
          }

          if (validator.fileExist(v, this.destinationPath('src/pages'))) {
            return `页面 [${v}] 已经存在`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'pageTitle',
        message: '页面 title:',
      },
      {
        type: 'confirm',
        name: 'useCode',
        message: 'use vscode?',
        default: true,
      },
      {
        type: 'input',
        name: 'author',
        message: '作者:',
        validate: (v) => {
          if (!validator.notEmpty(v)) {
            return 'Author can not be null';
          }

          return true;
        },
        when: () => {
          return !this.userName;
        },
      },
    ];

    return this.prompt(prompts).then((props) => {
      props.pageName = props.pageName.trim();
      props.pageTitle = props.pageTitle.trim();
      if (!props.author) {
        props.author = this.userName;
      }

      this.props = props;
    });
  }

  writing() {
    assets.forEach((item) => {
      this.fs.copy(this.templatePath(item), this.destinationPath(`src/pages/${this.props.pageName}/${item}`));
    });

    tpls.forEach((item) => {
      this.fs.copyTpl(this.templatePath(item), this.destinationPath(`src/pages/${this.props.pageName}/${item}`), this.props);
    });

    if (this.props.useCode) {
      shelljs.exec(`code ${this.destinationPath(`src/pages/${this.props.pageName}/index.scss`)}`);
      shelljs.exec(`code ${this.destinationPath(`src/pages/${this.props.pageName}/Container.jsx`)}`);
    }
  }

  end() {
    this.log(`创建页面 ${chalk.green(`${this.props.pageName}`)} 成功!`);
  }
};
