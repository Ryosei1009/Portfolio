import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useAutoSave } from '../../../utils/useAutoSave'
import SaveStatus from '../../_utils/SaveStatus'
import { EditButton, EditPanel, TextField } from '../../_utils/EditControls'
import GitHubIcon from '../../_utils/GitHubIcon'

// 設定がまだ読み込めていないとき（または読み込めなかったとき）に使う文言
const DEFAULT_SETTINGS = {
  hero_label: 'Portfolio',
  hero_catchphrase: '情報技術を活用した／社会課題の解決を目指す、／大学2年生',
  hero_github_url: 'https://github.com/Ryosei1009',
  hero_image_alt: '海辺の岩場に座って海を眺める写真',
}
const DEFAULT_NAME = { name: '篠原 諒成', sub_name: 'Shinohara Ryosei' }

const saveSettings = (values) => (
  axios.post(`${process.env.REACT_APP_API_DOMAIN}/settings/update`, { values }, {
    headers: {
      'Authorization': localStorage.getItem('token')
    }
  })
)

const TopBanner = ({ isAuth, profile }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isEditing, setIsEditing] = useState(false)
  const { status, flush, reset } = useAutoSave(settings, saveSettings)
  const panelRef = useRef(null)

  // 編集欄はトップ画面の下に開くので、開いたら見える位置まで移動する
  useEffect(() => {
    if (isEditing) panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [isEditing])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/settings/get`)
        if (!response.ok) return
        const next = { ...DEFAULT_SETTINGS, ...(await response.json()) }
        // 読み込んだ値は保存済みとして扱う
        reset(next)
        setSettings(next)
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const update = (key) => (value) => setSettings((prev) => ({ ...prev, [key]: value }))
  const name = profile?.name || DEFAULT_NAME.name
  const subName = profile?.sub_name || DEFAULT_NAME.sub_name

  return (
    <>
      <div id="top" className="min-h-screen pt-16 pb-8 flex max-md:flex-col-reverse justify-center items-center bg-white">
        <div className="w-1/2 max-md:w-full pl-8 pr-8 max-lg:pl-4 max-lg:pr-3 max-md:px-4 max-md:pt-4 flex justify-end max-md:justify-center">
          <div className="flex flex-col items-start max-md:items-center text-start max-md:text-center">
            <div className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">
              {settings.hero_label}
            </div>
            <h1 className="mt-2 text-6xl max-xl:text-5xl max-sm:text-4xl font-bold">
              {name}
            </h1>
            <div className="mt-1 text-2xl max-xl:text-xl max-sm:text-lg font-bold text-gray-600">
              {subName}
            </div>
            <div className="phrase-wrap mt-6 max-md:mt-4 text-xl max-xl:text-lg max-sm:text-base font-medium leading-relaxed">
              {/* 「／」の位置でだけ折り返す */}
              {settings.hero_catchphrase.split('／').map((phrase, index) => <span key={index}>{phrase}</span>)}
            </div>
            <div className="mt-8 max-md:mt-6 flex flex-wrap max-md:justify-center gap-3">
              <a
                href="#works"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 font-bold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                Works を見る
              </a>
              <a
                href={settings.hero_github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-900 px-6 py-3 font-bold text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                <GitHubIcon className="w-5 h-5 mr-2" />
                GitHub
                <span className="sr-only">（新しいタブで開きます）</span>
              </a>
            </div>
            {isAuth && (
              <div className="mt-4 flex items-center gap-3">
                <EditButton label="トップの文言を編集" isOpen={isEditing} onClick={() => setIsEditing(!isEditing)} />
                <SaveStatus status={status} onRetry={flush} />
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 pr-16 max-md:w-3/4 max-md:-mr-6 max-lg:pr-4">
          {/* WebP が使えないブラウザでは PNG を使う（mv.webp は scripts/optimize-images.mjs で作る） */}
          <picture>
            <source srcSet="/images/home/mv.webp" type="image/webp" />
            <img className="w-full h-auto" src="/images/home/mv.png" width="750" height="692" alt={settings.hero_image_alt} />
          </picture>
        </div>
      </div>
      {isAuth && isEditing && (
        <div ref={panelRef} className="flex justify-center -mt-4 mb-8 scroll-mb-28">
          <div className="w-full max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4">
            <EditPanel title="トップの文言を編集" onClose={() => setIsEditing(false)}>
              <p className="text-xs text-gray-500">名前とローマ字は、About Me の「プロフィールを編集」で変えられます。</p>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                <TextField label="名前の上の小さな文字" value={settings.hero_label} onChange={update('hero_label')} />
                <TextField label="GitHub ボタンのリンク先" type="url" value={settings.hero_github_url} onChange={update('hero_github_url')} hint="https:// から入力してください。" />
              </div>
              <TextField label="キャッチコピー" value={settings.hero_catchphrase} onChange={update('hero_catchphrase')} hint="「／」で区切ると、画面が狭いときはその位置でだけ折り返します。" />
              <TextField label="トップ画像の説明（画像が見えない人向けの文）" value={settings.hero_image_alt} onChange={update('hero_image_alt')} />
            </EditPanel>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBanner
