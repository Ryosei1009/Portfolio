import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ChevronDownIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import IconModal from './IconModal'
import { markedText } from '../../../../utils/TextUtil'
import { useAutoSave } from '../../../../utils/useAutoSave'
import { EditButton, EditPanel, MarkdownField, TextField } from '../../../_utils/EditControls'
import ImageUploadButton from '../../../_utils/ImageUploadButton'
import Achievements from './Achievements'

// introduction を「### はじめに」の手前で「概要」と「詳細」に分ける
// 見出しが無い場合は全文を概要として扱う
const splitIntroduction = (introduction) => {
    const text = introduction ?? ''
    const match = text.match(/^###\s*はじめに/m)
    if (!match) return { summary: text, detail: '' }
    return {
        summary: text.slice(0, match.index).replace(/(\s|&emsp;)+$/, ''),
        detail: text.slice(match.index),
    }
}

const saveAboutMe = (data) => (
    axios.post(`${process.env.REACT_APP_API_DOMAIN}/aboutme/update`, data, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    })
)

// 概要と「詳しく読む」に分かれて表示される様子を確認する
const IntroductionPreview = ({ introduction }) => {
    const { summary, detail } = splitIntroduction(introduction)
    return (
        <div className="flex flex-col gap-3">
            <div>
                <div className="text-xs font-bold text-emerald-700">一番上の概要</div>
                <div dangerouslySetInnerHTML={markedText(summary)} />
            </div>
            <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-bold text-emerald-700">「詳しく読む」の中</div>
                {detail ? <div dangerouslySetInnerHTML={markedText(detail)} /> : <p className="text-gray-500">（「### はじめに」の行が無いので、表示されません）</p>}
            </div>
        </div>
    )
}

const AboutMe = ({ isAuth, onLoaded, onProfileChange }) => {
    const [iconOpen, setIconOpen] = useState(false)
    const [profile, setProfile] = useState()
    const [detailOpen, setDetailOpen] = useState(false)
    // 開いている編集欄（'profile' | 'introduction-top' | 'introduction-detail' | 'history' | 'skill'）
    const [editing, setEditing] = useState(null)

    const { reset } = useAutoSave(profile, saveAboutMe)

    useEffect(() => {
        async function fetchAboutMe() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/aboutme/get`);
                const data = await response.json();
                // 読み込んだ値は保存済みとして扱う
                reset(data[0])
                setProfile(data[0]);
            } catch (error) {
                console.error('Error fetching new item list:', error);
            } finally {
                onLoaded?.()
            }
        }
        fetchAboutMe();
    }, [])

    useEffect(() => {
        if (profile) onProfileChange?.(profile)
    }, [profile])

    const update = (key) => (value) => setProfile((prev) => ({ ...prev, [key]: value }))
    const toggle = (key) => setEditing((prev) => (prev === key ? null : key))
    const isEditing = (key) => isAuth && editing === key

    const { summary, detail } = splitIntroduction(profile?.introduction)

    const introductionPanel = (key) => isEditing(key) && (
        <EditPanel title="自己紹介の文章を編集" onClose={() => setEditing(null)} className="mt-4">
            <MarkdownField
                label="自己紹介（Markdown）"
                value={profile.introduction}
                onChange={update('introduction')}
                hint="「### はじめに」の行より前が一番上の概要に、その行から後ろが「詳しく読む」の中に表示されます。"
                preview={<IntroductionPreview introduction={profile.introduction} />}
            />
        </EditPanel>
    )

    return (
        <>
            <div id="about" className="flex justify-center my-24 scroll-mt-16">
                <div className="text-black w-full max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 flex flex-col justify-center">
                    <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0">
                        About Me<span className="ml-4 text-xl">自己紹介</span>
                    </div>
                    {profile && (
                        <>
                            {/* 要約 */}
                            <div className="mt-6 rounded-2xl border-l-8 border-main bg-gray-50 p-8 max-md:p-5 flex max-md:flex-col gap-8 max-md:gap-4">
                                <div className="shrink-0 w-48 max-md:w-full flex flex-col items-center text-center">
                                    <img loading="lazy" onClick={() => setIconOpen(true)} src={profile.image} alt={`${profile.name}のプロフィール写真`} className="w-32 h-32 max-md:w-24 max-md:h-24 object-cover border-white border-4 rounded-full shadow cursor-pointer hover:opacity-80" />
                                    <div className="mt-3 font-bold text-2xl max-md:text-xl">{profile.name}</div>
                                    <div className="font-bold text-gray-600">{profile.sub_name}</div>
                                    <div className="mt-3 flex flex-col max-md:flex-row max-md:flex-wrap max-md:justify-center gap-x-4 gap-y-1 text-sm">
                                        <a className="flex items-center hover:opacity-80 w-fit" href={`mailto:${profile.mail}`} target="_blank" rel="noopener noreferrer">
                                            <EnvelopeIcon className="w-5 h-5 mr-1 shrink-0"></EnvelopeIcon>{profile.mail}
                                        </a>
                                        <a className="flex items-center hover:opacity-80 w-fit" href={profile.github_url} target="_blank" rel="noopener noreferrer">
                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 mr-1 shrink-0 fill-black"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"></path></svg>
                                            {profile.github_name}
                                        </a>
                                    </div>
                                    {isAuth && (
                                        <>
                                            <EditButton label="プロフィールを編集" isOpen={editing === 'profile'} onClick={() => toggle('profile')} className="mt-3" />
                                            <ImageUploadButton
                                                label="写真を変更"
                                                endpoint="/aboutme/update_image"
                                                hint="正方形に切り抜きます（中央）。JPEG・PNG・WebP、10MBまで。"
                                                doneMessage="写真を変更しました"
                                                onUploaded={(data) => update('image')(data.image)}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="flex-1">
                                    {isAuth && (
                                        <div className="mb-2 flex justify-end">
                                            <EditButton label="概要を編集" isOpen={editing === 'introduction-top'} onClick={() => toggle('introduction-top')} />
                                        </div>
                                    )}
                                    <div className="leading-relaxed max-md:text-sm" dangerouslySetInnerHTML={markedText(summary)} />
                                </div>
                            </div>
                            {isEditing('profile') && (
                                <EditPanel title="プロフィールを編集" onClose={() => setEditing(null)} className="mt-4">
                                    <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                        <TextField label="名前" value={profile.name} onChange={update('name')} />
                                        <TextField label="名前（ローマ字）" value={profile.sub_name} onChange={update('sub_name')} />
                                        <TextField label="メールアドレス" type="email" value={profile.mail} onChange={update('mail')} />
                                        <TextField label="GitHub の表示名" value={profile.github_name} onChange={update('github_name')} />
                                        <TextField label="GitHub の URL" type="url" value={profile.github_url} onChange={update('github_url')} hint="https:// から入力してください" />
                                    </div>
                                </EditPanel>
                            )}
                            {introductionPanel('introduction-top')}

                            {/* 実績 */}
                            <Achievements isAuth={isAuth} />

                            {/* 経歴・資格 */}
                            <div className="mt-6 grid grid-cols-2 max-md:grid-cols-1 gap-4 max-md:text-sm">
                                {[
                                    { key: 'history', title: '経歴' },
                                    { key: 'skill', title: '資格' },
                                ].map(({ key, title }) => (
                                    <div key={key} className="rounded-2xl border border-gray-200 p-6 max-md:p-5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4>{title}</h4>
                                            {isAuth && <EditButton isOpen={editing === key} onClick={() => toggle(key)} />}
                                        </div>
                                        <div className="mt-2 ml-2" dangerouslySetInnerHTML={markedText(profile[key])} />
                                    </div>
                                ))}
                            </div>
                            {isEditing('history') && (
                                <EditPanel title="経歴を編集" onClose={() => setEditing(null)} className="mt-4">
                                    <MarkdownField label="経歴（Markdown）" value={profile.history} onChange={update('history')} hint="1行に1項目。行の終わりで改行されます。" />
                                </EditPanel>
                            )}
                            {isEditing('skill') && (
                                <EditPanel title="資格を編集" onClose={() => setEditing(null)} className="mt-4">
                                    <MarkdownField label="資格（Markdown）" value={profile.skill} onChange={update('skill')} hint="1行に1項目。行の終わりで改行されます。" />
                                </EditPanel>
                            )}

                            {/* 詳細（折りたたみ） */}
                            {(detail || isAuth) && (
                                <div className="mt-6">
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {detail && (
                                            <button
                                                type="button"
                                                onClick={() => setDetailOpen(!detailOpen)}
                                                aria-expanded={detailOpen}
                                                aria-controls="aboutme-detail"
                                                className="flex items-center rounded-full border-2 border-gray-900 px-6 py-2 font-bold hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
                                            >
                                                {detailOpen ? '閉じる' : '詳しく読む'}
                                                <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                        {isAuth && (
                                            <EditButton label="「詳しく読む」の文章を編集" isOpen={editing === 'introduction-detail'} onClick={() => toggle('introduction-detail')} />
                                        )}
                                    </div>
                                    {introductionPanel('introduction-detail')}
                                    {detail && (
                                        <div
                                            id="aboutme-detail"
                                            hidden={!detailOpen}
                                            className="mt-6 rounded-2xl border border-gray-200 p-8 max-md:p-5 leading-relaxed max-md:text-sm"
                                            dangerouslySetInnerHTML={markedText(detail)}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div >
                <IconModal iconOpen={iconOpen} setIconOpen={setIconOpen} src={profile?.image} alt={profile ? `${profile.name}のプロフィール写真` : 'プロフィール写真'} />
            </div >
        </>
    )
}

export default AboutMe
