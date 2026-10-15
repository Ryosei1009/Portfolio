import React, { useEffect, useState } from 'react'
import { ChevronDownIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import IconModal from './IconModal'
import { markedText } from '../../../../utils/TextUtil'
import EditAboutMe from './EditAboutMe'

const achievements = [
    { value: '6,000人', label: 'ゲームサーバーのコミュニティ規模（Discordメンバー）' },
    { value: '約1,000万円', label: '寄付による累計売上（約63,000$）' },
    { value: '40人→80人', label: '文化祭の運営メンバーを拡大（実行委員長）' },
]

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

const AboutMe = ({ isAuth }) => {
    const [iconOpen, setIconOpen] = useState(false)
    const [aboutMe, setAboutMe] = useState()
    const [detailOpen, setDetailOpen] = useState(false)


    useEffect(() => {
        async function fetchAboutMe() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/aboutme/get`);
                const data = await response.json();
                setAboutMe(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching new item list:', error);
            }
        }
        fetchAboutMe();
    }, [])

    const { summary, detail } = splitIntroduction(aboutMe?.[0]?.introduction)

    return (
        <>
            <div id="about" className="flex justify-center my-24 scroll-mt-16">
                <div className="text-black w-full max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 flex flex-col justify-center">
                    <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0">
                        About Me<span className="ml-4 text-xl">自己紹介</span>
                    </div>
                    {aboutMe && (
                        isAuth ? (
                            <EditAboutMe aboutMe={aboutMe} setIconOpen={setIconOpen} />
                        ) : (
                            <>
                                {/* 要約 */}
                                <div className="mt-6 rounded-2xl border-l-8 border-main bg-gray-50 p-8 max-md:p-5 flex max-md:flex-col gap-8 max-md:gap-4">
                                    <div className="shrink-0 w-48 max-md:w-full flex flex-col items-center text-center">
                                        <img loading="lazy" onClick={() => setIconOpen(true)} src={aboutMe[0].image} alt={`${aboutMe[0].name}のプロフィール写真`} className="w-32 h-32 max-md:w-24 max-md:h-24 object-cover border-white border-4 rounded-full shadow cursor-pointer hover:opacity-80" />
                                        <div className="mt-3 font-bold text-2xl max-md:text-xl">{aboutMe[0].name}</div>
                                        <div className="font-bold text-gray-600">{aboutMe[0].sub_name}</div>
                                        <div className="mt-3 flex flex-col max-md:flex-row max-md:flex-wrap max-md:justify-center gap-x-4 gap-y-1 text-sm">
                                            <a className="flex items-center hover:opacity-80 w-fit" href={`mailto:${aboutMe[0].mail}`} target="_blank" rel="noopener noreferrer">
                                                <EnvelopeIcon className="w-5 h-5 mr-1 shrink-0"></EnvelopeIcon>{aboutMe[0].mail}
                                            </a>
                                            <a className="flex items-center hover:opacity-80 w-fit" href={aboutMe[0].github_url} target="_blank" rel="noopener noreferrer">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 mr-1 shrink-0 fill-black"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"></path></svg>
                                                {aboutMe[0].github_name}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex-1 leading-relaxed max-md:text-sm" dangerouslySetInnerHTML={markedText(summary)} />
                                </div>

                                {/* 実績 */}
                                <div className="mt-6 grid grid-cols-3 max-md:grid-cols-1 gap-4">
                                    {achievements.map((item) => (
                                        <div key={item.value} className="rounded-2xl border border-gray-200 border-t-4 border-t-main bg-white p-6 max-md:p-5 shadow-sm text-center">
                                            <div className="text-4xl max-lg:text-3xl font-bold">{item.value}</div>
                                            <div className="mt-2 text-sm text-gray-600">{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* 経歴・スキル */}
                                <div className="mt-6 grid grid-cols-2 max-md:grid-cols-1 gap-4 max-md:text-sm">
                                    <div className="rounded-2xl border border-gray-200 p-6 max-md:p-5">
                                        <h4>経歴</h4>
                                        <div className="mt-2 ml-2" dangerouslySetInnerHTML={markedText(aboutMe[0].history)} />
                                    </div>
                                    <div className="rounded-2xl border border-gray-200 p-6 max-md:p-5">
                                        <h4>スキル</h4>
                                        <div className="mt-2 ml-2" dangerouslySetInnerHTML={markedText(aboutMe[0].skill)} />
                                    </div>
                                </div>

                                {/* 詳細（折りたたみ） */}
                                {detail && (
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setDetailOpen(!detailOpen)}
                                            aria-expanded={detailOpen}
                                            aria-controls="aboutme-detail"
                                            className="mx-auto flex items-center rounded-full border-2 border-gray-900 px-6 py-2 font-bold hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
                                        >
                                            {detailOpen ? '閉じる' : '詳しく読む'}
                                            <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <div
                                            id="aboutme-detail"
                                            hidden={!detailOpen}
                                            className="mt-6 rounded-2xl border border-gray-200 p-8 max-md:p-5 leading-relaxed max-md:text-sm"
                                            dangerouslySetInnerHTML={markedText(detail)}
                                        />
                                    </div>
                                )}
                            </>
                        )
                    )}
                </div >
                <IconModal iconOpen={iconOpen} setIconOpen={setIconOpen} alt={aboutMe ? `${aboutMe[0].name}のプロフィール写真` : 'プロフィール写真'} />
            </div >
        </>
    )
}

export default AboutMe
