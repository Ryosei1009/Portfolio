import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopBanner from './components/TopBanner'
import Works from './components/Works/Works'
import AboutMe from './components/AboutMe/AboutMe'

const Home = ({ isAuth }) => {
  const { hash } = useLocation()
  const [loaded, setLoaded] = useState({ aboutMe: false, works: false })
  const scrolled = useRef(false)
  // ヒーローの名前は About Me の名前を使う（編集するとヒーローにもすぐ反映される）
  const [profile, setProfile] = useState()

  // ログイン画面などから「/#works」で来たときは、内容が出そろってから該当の位置へ移動する
  useEffect(() => {
    if (scrolled.current || !hash || !loaded.aboutMe || !loaded.works) return
    scrolled.current = true
    document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash, loaded])

  return (
    <>
      <TopBanner isAuth={isAuth} profile={profile} />
      <AboutMe isAuth={isAuth} onLoaded={() => setLoaded((prev) => ({ ...prev, aboutMe: true }))} onProfileChange={setProfile} />
      <Works isAuth={isAuth} onLoaded={() => setLoaded((prev) => ({ ...prev, works: true }))} />
    </>
  )
}

export default Home
