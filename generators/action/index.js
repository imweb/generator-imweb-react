'use strict';

const fs = require('fs');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');

const validator = require('../../lib/validator');

function getActionCreatorStr(name, type, isAsync) {
  if (isAsync) {
    return `function ${name}() {\n  return (dispatch) => {\n  };\n}`;
  }

  return `function ${name}() {\n  return {\n    type: ${type},\n  };\n}`;
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'pageName',
        message: 'page name:',
        validate: (v) => {
          v = v.trim();

          if (!validator.pageName(v)) {
            return `pageName [${v}] 非法, 名字必须符合：[/^[0-9a-z][0-9a-zA-Z]*$/]`;
          }

          if (!validator.fileExist(v, this.destinationPath('src/pages'))) {
            return `页面 [${v}] 不存在！`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'creatorName',
        message: 'action creator name:',
        validate: (v) => {
          v = v.trim();

          if (!validator.pageName(v)) {
            return `action creator 名字 [${v}] 非法, 名字必须符合：[/^[0-9a-z][0-9a-zA-Z]*$/]`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'actionType',
        message: 'action type:',
        validate: (v) => {
          v = v.trim();

          if (!validator.notEmpty(v)) {
            return `action type 不能为空！`;
          }

          return true;
        },
      },
      {
        type: 'confirm',
        name: 'isAsync',
        message: 'is async?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'useCode',
        message: 'use vscode?',
        default: true,
      },
    ];

    return this.prompt(prompts).then((props) => {
      props.pageName = props.pageName.trim();
      props.creatorName = props.creatorName.trim();
      props.actionType = props.actionType.trim().toUpperCase();

      this.props = props;
    });
  }

  writing() {
    const actionCreatorFilePath = this.destinationPath(`src/pages/${this.props.pageName}/action_creators.js`);
    const actionTypeFilePath = this.destinationPath(`src/pages/${this.props.pageName}/const.js`);
    const reducerFilePath = this.destinationPath(`src/pages/${this.props.pageName}/reducer.js`);

    // add action type
    let cnt = fs.readFileSync(actionTypeFilePath, 'utf-8');
    fs.writeFileSync(
      actionTypeFilePath,
      cnt.replace(
        '/* action type consts */',
        `${this.props.actionType}: '${this.props.actionType}',\n  /* action type consts */`
      ),
      'utf-8'
    );

    // add action creator
    cnt = fs.readFileSync(actionCreatorFilePath, 'utf-8');
    cnt = cnt
      .replace('// import {', 'import {')
      .replace("// } from './const';", "} from './const';")
      .replace("} from './const';", `  ${this.props.actionType},\n} from './const';`)
      .replace('export default {', `export default {\n  ${this.props.creatorName},`)
      .replace(
        '/* actions creators end */',
        `\n${getActionCreatorStr(this.props.creatorName, this.props.actionType, this.props.isAsync)}\n/* actions creators end */`
      );
    fs.writeFileSync(actionCreatorFilePath, cnt, 'utf-8');
    this.props.useCode && shelljs.exec(`code ${actionCreatorFilePath}`);

    // add reducer
    cnt = fs.readFileSync(reducerFilePath, 'utf-8');
    cnt = cnt
      .replace('// import {', 'import {')
      .replace("// } from './const';", "} from './const';")
      .replace("} from './const';", `  ${this.props.actionType},\n} from './const';`)
      .replace(
        '/* process action here */',
        `/* process action here */\n    case ${this.props.actionType}:\n      break;`
      );
    fs.writeFileSync(reducerFilePath, cnt, 'utf-8');
    this.props.useCode && shelljs.exec(`code ${reducerFilePath}`);
  }

  end() {
    this.log(`创建 action ${chalk.green(`${this.props.creatorName}`)} 成功!`);
  }
};
