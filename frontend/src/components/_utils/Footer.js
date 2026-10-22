import React from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, EnvelopeIcon } from '@heroicons/react/24/solid'

const linkClass = 'inline-flex min-h-11 items-center gap-1 px-2 hover:opacity-60'

// profile: About Me の内容（GitHub とメールアドレスに使う）。読み込む前は、ページ内リンクだけを出す
const Footer = ({ profile }) => {
  // トップ以外のページ（ログイン画面など）からはトップの各セクションへ移動する
  const { pathname } = useLocation()
  const base = pathname === '/' ? '' : '/'

  return (
    <footer className="bg-black bg-opacity-10 py-8 text-lg">
      <div className="mx-auto px-4 flex flex-col items-center gap-3">
        <nav aria-label="フッター">
          <ul className="flex flex-wrap justify-center gap-x-4 text-base">
            <li><a className={linkClass} href={`${base}#top`}>TOP</a></li>
            <li><a className={linkClass} href={`${base}#about`}>About Me</a></li>
            <li><a className={linkClass} href={`${base}#works`}>Works</a></li>
          </ul>
        </nav>
        {(profile?.github_url || profile?.mail) && (
          <ul className="flex flex-wrap justify-center gap-x-4 text-base">
            {profile.github_url && (
              <li>
                <a className={linkClass} href={profile.github_url} target="_blank" rel="noopener noreferrer">
                  GitHub
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </li>
            )}
            {profile.mail && (
              <li>
                <a className={linkClass} href={`mailto:${profile.mail}`}>
                  <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                  {profile.mail}
                </a>
              </li>
            )}
          </ul>
        )}
        <p>©{new Date().getFullYear()} Ryosei Shinohara</p>
      </div>
    </footer>
  )
}

export default Footer
