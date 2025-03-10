import React from 'react'
import TopBanner from './components/TopBanner'
import Works from './components/Works/Works'
import AboutMe from './components/AboutMe/AboutMe'

const Home = ({ isAuth }) => {
  return (
    <>
      <TopBanner />
      <AboutMe isAuth={isAuth} />
      <Works isAuth={isAuth} />
    </>
  )
}

export default Home