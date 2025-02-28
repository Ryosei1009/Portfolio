import React from 'react'

const TopBanner = () => {
  return (
    <>
      <div id="topbanner" className="h-screen flex max-md:flex-col-reverse justify-center items-center bg-white">
        <div className="w-1/2 max-md:w-full pr-8 max-lg:pr-3 max-md:pr-0 max-md:pt-4">
          <div className="text-6xl max-xl:text-5xl max-lg:text-4xl max-md:text-5xl max-sm:text-4xl font-bold text-end max-md:text-center">
            Ryosei Shinohara's
          </div>
          <div className="text-6xl max-xl:text-5xl max-lg:text-4xl max-md:text-5xl max-sm:text-4xl font-bold text-end max-md:text-center">
            Portfolio Website
          </div>
        </div>
        <div className="w-1/2 pr-16 max-md:w-3/4 max-md:-mr-6 max-lg:pr-4">
          <img className="w-full" src="/images/home/mv.png" alt="" />
        </div>
      </div>
    </>
  )
}

export default TopBanner