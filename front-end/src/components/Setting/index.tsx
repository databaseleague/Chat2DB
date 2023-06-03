import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import styles from './index.less';
import classnames from 'classnames';
import Iconfont from '@/components/Iconfont';
import { Modal, Radio, Input, message, Select, Tooltip, Button } from 'antd';
import i18n from '@/i18n';
import configService, { IChatgptConfig } from '@/service/config';
import { ThemeType } from '@/constants'
import miscService from '@/service/misc';
import BrandLogo from '@/components/BrandLogo';
import themeDarkImg from '@/assets/images/theme-dark.png';
import themeLightImg from '@/assets/images/theme-light.png';
import themeAutoImg from '@/assets/images/theme-auto.png';
import { getOsTheme } from '@/utils';
import { useTheme } from '@/utils/hooks';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

interface IProps {
  className?: string;
  text?: string;
}

export enum AiSqlSourceType {
  OPENAI = 'OPENAI',
  RESTAI = 'RESTAI'
}

const colorList = [
  {
    code: 'polar-green',
    name: '极光绿',
    color: '#1d3712'

  },
  {
    code: 'polar-blue',
    name: '蓝蓬釉',
    color: '#1a90ff'
  },
  {
    code: 'golden-purple',
    name: '酱紫',
    color: '#301c4d'
  },
  {
    code: 'sunset-orange',
    name: '日暮',
    color: "#593815"
  },
];

const themeList = [
  {
    code: ThemeType.Dark,
    name: '暗色',
    img: themeDarkImg
  },
  {
    code: ThemeType.Light,
    name: '亮色',
    img: themeLightImg
  },
  {
    code: ThemeType.FollowOs,
    name: '自动',
    img: themeAutoImg
  },
  // {
  //   code: 'eyeshield',
  //   name: '护眼',
  //   img: 'https://img.alicdn.com/imgextra/i1/O1CN01KGCqY21uJpuFjEQW2_!!6000000006017-2-tps-181-135.png'
  // },
];


export const colorSchemeListeners: { [key: string]: ((theme: ThemeType) => void) } = {};

export function addColorSchemeListener(callback: (theme: ThemeType) => void) {
  const uuid = uuidv4();
  colorSchemeListeners[uuid] = callback;
  return uuid
}

const menusList = [
  {
    label: '基础设置',
    icon: '\ue795',
    body: <BaseBody />
  },
  {
    label: '自定义AI',
    icon: '\ue646',
    body: <SettingAI />,
  },
  {
    label: '代理设置',
    icon: '\ue63f',
    body: <ProxyBody />
  },
  {
    label: '关于Chat2DB',
    icon: '\ue60c',
    body: <AboutUs />
  },
]

export default memo<IProps>(function Setting({ className, text }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(menusList[0]);
  const [, setAppTheme] = useTheme();

  // 监听系统(OS)主题变化
  useLayoutEffect(() => {
    function change(e: any) {
      setAppTheme(e.matches ? ThemeType.Dark : ThemeType.Light)
    }

    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    themeMedia.addListener(change);
    return () => {
      themeMedia.removeListener(change)
    }
  }, [])

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  function changeMenu(t: any) {
    setCurrentMenu(t);
  }

  return (
    <>
      <div className={classnames(className, styles.box)} onClick={showModal}>
        {
          text ?
            <span className={styles.setText}>{text}</span>
            :
            <Iconfont code="&#xe795;"></Iconfont>
        }
      </div>
      <Modal
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={800}
        maskClosable={false}
      >
        <div className={styles.modalBox}>
          <div className={styles.menus}>
            <div className={classnames(styles.menusTitle)}>
              设置
            </div>
            {
              menusList.map((t, index) => {
                return <div key={index} onClick={changeMenu.bind(null, t)} className={classnames(styles.menuItem, { [styles.activeMenu]: t.label === currentMenu.label })}>
                  <Iconfont code={t.icon} />
                  {t.label}
                </div>
              })
            }
          </div>
          <div className={styles.menuContent}>
            <div className={classnames(styles.menuContentTitle)}>
              {currentMenu.label}
            </div>
            {currentMenu.body}
          </div>
        </div>
      </Modal>
    </>
  );
});

// openAI 的设置项
export function SettingAI() {
  const [, setAppTheme] = useTheme();
  const [chatgptConfig, setChatgptConfig] = useState<IChatgptConfig>({
    apiKey: '',
    httpProxyHost: '',
    httpProxyPort: '',
    restAiUrl: '',
    apiHost: '',
    restAiStream: true,
    aiSqlSource: ''
  });

  useEffect(() => {
    configService.getChatGptSystemConfig().then((res: any) => {
      setChatgptConfig({
        ...res,
        restAiStream: res.restAiStream || true,
        aiSqlSource: res.aiSqlSource || AiSqlSourceType.OPENAI,
      })
    })
  }, [])

  function changeChatgptApiKey() {
    // if (!chatgptKey) {
    //   message.error('请输入ChatGPT-apiKey')
    //   return
    // }
    // apiHost的最后必须为/
    const newChatgptConfig = { ...chatgptConfig }
    if (newChatgptConfig.apiHost && !newChatgptConfig.apiHost?.endsWith('/')) {
      newChatgptConfig.apiHost = newChatgptConfig.apiHost + '/'
    }
    configService.setChatGptSystemConfig(newChatgptConfig).then(res => {
      message.success('配置成功')
    })
  }

  return <>
    <div className={styles.aiSqlSource}>
      <div className={styles.aiSqlSourceTitle}>
        AI来源:
      </div>
      <Radio.Group onChange={(e) => { setChatgptConfig({ ...chatgptConfig, aiSqlSource: e.target.value }) }} value={chatgptConfig.aiSqlSource}>
        <Radio value={AiSqlSourceType.OPENAI}>Open Ai</Radio>
        <Radio value={AiSqlSourceType.RESTAI}>自定义</Radio>
      </Radio.Group>
    </div>
    {
      chatgptConfig.aiSqlSource === AiSqlSourceType.OPENAI && <div>
        <div className={styles.title}>
          Api Key
        </div>
        <div className={classnames(styles.content, styles.chatGPTKey)}>
          <Input placeholder='使用OpenAi接口时必填，可前往OpenAI官网查看APIKEY' value={chatgptConfig.apiKey} onChange={(e) => { setChatgptConfig({ ...chatgptConfig, apiKey: e.target.value }) }} />
        </div>
        <div className={styles.title}>
          Api Host
        </div>
        <div className={classnames(styles.content, styles.chatGPTKey)}>
          <Input placeholder='非必填，默认值为 https://api.openai.com/' value={chatgptConfig.apiHost} onChange={(e) => { setChatgptConfig({ ...chatgptConfig, apiHost: e.target.value }) }} />
        </div>
        <div className={styles.title}>
          HTTP Proxy Host
        </div>
        <div className={classnames(styles.content, styles.chatGPTKey)}>
          <Input placeholder='非必填，用于设置请求OPENAI接口时的HTTP代理host' value={chatgptConfig.httpProxyHost} onChange={(e) => { setChatgptConfig({ ...chatgptConfig, httpProxyHost: e.target.value }) }} />
        </div>
        <div className={styles.title}>
          HTTP Proxy Prot
        </div>
        <div className={classnames(styles.content, styles.chatGPTKey)}>
          <Input placeholder='非必填，用于设置请求OPENAI接口时的HTTP代理port' value={chatgptConfig.httpProxyPort} onChange={(e) => { setChatgptConfig({ ...chatgptConfig, httpProxyPort: e.target.value }) }} />
        </div>
      </div>
    }
    {
      chatgptConfig.aiSqlSource === AiSqlSourceType.RESTAI && <div>
        <div className={styles.title}>
          自定义接口Url
        </div>
        <div className={classnames(styles.content, styles.chatGPTKey)}>
          <Input placeholder='选择自定义AI时必填，用于设置自定义AI的REST接口URL' value={chatgptConfig.restAiUrl} onChange={(e) => { setChatgptConfig({ ...chatgptConfig, restAiUrl: e.target.value }) }} />
        </div>
        <div className={styles.title}>
          接口是否流式输出
        </div>
        <div className={classnames(styles.content)}>
          <Radio.Group onChange={(e) => { setChatgptConfig({ ...chatgptConfig, restAiStream: e.target.value }) }} value={chatgptConfig.restAiStream}>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </div>
      </div>
    }
    <div className={styles.bottomButton}>
      <Button type="primary" onClick={changeChatgptApiKey}>应用</Button>
    </div>
  </>
}

// baseBody 基础设置
export function BaseBody() {
  const [lang, setLang] = useState(localStorage.getItem('lang'));
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme'));
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState(localStorage.getItem('primary-color'));
  const [appTheme, setAppTheme] = useTheme();

  const changePrimaryColor = (item: any) => {
    const html = document.documentElement;
    html.setAttribute('primary-color', item.code);
    localStorage.setItem('primary-color', item.code);
    setCurrentPrimaryColor(item.code)
  };

  function changeLang() {
    const lang = localStorage.getItem('lang') === 'en' ? 'zh-cn' : 'en'
    localStorage.setItem('lang', lang);
    location.reload();
  }

  function handleChangeTheme(theme: ThemeType) {
    setAppTheme(theme, () => { setCurrentTheme(theme) });
  }

  return <>
    <div className={styles.title}>
      {i18n('common.text.background')}
    </div>
    <ul className={styles.backgroundList}>
      {themeList.map(t => {
        return (
          <div key={t.code} className={styles.themeItemBox}>
            <div className={classnames({ [styles.current]: currentTheme == t.code })} onClick={handleChangeTheme.bind(null, t.code)} style={{ backgroundImage: `url(${t.img})` }} />
            {t.name}
          </div>
        );
      })}
    </ul>
    <div className={styles.title}>
      {i18n('common.text.language')}
    </div>
    <div>
      <Radio.Group onChange={changeLang} value={lang}>
        <Radio value='zh-cn'>{i18n('common.text.zh-cn')}</Radio>
        <Radio value='en'>{i18n('common.text.en')}</Radio>
      </Radio.Group>
    </div>
    {/* <div className={styles.title}>
    主题色
  </div>
  <ul className={styles.primaryColorList}>
    {colorList.map((item) => {
      return (
        <li key={item.code} onClick={changePrimaryColor.bind(null, item)} style={{ backgroundColor: item.color }}>
          {currentPrimaryColor == item.code && <Iconfont code="&#xe617;"></Iconfont>}
        </li>
      );
    })}
  </ul> */}
  </>
}

// 代理设置
export function ProxyBody() {
  const [apiPrefix, setApiPrefix] = useState(window._BaseURL);
  const [, setAppTheme] = useTheme();

  function updateApi(e: any) {
    console.log(e.target.value)
    setApiPrefix(e.target.value)
  }

  function affirmUpdateApi() {
    if (!apiPrefix) {
      return
    }
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('GET', `${apiPrefix}/api/system/get-version-a`);
    xhr.onload = function () {
      if (xhr.status === 200) {
        localStorage.setItem('_BaseURL', apiPrefix);
        location.reload();
      } else {
        message.error('接口测试不通过')
      }
    };
    xhr.send();
  }

  return <>
    <div className={styles.title}>
      后台服务地址
    </div>
    <div className={classnames(styles.content, styles.chatGPTKey)}>
      <Input value={apiPrefix} onChange={updateApi} />
    </div>
    <div className={styles.bottomButton}>
      <Button type="primary" onClick={affirmUpdateApi}>应用</Button>
    </div>
  </>
}

// 关于我们
function AboutUs() {
  const [, setAppTheme] = useTheme();
  return <div className={styles.aboutUs}>
    <BrandLogo size={60} className={styles.brandLogo} />
    <div className={styles.brief}>
      <div className={styles.appName}>Chat2DB</div>
      <div className={styles.env}>
        当前环境:{window._ENV}
      </div>
      <div className={styles.version}>
        当前版本:v{__APP_VERSION__} build {__BUILD_TIME__}
      </div>
      <a target='blank' href='https://github.com/alibaba/Chat2DB/blob/main/CHANGELOG.md' className={styles.log}>
        查看更新日志
      </a>
    </div>
  </div>
}
