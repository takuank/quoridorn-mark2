import { loadYaml } from "@/app/core/File";
import VueI18n from "vue-i18n";

type LangInfo = {
  lang: string;
  path: string;
};

type Message = {
  [lang: string]: any;
};

export type SupportLangInfo = {
  lang: string;
  title: string;
};

export const supportLangList: SupportLangInfo[] = [];

export default class LanguageManager {
  // シングルトン
  public static get instance(): LanguageManager {
    if (!LanguageManager._instance)
      LanguageManager._instance = new LanguageManager();
    return LanguageManager._instance;
  }

  private static _instance: LanguageManager;
  private messages: Message = {};
  private i18n: any = null;

  // コンストラクタの隠蔽
  private constructor() {}

  private async loadLanguage(langInfo: LangInfo) {
    this.messages[langInfo.lang] = await loadYaml(langInfo.path);
  }

  public set language(locale: string) {
    this.i18n.locale = locale;
  }

  public async init() {
    const loadLanguages = async () => {
      supportLangList.push(
        ...((await loadYaml(
          "/static/lang/support-lang-list.yaml"
        )) as SupportLangInfo[])
      );

      // loadLanguageを直列の非同期で全部実行する
      await supportLangList
        .map((langInfo: SupportLangInfo) => () =>
          this.loadLanguage({
            lang: langInfo.lang,
            path: `/static/lang/${langInfo.lang}.yaml`
          })
        )
        .reduce((prev, curr) => prev.then(curr), Promise.resolve());
    };

    await loadLanguages();

    this.i18n = new VueI18n({
      locale: navigator.language,
      fallbackLocale: "en",
      messages: this.messages
    });

    return this.i18n;
  }
}